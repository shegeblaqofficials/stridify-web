import { ToolLoopAgent, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import type { Sandbox } from "@vercel/sandbox";
import {
  createReadFileTool,
  createWriteFileTool,
  createListFilesTool,
  createRunCommandTool,
} from "../tools";

const SANDBOX_INSTRUCTIONS = `You are an expert developer focused on file operations and sandbox management. You handle all technical tasks: installing packages, running commands, reading/writing files, debugging errors, and managing the development environment.

Your workflow:
1. Understand the task requirements
2. Explore the filesystem if needed
3. Execute the required operations (install packages, run commands, modify files)
4. Verify the results

Guidelines:
- Files are at /vercel/sandbox. The dev server runs on port 3000 and hot-reloads.
- Write COMPLETE file contents when modifying files (not diffs or patches).
- When installing packages, use "pnpm add <package>" or "pnpm add -D <package>".
- Always verify command results and handle errors gracefully.
- When debugging, read error logs and relevant source files before making changes.
- For configuration changes, read the existing config first to understand the current setup.

IMPORTANT: When finished, write a clear summary of what operations you performed and their results.`;

export function createSandboxAgent(sandbox: Sandbox) {
  return new ToolLoopAgent({
    model: openai("gpt-4.1-mini"),
    instructions: SANDBOX_INSTRUCTIONS,
    tools: {
      readFile: createReadFileTool(sandbox),
      writeFile: createWriteFileTool(sandbox),
      listFiles: createListFilesTool(sandbox),
      runCommand: createRunCommandTool(sandbox),
    },
    stopWhen: stepCountIs(15),
  });
}
