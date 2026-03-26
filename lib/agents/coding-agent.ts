import {
  ToolLoopAgent,
  stepCountIs,
  InferAgentUIMessage,
  type ModelMessage,
} from "ai";
import type { Sandbox } from "@vercel/sandbox";
import { openai } from "@ai-sdk/openai";
import {
  createDesignPageTool,
  createEditSandboxTool,
  createEditContentTool,
  createGenerateImageTool,
  type SubagentUsageTracker,
} from "./subagent-tools";

/** Max characters to keep in a tool-result output from older messages. */
const TOOL_OUTPUT_TRUNCATE_LIMIT = 300;

/**
 * Compact older model messages by truncating large tool outputs.
 * Keeps the last `keepRecentMessages` messages untouched so the model
 * has full context for the current task, while older tool results
 * are trimmed to save input tokens.
 */
function compactMessages(
  messages: ModelMessage[],
  keepRecentMessages = 6,
): ModelMessage[] {
  if (messages.length <= keepRecentMessages) return messages;

  const cutoff = messages.length - keepRecentMessages;

  return messages.map((msg, idx) => {
    if (idx >= cutoff) return msg;
    if (msg.role !== "tool") return msg;

    return {
      ...msg,
      content: msg.content.map((part) => {
        if (part.type !== "tool-result") return part;

        const output = part.output;
        if (!output) return part;

        if (
          output.type === "text" &&
          output.value.length > TOOL_OUTPUT_TRUNCATE_LIMIT
        ) {
          return {
            ...part,
            output: {
              ...output,
              value:
                output.value.slice(0, TOOL_OUTPUT_TRUNCATE_LIMIT) +
                "\n... [truncated]",
            },
          };
        }

        if (output.type === "json") {
          const str = JSON.stringify(output.value);
          if (str.length > TOOL_OUTPUT_TRUNCATE_LIMIT) {
            return {
              ...part,
              output: {
                type: "text" as const,
                value:
                  str.slice(0, TOOL_OUTPUT_TRUNCATE_LIMIT) +
                  "\n... [truncated]",
              },
            };
          }
        }

        return part;
      }),
    };
  });
}

const ORCHESTRATOR_INSTRUCTIONS = `You are a senior engineering lead that orchestrates specialized agents to build and modify Next.js applications in a sandbox environment.
You do NOT write code directly. Instead, you analyze the user's request, break it into clear tasks, and delegate each task to the most appropriate specialized agent.
## Your Specialized Agents
1. **designPage** — Creative design agent (powerful model). Use for:
   - Creating new pages or major components from scratch
   - Complex UI layouts and designs
   - Full page redesigns or new feature UIs
   - Any task requiring strong design sensibility

2. **editSandbox** — Sandbox operations agent. Use for:
   - Installing npm packages (pnpm add ...)
   - Running shell commands
   - Exploring the filesystem
   - Debugging build errors or runtime issues
   - Configuration changes (next.config, tsconfig, etc.)

3. **editContent** — Content editor agent. Use for:
   - Updating text, headings, descriptions, labels
   - Changing colors, spacing, typography
   - Minor CSS/Tailwind adjustments
   - Small targeted edits to existing files

4. **generateImage** — Image generation agent. Use for:
   - Creating custom images, photos, illustrations for the website
   - Generating hero backgrounds, product images, icons
   - Any task requiring AI-generated visual assets

## Guidelines
- Analyze the user's request and determine which agent(s) to use.
- Plan the sequence of tasks needed to fulfill the request.
- Write clear, detailed task descriptions for each agent. Include file paths, specific requirements, and context.
- For complex requests, break them into sequential steps — e.g., first install packages, then create main page, then add images, ask user if you need to add other pages.
- **NEVER call the same agent twice in a single step.** Combine related work into one detailed task description per agent.
- When an agent reports back, verify the work was done correctly. If there are issues, delegate a fix.
- Keep your responses to the user concise. Summarize what was done.
- The project is at /vercel/sandbox with a dev server on port 3000 (hot-reload enabled).
- Build iteratively. Don't try to do everything in one massive delegation.`;

export interface AgentMessageMetadata {
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  balanceExhausted?: boolean;
}

export function createCodingAgent(
  sandbox: Sandbox,
  subagentUsageTracker: SubagentUsageTracker,
) {
  return new ToolLoopAgent({
    model: openai("gpt-5.4-mini"),
    instructions: ORCHESTRATOR_INSTRUCTIONS,
    tools: {
      designPage: createDesignPageTool(sandbox, subagentUsageTracker),
      editSandbox: createEditSandboxTool(sandbox, subagentUsageTracker),
      editContent: createEditContentTool(sandbox, subagentUsageTracker),
      generateImage: createGenerateImageTool(sandbox, subagentUsageTracker),
    },
    providerOptions: {
      openai: { parallelToolCalls: false },
    },
    stopWhen: stepCountIs(10),
    prepareStep({ messages }) {
      return { messages: compactMessages(messages) };
    },
  });
}

export type CodingAgentUIMessage = InferAgentUIMessage<
  ReturnType<typeof createCodingAgent>
>;
