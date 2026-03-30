import { NextRequest } from "next/server";
import { Sandbox } from "@vercel/sandbox";
import { sandboxName, takeSandboxSnapshot } from "@/lib/sandbox/manager";
import { getProject } from "@/lib/project/actions";
import { getLatestSnapshot, createSnapshot } from "@/lib/snapshot/actions";

export async function POST(req: NextRequest) {
  const { projectId, versionName } = await req.json();
  console.log(
    `[save-snapshot] POST — projectId=${projectId} versionName=${versionName}`,
  );

  if (!projectId) {
    return Response.json({ error: "Missing projectId" }, { status: 400 });
  }

  const project = await getProject(projectId);
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  // Get the named sandbox for this project
  const name = sandboxName(projectId, project.sandbox_slot);
  let sandbox: Sandbox;
  try {
    sandbox = await Sandbox.get({ name });
  } catch {
    return Response.json(
      { error: "No active sandbox found for this project" },
      { status: 404 },
    );
  }

  if (sandbox.status !== "running") {
    return Response.json(
      { error: "Sandbox is not running. Start a chat first." },
      { status: 409 },
    );
  }

  // Determine next version number
  const latest = await getLatestSnapshot(projectId);
  const nextVersion = (latest?.version_number ?? 0) + 1;

  // Take the snapshot
  try {
    const snapshotId = await takeSandboxSnapshot(sandbox);

    // Store in database
    const snapshot = await createSnapshot(
      projectId,
      project.organization_id,
      snapshotId,
      versionName || `v${nextVersion}`,
    );

    if (!snapshot) {
      return Response.json(
        { error: "Failed to save snapshot record" },
        { status: 500 },
      );
    }

    console.log(
      `[save-snapshot] saved ${snapshotId} as v${nextVersion} for ${projectId}`,
    );

    return Response.json({
      snapshot,
      message: `Version v${nextVersion} saved successfully`,
    });
  } catch (err) {
    console.error("[save-snapshot] failed:", err);
    return Response.json({ error: "Failed to save snapshot" }, { status: 500 });
  }
}
