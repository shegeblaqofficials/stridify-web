import { NextRequest } from "next/server";
import {
  createSandboxFromSnapshot,
  createSandboxFromTemplate,
  getExistingSandbox,
} from "@/lib/sandbox/manager";
import { getLatestSnapshot } from "@/lib/snapshot/actions";
import { getProject, updateProjectSandbox } from "@/lib/project/actions";
import { getOrganizationBalance } from "@/lib/metric/actions";

export async function POST(req: NextRequest) {
  const { projectId } = await req.json();
  console.log(`[warmup] POST /api/sandbox/warmup — projectId=${projectId}`);

  if (!projectId) {
    return Response.json({ error: "Missing projectId" }, { status: 400 });
  }

  const project = await getProject(projectId);
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  // Check organization token balance before starting sandbox
  const balance = await getOrganizationBalance(project.organization_id);
  if (balance <= 0) {
    console.log(
      `[warmup] insufficient balance for org ${project.organization_id}`,
    );
    return Response.json({ error: "insufficient_balance" }, { status: 402 });
  }

  // Try to reconnect to an existing sandbox first
  if (project.sandbox_id) {
    const existing = await getExistingSandbox(project.sandbox_id);
    if (existing) {
      console.log(
        `[warmup] reusing existing sandbox ${existing.sandbox.sandboxId}`,
      );
      await updateProjectSandbox(
        projectId,
        existing.sandbox.sandboxId,
        existing.previewUrl,
      );
      return Response.json({
        previewUrl: existing.previewUrl,
        sandboxId: existing.sandbox.sandboxId,
      });
    }
  }

  // Sandbox not running — create a new one from snapshot or template
  const latestSnapshot = await getLatestSnapshot(projectId);
  console.log(
    `[warmup] latestSnapshot=${latestSnapshot?.snapshot_id ?? "none"}`,
  );

  const { sandbox, previewUrl } = latestSnapshot
    ? await createSandboxFromSnapshot(latestSnapshot.snapshot_id)
    : await createSandboxFromTemplate();

  console.log(`[warmup] sandbox=${sandbox.sandboxId} previewUrl=${previewUrl}`);

  await updateProjectSandbox(projectId, sandbox.sandboxId, previewUrl);

  return Response.json({ previewUrl, sandboxId: sandbox.sandboxId });
}
