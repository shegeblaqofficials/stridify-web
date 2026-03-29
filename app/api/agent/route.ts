import { NextRequest, after } from "next/server";
import { createAgentUIStreamResponse, createIdGenerator, UIMessage } from "ai";
import {
  createCodingAgent,
  discoverSkills,
  type AgentMessageMetadata,
} from "@/lib/agents/coding-agent";
import { createSubagentUsageTracker } from "@/lib/agents/subagent-tools";
import { extendSandboxTimeout } from "@/lib/sandbox/manager";
import { getLatestSnapshot } from "@/lib/snapshot/actions";
import { getProject, updateProjectSandbox } from "@/lib/project/actions";
import { getOrganizationBalance } from "@/lib/redis/metrics";
import { loadChatMessages, saveChatMessages } from "@/lib/redis/chat";
import {
  resolveSandbox,
  snapshotAndProvision,
  logTokenMetrics,
  deductTokensIncremental,
} from "./actions";

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

  // Capture validated values for use in closures (where TS narrowing doesn't apply)
  const organizationId = project.organization_id;
  const projectTitle = project.title;

  // Check organization token balance before proceeding
  const balance = await getOrganizationBalance(organizationId);
  if (balance <= 0) {
    console.log(`[route] insufficient balance for org ${organizationId}`);
    return Response.json({ error: "insufficient_balance" }, { status: 402 });
  }

  // Load previous messages from Redis, append the new one.
  // Filter out any messages with empty parts — the SDK requires at least one.
  const previousMessages = await loadChatMessages(projectId);
  const messages = [...previousMessages, message].filter(
    (m: UIMessage) => m.parts && m.parts.length > 0,
  );
  console.log(
    `[route] loaded ${previousMessages.length} previous messages, total=${messages.length}`,
  );

  const latestSnapshot = await getLatestSnapshot(projectId);
  console.log(
    `[route] latestSnapshot=${latestSnapshot?.snapshot_id ?? "none"}`,
  );

  // Resolve a running sandbox (reconnect, warmup, or create new)
  const { sandbox, previewUrl } = await resolveSandbox(
    projectId,
    project.sandbox_id,
    latestSnapshot,
  );
  console.log(`[route] sandbox=${sandbox.sandboxId} previewUrl=${previewUrl}`);

  // Update project with sandbox info
  await updateProjectSandbox(projectId, sandbox.sandboxId, previewUrl);

  // Extend timeout before the agent starts working
  await extendSandboxTimeout(sandbox);

  // Keep the sandbox alive while the agent is working.
  // onStepFinish only fires between orchestrator steps — a single subagent
  // can run for many minutes, so we need a periodic heartbeat.
  const keepalive = setInterval(() => {
    extendSandboxTimeout(sandbox).catch(() => {});
  }, 60_000);

  // Create the agent bound to this sandbox
  const subagentUsageTracker = createSubagentUsageTracker();

  // Discover available skills from host filesystem (loads only metadata)
  console.log("[route] discovering skills...");
  const skills = await discoverSkills();
  console.log(
    `[route] discovered ${skills.length} skills: ${skills.map((s) => s.name).join(", ")}`,
  );

  const agent = createCodingAgent(sandbox, subagentUsageTracker, skills);
  console.log("[route] agent created, starting stream...");

  // Accumulate token usage across all steps.
  // `orchestratorInput/OutputTokens` track the orchestrator's own LLM calls.
  // `subagentUsageTracker` accumulates subagent LLM usage separately
  // (updated by each subagent tool after its stream completes).
  let orchestratorInputTokens = 0;
  let orchestratorOutputTokens = 0;
  let stepCount = 0;
  let balanceExhausted = false;
  let tokensDeductedSoFar = 0;
  let liveBalance = balance;
  const abortController = new AbortController();

  /** Combined total across orchestrator + all subagents. */
  const getTotalUsage = () => ({
    inputTokens: orchestratorInputTokens + subagentUsageTracker.inputTokens,
    outputTokens: orchestratorOutputTokens + subagentUsageTracker.outputTokens,
    get totalTokens() {
      return this.inputTokens + this.outputTokens;
    },
  });

  const nextVersion = (latestSnapshot?.version_number ?? 0) + 1;

  // After the response is sent, log token metrics (fire-and-forget).
  // Only deducts the remainder not already covered by incremental deductions.
  after(async () => {
    const usage = getTotalUsage();
    console.log(
      `[metric] orchestrator: in=${orchestratorInputTokens} out=${orchestratorOutputTokens} | subagents: in=${subagentUsageTracker.inputTokens} out=${subagentUsageTracker.outputTokens} | steps=${stepCount} | deductedSoFar=${tokensDeductedSoFar}`,
    );
    await logTokenMetrics(
      organizationId,
      projectId,
      projectTitle,
      usage,
      tokensDeductedSoFar,
    );
  });

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    // Generate consistent server-side IDs for persistence
    generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
    messageMetadata({ part }): AgentMessageMetadata | undefined {
      // Accumulate orchestrator tokens here because messageMetadata fires BEFORE
      // onStepFinish in the SDK stream pipeline (the eventProcessor
      // enqueues the chunk downstream before awaiting onStepFinish).
      if (part.type === "finish-step") {
        orchestratorInputTokens += part.usage.inputTokens ?? 0;
        orchestratorOutputTokens += part.usage.outputTokens ?? 0;
        const usage = getTotalUsage();
        return {
          tokenUsage: {
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
          },
          ...(balanceExhausted && { balanceExhausted: true }),
        };
      }
      if (part.type === "finish") {
        const usage = getTotalUsage();
        return {
          tokenUsage: {
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
          },
          ...(balanceExhausted && { balanceExhausted: true }),
        };
      }
      return undefined;
    },
    onStepFinish({ stepNumber, usage, finishReason, toolCalls }) {
      // Tokens are already accumulated in messageMetadata (fires first)
      stepCount = stepNumber;
      const combined = getTotalUsage();
      console.log(`[agent] step ${stepNumber} finished:`, {
        stepInputTokens: usage.inputTokens,
        stepOutputTokens: usage.outputTokens,
        orchestratorInputTokens,
        orchestratorOutputTokens,
        subagentInputTokens: subagentUsageTracker.inputTokens,
        subagentOutputTokens: subagentUsageTracker.outputTokens,
        combinedInputTokens: combined.inputTokens,
        combinedOutputTokens: combined.outputTokens,
        finishReason,
        toolsUsed: toolCalls?.map((tc) => tc?.toolName),
      });

      // Keep sandbox alive while the agent is still working
      extendSandboxTimeout(sandbox);

      // Incrementally deduct tokens used since last deduction
      const delta = combined.totalTokens - tokensDeductedSoFar;
      if (delta > 0) {
        const deductAmount = delta;
        tokensDeductedSoFar = combined.totalTokens;
        deductTokensIncremental(organizationId, deductAmount).then(
          (newBalance) => {
            if (newBalance >= 0) liveBalance = newBalance;
          },
        );
      }

      // Check if balance is exhausted after this step
      if (liveBalance <= 0 && !balanceExhausted) {
        balanceExhausted = true;
        console.log(
          `[agent] balance exhausted mid-stream (used=${combined.totalTokens}, liveBalance=${liveBalance}). Snapshotting & aborting.`,
        );
        snapshotAndProvision(sandbox, projectId, organizationId, nextVersion)
          .then(() => abortController.abort())
          .catch(() => abortController.abort());
      }
    },
    async onFinish({ messages: finalMessages }) {
      clearInterval(keepalive);

      try {
        await saveChatMessages(projectId, finalMessages);
      } catch (err) {
        console.error("[chat] failed to save messages:", err);
      }

      // Snapshot and create a new sandbox BEFORE the stream closes.
      // This ensures the UI's onStreamingComplete refetch sees the
      // updated project with the new sandbox's preview URL.
      if (!balanceExhausted) {
        await snapshotAndProvision(
          sandbox,
          projectId,
          organizationId,
          nextVersion,
        );
      }
    },
    abortSignal: abortController.signal,
  });
}
