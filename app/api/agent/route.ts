import { NextRequest, after } from "next/server";
import { Sandbox } from "@vercel/sandbox";
import { stepCountIs, tool, ToolLoopAgent } from "ai";
import { z } from "zod";
import { google } from "@ai-sdk/google";

export async function POST(req: NextRequest) {
  let sandbox: Sandbox | null = null;

  const body = await req.json();
  const parsed = z
    .object({ prompt: z.string().min(1).max(10_000) })
    .safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid body. Expected { prompt: string }." },
      { status: 400 },
    );
  }
  const { prompt } = parsed.data;

  // create an isolated VM
  sandbox = await Sandbox.create({
    source: {
      url: "https://github.com/vercel/sandbox-example-next.git",
      type: "git",
    },
    resources: { vcpus: 2 },
    ports: [3000],
    runtime: "node22",
    // stop sandbox after 30 seconds of inactivity
    //timeout: 30_000,
  });
  //run the nextjs app in the sandbox
  const installCommand = await sandbox.runCommand({
    cmd: "pnpm",
    args: ["install"],
  });
  console.log(`[agent] pnpm install exit=${installCommand.exitCode}`);
  // Start dev server in detached mode (long-running process)
  await sandbox.runCommand({
    cmd: "pnpm",
    args: ["run", "dev"],
    detached: true,
  });
  // Wait for the dev server to be ready
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log(`[agent] pnpm run dev started (detached)`);
  const previewUrl = sandbox.domain(3000);
  console.log(previewUrl); // publicly accessible URL for port 3000
  console.log(`[agent] sandbox ${sandbox.sandboxId} created`);

  // const agent = new ToolLoopAgent({
  //   model: google("gemini-2.5-flash"),
  //   instructions:
  //     "You are an AI assistant that generates and runs JS. Use console.log to output values.",
  //   tools: {
  //     generateAndRunCode: tool({
  //       description: "Use this tool to run JS code in Node.js v22 sandbox",
  //       inputSchema: z.object({
  //         code: z.string().describe("The JS code to run"),
  //         packages: z
  //           .array(z.string())
  //           .nullable()
  //           .default([])
  //           .describe("Optional packages to install"),
  //       }),
  //       execute: async ({ code, packages }) => {
  //         // If the LLM output provides packages, install them with npm.
  //         if (packages && packages.length > 0) {
  //           console.log(`[agent] npm install ${packages.join(" ")}`);
  //           const installStep = await sandbox.runCommand({
  //             cmd: "npm",
  //             args: ["install", ...packages],
  //           });
  //           const installOut = await installStep.stdout();
  //           console.log(`[agent] npm install exit=${installStep.exitCode}`);
  //           if (installStep.exitCode !== 0) {
  //             return { output: installOut, exitCode: installStep.exitCode };
  //           }
  //         }
  //         console.log(`[agent] generated code:\n${code}`);
  //         console.log(`[agent] node -e (code length=${code.length})`);
  //         // Execute generated code, e.g. node -e "console.log('Hello, world!')"
  //         const runResult = await sandbox.runCommand({
  //           cmd: "node",
  //           args: ["-e", code],
  //         });
  //         const output = await runResult.stdout();
  //         console.log(`[agent] node exit=${runResult.exitCode}`);
  //         return { output, exitCode: runResult.exitCode };
  //       },
  //     }),
  //   },
  //   stopWhen: stepCountIs(10),
  // });

  //   console.log(`[agent] generate start`);
  //   const result = await agent.generate({ prompt });
  //   console.log(`[agent] generate done (text=${result.text.length} chars)`);

  //   after(async () => {
  //     // cleanup sandbox after request is done
  //     await sandbox.stop();
  //   });
  return Response.json({ previewUrl });
}
