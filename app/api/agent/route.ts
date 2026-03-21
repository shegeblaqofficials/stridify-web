import { NextRequest, after } from "next/server";
import { createAgentUIStreamResponse } from "ai";
import {
  createCodingAgent,
  type AgentMessageMetadata,
} from "@/lib/agents/coding-agent";
import {
  createSandboxFromTemplate,
  createSandboxFromSnapshot,
  getExistingSandbox,
  takeSandboxSnapshot,
} from "@/lib/sandbox/manager";
import { getLatestSnapshot, createSnapshot } from "@/lib/snapshot/actions";
import { getProject, updateProjectSandbox } from "@/lib/project/actions";
import {
  createMetric,
  deductOrganizationTokens,
  getOrganizationBalance,
} from "@/lib/metric/actions";

export async function POST(req: NextRequest) {
  const { messages, projectId } = await req.json();
  console.log(
    `[route] POST /api/agent — projectId=${projectId}, messages=${messages?.length}`,
  );

  if (!projectId || !messages) {
    console.log("[route] missing projectId or messages");
    return Response.json(
      { error: "Missing projectId or messages" },
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

  // If no running sandbox, create from snapshot or template
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

  // Create the agent bound to this sandbox
  const agent = createCodingAgent(sandbox);
  console.log("[route] agent created, starting stream...");

  // Accumulate token usage across all steps
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let stepCount = 0;
  let balanceExhausted = false;
  const abortController = new AbortController();

  // After the response is sent, take a snapshot and log token metrics
  after(async () => {
    try {
      const snapshotId = await takeSandboxSnapshot(sandbox);
      await createSnapshot(
        projectId,
        project.organization_id,
        snapshotId,
        `v${(latestSnapshot?.version_number ?? 0) + 1}`,
      );
      console.log(`[agent] snapshot ${snapshotId} saved for ${projectId}`);
    } catch (err) {
      console.error("[agent] snapshot failed:", err);
    }

    // Log token usage metrics
    try {
      console.log(
        `[metric] logging tokens — input=${totalInputTokens} output=${totalOutputTokens} steps=${stepCount}`,
      );
      await createMetric({
        metric_id: crypto.randomUUID(),
        project_id: projectId,
        organization_id: project.organization_id,
        type: "coding-agent-session",
        input_token_count: totalInputTokens,
        output_token_count: totalOutputTokens,
      });
      console.log(`[metric] token metrics saved for ${projectId}`);

      // Deduct total tokens used from the organization balance
      const totalTokensUsed = totalInputTokens + totalOutputTokens;
      await deductOrganizationTokens(project.organization_id, totalTokensUsed);
    } catch (err) {
      console.error("[metric] failed to save metrics:", err);
    }
  });

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    messageMetadata({ part }): AgentMessageMetadata | undefined {
      if (part.type === "finish-step") {
        return {
          tokenUsage: {
            inputTokens: totalInputTokens,
            outputTokens: totalOutputTokens,
            totalTokens: totalInputTokens + totalOutputTokens,
          },
        };
      }
      if (part.type === "finish") {
        return {
          tokenUsage: {
            inputTokens: totalInputTokens,
            outputTokens: totalOutputTokens,
            totalTokens: totalInputTokens + totalOutputTokens,
          },
        };
      }
      return undefined;
    },
    onStepFinish({ stepNumber, usage, finishReason, toolCalls }) {
      totalInputTokens += usage.inputTokens ?? 0;
      totalOutputTokens += usage.outputTokens ?? 0;
      stepCount = stepNumber;
      console.log(`[agent] step ${stepNumber} finished:`, {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalInputTokens,
        totalOutputTokens,
        finishReason,
        toolsUsed: toolCalls?.map((tc) => tc.toolName),
      });

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
    abortSignal: abortController.signal,
  });
}
