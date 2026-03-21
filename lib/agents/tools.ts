import { tool } from "ai";
import { z } from "zod";
import type { Sandbox } from "@vercel/sandbox";

export function createListFilesTool(sandbox: Sandbox) {
  return tool({
    description:
      "List files and directories at a given path in the sandbox. Returns file/directory names.",
    inputSchema: z.object({
      path: z
        .string()
        .default("/vercel/sandbox")
        .describe("Directory path to list"),
    }),
    execute: async ({ path }) => {
      console.log(`[tool:listFiles] path=${path}`);
      const result = await sandbox.runCommand({
        cmd: "ls",
        args: ["-la", path],
      });
      console.log(`[tool:listFiles] exit=${result.exitCode}`);
      return {
        output: await result.stdout(),
        exitCode: result.exitCode,
      };
    },
  });
}

export function createReadFileTool(sandbox: Sandbox) {
  return tool({
    description:
      "Read the contents of a file in the sandbox. Returns the file content as text.",
    inputSchema: z.object({
      path: z.string().describe("Absolute path to the file to read"),
    }),
    execute: async ({ path }) => {
      console.log(`[tool:readFile] path=${path}`);
      const buffer = await sandbox.readFileToBuffer({ path });
      console.log(`[tool:readFile] read ${buffer?.length ?? 0} bytes`);
      return { content: buffer?.toString("utf-8") ?? "" };
    },
  });
}

export function createWriteFileTool(sandbox: Sandbox) {
  return tool({
    description:
      "Write content to a file in the sandbox. Creates the file if it doesn't exist, overwrites if it does. Use this to create or modify source files.",
    inputSchema: z.object({
      path: z.string().describe("Absolute path to the file to write"),
      content: z.string().describe("The full file content to write"),
    }),
    execute: async ({ path, content }) => {
      console.log(`[tool:writeFile] path=${path} size=${content.length}`);
      // Ensure parent directory exists
      const dir = path.substring(0, path.lastIndexOf("/"));
      if (dir) {
        await sandbox.runCommand({ cmd: "mkdir", args: ["-p", dir] });
      }
      await sandbox.writeFiles([{ path, content: Buffer.from(content) }]);
      console.log(`[tool:writeFile] done: ${path}`);
      return { success: true, path };
    },
  });
}

export function createRunCommandTool(sandbox: Sandbox) {
  return tool({
    description:
      "Run a shell command in the sandbox. Use for installing packages, running builds, or other CLI operations. Do NOT use for starting long-running dev servers.",
    inputSchema: z.object({
      cmd: z
        .string()
        .describe("The command to run (e.g. 'pnpm', 'npm', 'npx')"),
      args: z.array(z.string()).default([]).describe("Command arguments"),
      cwd: z
        .string()
        .optional()
        .describe("Working directory (defaults to /vercel/sandbox)"),
    }),
    execute: async ({ cmd, args, cwd }) => {
      console.log(
        `[tool:runCommand] ${cmd} ${args.join(" ")}${cwd ? ` (cwd=${cwd})` : ""}`,
      );
      const result = await sandbox.runCommand({
        cmd,
        args,
        ...(cwd ? { cwd } : {}),
      });
      const stdout = await result.stdout();
      const stderr = await result.stderr();
      console.log(
        `[tool:runCommand] exit=${result.exitCode} stdout=${stdout.length}chars stderr=${stderr.length}chars`,
      );
      return {
        stdout,
        stderr,
        exitCode: result.exitCode,
      };
    },
  });
}
