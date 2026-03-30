import { NextRequest } from "next/server";
import { getOrCreateSandbox } from "@/lib/sandbox/manager";
import { getLatestSnapshot } from "@/lib/snapshot/actions";
import { getProject } from "@/lib/project/actions";
import { getOrganizationBalance } from "@/lib/redis/metrics";

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

  // Use named persistent sandbox — resume or create
  const latestSnapshot = await getLatestSnapshot(projectId);
  const { sandbox, previewUrl } = await getOrCreateSandbox(
    projectId,
    latestSnapshot?.snapshot_id,
    project.sandbox_slot,
  );

  console.log(`[warmup] sandbox=${sandbox.name} previewUrl=${previewUrl}`);

  return Response.json({ previewUrl, sandboxId: sandbox.name });
}
