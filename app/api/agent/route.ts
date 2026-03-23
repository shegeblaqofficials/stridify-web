import { NextRequest, after } from "next/server";
import { createAgentUIStreamResponse, createIdGenerator } from "ai";
import {
  createCodingAgent,
  type AgentMessageMetadata,
} from "@/lib/agents/coding-agent";
import {
  createSandboxFromTemplate,
  createSandboxFromSnapshot,
  getExistingSandbox,
  takeSandboxSnapshot,
  extendSandboxTimeout,
} from "@/lib/sandbox/manager";
import { getLatestSnapshot, createSnapshot } from "@/lib/snapshot/actions";
import { getProject, updateProjectSandbox } from "@/lib/project/actions";
import {
  deductOrganizationTokens,
  getOrganizationBalance,
  recordSessionMetric,
} from "@/lib/redis/metrics";
import { loadChatMessages, saveChatMessages } from "@/lib/redis/chat";

export async function POST(req: NextRequest) {
  const { message, id: chatId, projectId } = await req.json();
  console.log(
    `[route] POST /api/agent — projectId=${projectId}, chatId=${chatId}`,
  );

  if (!projectId || !message) {
    console.log("[route] missing projectId or message");
    return Response.json(
      { error: "Missing projectId or message" },
      { status: 400 },
    );
  }

  const project = await getProject(projectId);
  if (!project) {
    console.log(`[route] project not found: ${projectId}`);
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  // Check organization token balance before proceeding
  const balance = await getOrganizationBalance(project.organization_id);
  if (balance <= 0) {
    console.log(
      `[route] insufficient balance for org ${project.organization_id}`,
    );
    return Response.json({ error: "insufficient_balance" }, { status: 402 });
  }

  // Load previous messages from Redis, append the new one
  const previousMessages = await loadChatMessages(projectId);
  const messages = [...previousMessages, message];
  console.log(
    `[route] loaded ${previousMessages.length} previous messages, total=${messages.length}`,
  );

  const latestSnapshot = await getLatestSnapshot(projectId);
  console.log(
    `[route] latestSnapshot=${latestSnapshot?.snapshot_id ?? "none"}`,
  );

  // Try to reconnect to existing sandbox first
  let sandbox;
  let previewUrl: string = "";

  if (project.sandbox_id) {
    const existing = await getExistingSandbox(project.sandbox_id);
    if (existing) {
      console.log(
        `[route] reusing existing sandbox ${existing.sandbox.sandboxId}`,
      );
      sandbox = existing.sandbox;
      previewUrl = existing.previewUrl;
    }
  }

  // Re-fetch project in case warmup just created a sandbox while we were loading
  if (!sandbox) {
    const freshProject = await getProject(projectId);
    if (
      freshProject?.sandbox_id &&
      freshProject.sandbox_id !== project.sandbox_id
    ) {
      console.log(
        `[route] warmup created sandbox ${freshProject.sandbox_id}, trying to connect...`,
      );
      const existing = await getExistingSandbox(freshProject.sandbox_id);
      if (existing) {
        sandbox = existing.sandbox;
        previewUrl = existing.previewUrl;
      }
    }
  }

  // If still no running sandbox, create from snapshot or template
  if (!sandbox) {
    console.log("[route] creating new sandbox...");
    const created = latestSnapshot
      ? await createSandboxFromSnapshot(latestSnapshot.snapshot_id)
      : await createSandboxFromTemplate();
    sandbox = created.sandbox;
    previewUrl = created.previewUrl;
  }

  console.log(`[route] sandbox=${sandbox.sandboxId} previewUrl=${previewUrl}`);

  // Update project with sandbox info
  await updateProjectSandbox(projectId, sandbox.sandboxId, previewUrl);

  // Extend timeout before the agent starts working
  await extendSandboxTimeout(sandbox);

  // Create the agent bound to this sandbox
  const agent = createCodingAgent(sandbox);
  console.log("[route] agent created, starting stream...");

  // Accumulate token usage across all steps
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let stepCount = 0;
  let balanceExhausted = false;
  const abortController = new AbortController();

  // After the response is sent, snapshot (only if exhausted) and log token metrics
  after(async () => {
    // Only snapshot when balance is exhausted — this stops the sandbox
    // and preserves the state for next session. When the agent finishes
    // normally, we leave the sandbox running so the preview stays alive.
    if (balanceExhausted) {
      try {
        const snapshotId = await takeSandboxSnapshot(sandbox);
        await createSnapshot(
          projectId,
          project.organization_id,
          snapshotId,
          `v${(latestSnapshot?.version_number ?? 0) + 1}`,
        );
        console.log(
          `[agent] snapshot ${snapshotId} saved for ${projectId} (balance exhausted)`,
        );
      } catch (err) {
        console.error("[agent] snapshot failed:", err);
      }
    }

    // Record session metrics and deduct tokens — all via Redis
    try {
      const totalTokensUsed = totalInputTokens + totalOutputTokens;
      console.log(
        `[metric] logging tokens — input=${totalInputTokens} output=${totalOutputTokens} steps=${stepCount}`,
      );

      await Promise.all([
        recordSessionMetric({
          organizationId: project.organization_id,
          projectId,
          projectTitle: project.title,
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
        }),
        deductOrganizationTokens(project.organization_id, totalTokensUsed),
      ]);

      console.log(
        `[metric] session recorded & tokens deducted for ${projectId}`,
      );
    } catch (err) {
      console.error("[metric] failed to save metrics:", err);
    }
  });

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    // Generate consistent server-side IDs for persistence
    generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
    messageMetadata({ part }): AgentMessageMetadata | undefined {
      // Accumulate tokens here because messageMetadata fires BEFORE
      // onStepFinish in the SDK stream pipeline (the eventProcessor
      // enqueues the chunk downstream before awaiting onStepFinish).
      if (part.type === "finish-step") {
        totalInputTokens += part.usage.inputTokens ?? 0;
        totalOutputTokens += part.usage.outputTokens ?? 0;
        return {
          tokenUsage: {
            inputTokens: totalInputTokens,
            outputTokens: totalOutputTokens,
            totalTokens: totalInputTokens + totalOutputTokens,
          },
          ...(balanceExhausted && { balanceExhausted: true }),
        };
      }
      if (part.type === "finish") {
        return {
          tokenUsage: {
            inputTokens: totalInputTokens,
            outputTokens: totalOutputTokens,
            totalTokens: totalInputTokens + totalOutputTokens,
          },
          ...(balanceExhausted && { balanceExhausted: true }),
        };
      }
      return undefined;
    },
    onStepFinish({ stepNumber, usage, finishReason, toolCalls }) {
      // Tokens are already accumulated in messageMetadata (fires first)
      stepCount = stepNumber;
      console.log(`[agent] step ${stepNumber} finished:`, {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalInputTokens,
        totalOutputTokens,
        finishReason,
        toolsUsed: toolCalls?.map((tc) => tc.toolName),
      });

      // Keep sandbox alive while the agent is still working
      extendSandboxTimeout(sandbox);

      // Check if balance is exhausted after this step
      const tokensUsedSoFar = totalInputTokens + totalOutputTokens;
      if (tokensUsedSoFar >= balance && !balanceExhausted) {
        balanceExhausted = true;
        console.log(
          `[agent] balance exhausted mid-stream (used=${tokensUsedSoFar}, balance=${balance}). Aborting.`,
        );
        abortController.abort();
      }
    },
    onFinish({ messages: finalMessages }) {
      // Persist complete chat history to Redis
      saveChatMessages(projectId, finalMessages).catch((err) =>
        console.error("[chat] failed to save messages:", err),
      );
    },
    abortSignal: abortController.signal,
  });
}
