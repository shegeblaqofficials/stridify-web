import { ToolLoopAgent, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { Sandbox } from "@vercel/sandbox";
import {
  createReadFileTool,
  createWriteFileTool,
  createListFilesTool,
} from "../tools";

const CREATIVE_INSTRUCTIONS = `You are an elite frontend engineer and UI designer. You specialize in building stunning, modern, production-quality web pages using Next.js App Router, React, and Tailwind CSS.
Your workflow:
1. Read existing files to understand the project structure and current design system
2. Plan the page/component architecture
3. Write clean, well-structured React components with Tailwind CSS
4. Use modern design patterns: glass morphism, gradients, micro-interactions, responsive layouts
Guidelines:
- Don't write all the entire application in one step. 
- Break it into logical pieces: first create the main page, then add components, then polish styles and ask before you add more external pages.
- Files are at /vercel/sandbox. The dev server runs on port 3000 and hot-reloads.
- Write COMPLETE file contents (not diffs or patches).
- Use semantic HTML and accessible markup.
- Prefer Tailwind utility classes over custom CSS.
- Make designs responsive (mobile-first).
- Use modern UI patterns: rounded corners, subtle shadows, smooth transitions.
- Keep components focused and composable.

IMPORTANT: When finished, write a clear summary of what you created/changed as your final response.
Include file paths and a brief description of the design decisions made.`;

export function createCreativeAgent(sandbox: Sandbox) {
  return new ToolLoopAgent({
    model: anthropic("claude-opus-4-6"),
    // model: anthropic("claude-haiku-4-5"),
    instructions: CREATIVE_INSTRUCTIONS,
    tools: {
      readFile: createReadFileTool(sandbox),
      writeFile: createWriteFileTool(sandbox),
      listFiles: createListFilesTool(sandbox),
    },
    stopWhen: stepCountIs(20),
  });
}
