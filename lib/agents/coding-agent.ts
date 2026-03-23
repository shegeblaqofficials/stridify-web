import {
  ToolLoopAgent,
  stepCountIs,
  InferAgentUIMessage,
  type ModelMessage,
} from "ai";
import { google } from "@ai-sdk/google";
import type { Sandbox } from "@vercel/sandbox";
import {
  createListFilesTool,
  createReadFileTool,
  createWriteFileTool,
  createRunCommandTool,
} from "./tools";
import { openai } from "@ai-sdk/openai";

/** Max characters to keep in a tool-result output from older messages. */
const TOOL_OUTPUT_TRUNCATE_LIMIT = 300;

/**
 * Compact older model messages by truncating large tool outputs.
 * Keeps the last `keepRecentMessages` messages untouched so the model
 * has full context for the current task, while older tool results
 * (readFile, runCommand) are trimmed to save input tokens.
 */
function compactMessages(
  messages: ModelMessage[],
  keepRecentMessages = 6,
): ModelMessage[] {
  if (messages.length <= keepRecentMessages) return messages;

  const cutoff = messages.length - keepRecentMessages;

  return messages.map((msg, idx) => {
    // Keep recent messages untouched
    if (idx >= cutoff) return msg;

    // Only compact tool-result messages
    if (msg.role !== "tool") return msg;

    return {
      ...msg,
      content: msg.content.map((part) => {
        if (part.type !== "tool-result") return part;

        const output = part.output;
        if (!output) return part;

        // Truncate text outputs
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

        // Truncate JSON outputs by converting to string, trimming, and wrapping back
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

const SYSTEM_INSTRUCTIONS = `You are an expert coding agent that builds and modifies Next.js applications inside a sandbox environment.
You have access to tools for reading, writing, and listing files, as well as running shell commands.
The project files are located at /vercel/sandbox. A dev server is already running on port 3000.
Guidelines:
- Understand the requirements from the user's messages and plan your steps before taking actions.
- Read existing files before modifying them to understand the current code.
- Write complete file contents when modifying a file (not diffs or patches).
- After making changes, the dev server will hot-reload automatically.
- Use the runCommand tool to install packages when needed (e.g. pnpm add <package>).
- Do NOT start or restart the dev server — it is already running.
- Keep your responses concise. Explain what you changed and why briefly.
- If something fails, read error output and try to fix it.
- Always ask the user for clarification if requirements are unclear.
- Build iteratively and incrementally. Don't try to do everything in one step.
- Focus on one task at a time. And ask if you need to add more features.`;

export interface AgentMessageMetadata {
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  balanceExhausted?: boolean;
}

export function createCodingAgent(sandbox: Sandbox) {
  return new ToolLoopAgent({
    model: openai("gpt-4.1-mini"),
    instructions: SYSTEM_INSTRUCTIONS,
    tools: {
      listFiles: createListFilesTool(sandbox),
      readFile: createReadFileTool(sandbox),
      writeFile: createWriteFileTool(sandbox),
      runCommand: createRunCommandTool(sandbox),
    },
    stopWhen: stepCountIs(15),
    prepareStep({ messages }) {
      return { messages: compactMessages(messages) };
    },
  });
}

export type CodingAgentUIMessage = InferAgentUIMessage<
  ReturnType<typeof createCodingAgent>
>;
