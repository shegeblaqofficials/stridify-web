import { tool, readUIMessageStream } from "ai";
import { z } from "zod";
import type { Sandbox } from "@vercel/sandbox";
import { createCreativeAgent } from "./subagents/creative-agent";
import { createSandboxAgent } from "./subagents/sandbox-agent";
import { createContentAgent } from "./subagents/content-agent";
import { createImageAgent } from "./subagents/image-agent";

/**
 * Mutable accumulator for subagent token usage.
 * Shared between all subagent tools so the parent route handler
 * can read the totals after the agent finishes.
 */
export interface SubagentUsageTracker {
  inputTokens: number;
  outputTokens: number;
}

export function createSubagentUsageTracker(): SubagentUsageTracker {
  return { inputTokens: 0, outputTokens: 0 };
}

/**
 * Extract the last text part from a UIMessage as a summary for the parent model.
 * This keeps the orchestrator's context clean — it only sees summaries, not
 * the full subagent execution trace.
 */
function extractSummary(
  message: { parts?: Array<{ type: string; text?: string }> } | undefined,
) {
  const lastTextPart = message?.parts?.findLast(
    (p: { type: string }) => p.type === "text",
  );
  return {
    type: "text" as const,
    value:
      (lastTextPart as { text?: string } | undefined)?.text ??
      "Task completed.",
  };
}

/**
 * Creates a streaming subagent tool for creative page design.
 * Delegates to a specialized agent with an expensive model for high-quality output.
 */
export function createDesignPageTool(
  sandbox: Sandbox,
  tracker: SubagentUsageTracker,
) {
  const agent = createCreativeAgent(sandbox);

  return tool({
    description:
      "Delegate a page design or major UI creation task to a specialized creative agent. " +
      "Use for building new pages, creating complex layouts, designing components from scratch, " +
      "or any task requiring strong design sensibility. The creative agent has access to " +
      "readFile, writeFile, and listFiles tools.",
    inputSchema: z.object({
      task: z
        .string()
        .describe(
          "Detailed description of what to design/build. Include specifics about layout, style, " +
            "content structure, color scheme, and any reference to existing files.",
        ),
    }),
    execute: async function* ({ task }, { abortSignal }) {
      const result = await agent.stream({
        prompt: task,
        abortSignal,
      });

      for await (const message of readUIMessageStream({
        stream: result.toUIMessageStream(),
      })) {
        yield message;
      }

      // Capture subagent LLM token usage after the stream is fully consumed
      const usage = await result.totalUsage;
      tracker.inputTokens += usage.inputTokens ?? 0;
      tracker.outputTokens += usage.outputTokens ?? 0;
      console.log(
        `[subagent:designPage] usage — input=${usage.inputTokens} output=${usage.outputTokens} (tracker total: in=${tracker.inputTokens} out=${tracker.outputTokens})`,
      );
    },
    toModelOutput: ({ output }) => extractSummary(output),
  });
}

/**
 * Creates a streaming subagent tool for sandbox/file operations.
 * Handles package installs, running commands, file manipulation, and debugging.
 */
export function createEditSandboxTool(
  sandbox: Sandbox,
  tracker: SubagentUsageTracker,
) {
  const agent = createSandboxAgent(sandbox);

  return tool({
    description:
      "Delegate file operations, package installations, command execution, or debugging tasks " +
      "to a sandbox operations agent. Use for installing dependencies, running build commands, " +
      "exploring the filesystem, reading logs, fixing errors, or any technical sandbox task. " +
      "The sandbox agent has access to readFile, writeFile, listFiles, and runCommand tools.",
    inputSchema: z.object({
      task: z
        .string()
        .describe(
          "Detailed description of the operations to perform. Include file paths, " +
            "package names, commands, or error messages as relevant.",
        ),
    }),
    execute: async function* ({ task }, { abortSignal }) {
      const result = await agent.stream({
        prompt: task,
        abortSignal,
      });

      for await (const message of readUIMessageStream({
        stream: result.toUIMessageStream(),
      })) {
        yield message;
      }

      const usage = await result.totalUsage;
      tracker.inputTokens += usage.inputTokens ?? 0;
      tracker.outputTokens += usage.outputTokens ?? 0;
      console.log(
        `[subagent:editSandbox] usage — input=${usage.inputTokens} output=${usage.outputTokens} (tracker total: in=${tracker.inputTokens} out=${tracker.outputTokens})`,
      );
    },
    toModelOutput: ({ output }) => extractSummary(output),
  });
}

/**
 * Creates a streaming subagent tool for content/text editing.
 * Makes targeted changes to text, colors, spacing, and minor design tweaks.
 */
export function createEditContentTool(
  sandbox: Sandbox,
  tracker: SubagentUsageTracker,
) {
  const agent = createContentAgent(sandbox);

  return tool({
    description:
      "Delegate content editing or minor design tweaks to a content editor agent. " +
      "Use for updating text, changing colors, adjusting spacing, modifying typography, " +
      "tweaking layouts, or any targeted change that doesn't require creating new pages. " +
      "The content agent has access to readFile and writeFile tools.",
    inputSchema: z.object({
      task: z
        .string()
        .describe(
          "Detailed description of the content/styling changes to make. Include file paths, " +
            "specific text to change, color values, or design details.",
        ),
    }),
    execute: async function* ({ task }, { abortSignal }) {
      const result = await agent.stream({
        prompt: task,
        abortSignal,
      });

      for await (const message of readUIMessageStream({
        stream: result.toUIMessageStream(),
      })) {
        yield message;
      }

      const usage = await result.totalUsage;
      tracker.inputTokens += usage.inputTokens ?? 0;
      tracker.outputTokens += usage.outputTokens ?? 0;
      console.log(
        `[subagent:editContent] usage — input=${usage.inputTokens} output=${usage.outputTokens} (tracker total: in=${tracker.inputTokens} out=${tracker.outputTokens})`,
      );
    },
    toModelOutput: ({ output }) => extractSummary(output),
  });
}

/**
 * Creates a streaming subagent tool for image generation.
 * Generates images with DALL-E 3 and places them in the sandbox.
 */
export function createGenerateImageTool(
  sandbox: Sandbox,
  tracker: SubagentUsageTracker,
) {
  const agent = createImageAgent(sandbox);

  return tool({
    description:
      "Delegate image generation to an image specialist agent. " +
      "Use when the user needs custom images, photos, illustrations, icons, or backgrounds " +
      "for their website. The image agent generates images with DALL-E 3, saves them to the " +
      "sandbox, and updates components to reference them.",
    inputSchema: z.object({
      task: z
        .string()
        .describe(
          "Detailed description of the images needed. Include style preferences, " +
            "subject matter, mood, where images should be placed, and any design context.",
        ),
    }),
    execute: async function* ({ task }, { abortSignal }) {
      const result = await agent.stream({
        prompt: task,
        abortSignal,
      });

      for await (const message of readUIMessageStream({
        stream: result.toUIMessageStream(),
      })) {
        yield message;
      }

      const usage = await result.totalUsage;
      tracker.inputTokens += usage.inputTokens ?? 0;
      tracker.outputTokens += usage.outputTokens ?? 0;
      console.log(
        `[subagent:generateImage] usage — input=${usage.inputTokens} output=${usage.outputTokens} (tracker total: in=${tracker.inputTokens} out=${tracker.outputTokens})`,
      );
    },
    toModelOutput: ({ output }) => extractSummary(output),
  });
}
