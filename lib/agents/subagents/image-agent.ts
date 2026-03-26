import { ToolLoopAgent, tool, generateImage, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { Sandbox } from "@vercel/sandbox";
import {
  createReadFileTool,
  createWriteFileTool,
  createListFilesTool,
} from "../tools";

function createGenerateImageTool(sandbox: Sandbox) {
  return tool({
    description:
      "Generate an image using DALL-E 3 and save it to the sandbox filesystem. Returns the file path where the image was saved. Use descriptive, detailed prompts for best results.",
    inputSchema: z.object({
      prompt: z
        .string()
        .describe("Detailed description of the image to generate"),
      filename: z
        .string()
        .describe("Filename with extension (e.g. hero-bg.png, logo.png)"),
      directory: z
        .string()
        .default("/vercel/sandbox/public")
        .describe("Directory to save the image in"),
      size: z
        .enum(["1024x1024", "1024x1792", "1792x1024"])
        .default("1024x1024")
        .describe("Image dimensions"),
    }),
    execute: async ({ prompt, filename, directory, size }) => {
      console.log(
        `[tool:generateImage] prompt="${prompt.slice(0, 80)}..." size=${size}`,
      );

      const { image } = await generateImage({
        model: openai.image("dall-e-3"),
        prompt,
        size,
      });

      // Ensure directory exists
      await sandbox.runCommand({ cmd: "mkdir", args: ["-p", directory] });

      const filePath = `${directory}/${filename}`;
      await sandbox.writeFiles([
        { path: filePath, content: Buffer.from(image.uint8Array) },
      ]);

      console.log(`[tool:generateImage] saved to ${filePath}`);
      return { success: true, path: filePath, size };
    },
  });
}

const IMAGE_INSTRUCTIONS = `You are an expert image asset generator for websites. You create and place high-quality images that enhance web designs.

Your workflow:
1. Read existing files to understand the project structure and current design
2. Determine what images are needed and where they should be placed
3. Generate images with detailed, descriptive prompts
4. Update component files to reference the new images if needed

Guidelines:
- Files are at /vercel/sandbox. The dev server runs on port 3000 and hot-reloads.
- Write COMPLETE file contents when modifying files (not diffs or patches).
- Save images to /vercel/sandbox/public/ by default (or appropriate subdirectory).
- Use descriptive prompts that specify style, mood, lighting, composition, and subject.
- For website images, prefer: clean, modern, professional photography or illustration styles.
- Consider the brand and design context when generating images.
- After generating images, update the relevant component to use them with proper Next.js Image or img tags.
- Reference images in code as "/filename.png" (public directory is served at root).

IMPORTANT: When finished, write a clear summary of what images you generated and where they were placed.`;

export function createImageAgent(sandbox: Sandbox) {
  return new ToolLoopAgent({
    model: openai("gpt-4.1-mini"),
    instructions: IMAGE_INSTRUCTIONS,
    tools: {
      generateImage: createGenerateImageTool(sandbox),
      readFile: createReadFileTool(sandbox),
      writeFile: createWriteFileTool(sandbox),
      listFiles: createListFilesTool(sandbox),
    },
    stopWhen: stepCountIs(10),
  });
}
