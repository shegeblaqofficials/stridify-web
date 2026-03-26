import { NextRequest } from "next/server";
import { Sandbox } from "@vercel/sandbox";
import { getProject } from "@/lib/project/actions";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return Response.json({ error: "Missing projectId" }, { status: 400 });
  }

  const project = await getProject(projectId);
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }
  if (!project.sandbox_id) {
    return Response.json({ error: "No active sandbox" }, { status: 400 });
  }

  let sandbox: Sandbox;
  try {
    sandbox = await Sandbox.get({ sandboxId: project.sandbox_id });
    if (sandbox.status !== "running") {
      return Response.json(
        { error: "Sandbox is not running" },
        { status: 400 },
      );
    }
  } catch {
    return Response.json(
      { error: "Failed to connect to sandbox" },
      { status: 500 },
    );
  }

  // Create a tar.gz archive excluding heavy directories
  const archivePath = "/tmp/project.tar.gz";
  const tar = await sandbox.runCommand({
    cmd: "tar",
    args: [
      "-czf",
      archivePath,
      "-C",
      "/vercel/sandbox",
      "--exclude=node_modules",
      "--exclude=.next",
      "--exclude=.git",
      ".",
    ],
  });

  if (tar.exitCode !== 0) {
    console.error("[download] tar failed:", tar.stderr);
    return Response.json(
      { error: "Failed to create archive" },
      { status: 500 },
    );
  }

  const buffer = await sandbox.readFileToBuffer({ path: archivePath });
  if (!buffer) {
    return Response.json({ error: "Failed to read archive" }, { status: 500 });
  }

  const filename = `${(project.title || "project").replace(/[^a-zA-Z0-9_-]/g, "_")}.tar.gz`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/gzip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.byteLength),
    },
  });
}
