import { NextRequest } from "next/server";
import { getVercelDeploymentStatus } from "@/lib/vercel/deploy";
import {
  updateDeploymentStatus,
  getDeployment,
} from "@/lib/deployment/actions";
import type { DeploymentStatus } from "@/model/deployment/deployment";

export async function GET(req: NextRequest) {
  const deploymentId = req.nextUrl.searchParams.get("deploymentId");
  if (!deploymentId) {
    return Response.json({ error: "Missing deploymentId" }, { status: 400 });
  }

  // Look up our record to get the Vercel deployment ID
  const record = await getDeployment(deploymentId);
  if (!record) {
    return Response.json({ error: "Deployment not found" }, { status: 404 });
  }

  try {
    const status = await getVercelDeploymentStatus(
      record.deployer_deployment_id,
    );

    const statusMap: Record<string, DeploymentStatus> = {
      QUEUED: "queued",
      BUILDING: "building",
      INITIALIZING: "building",
      READY: "ready",
      ERROR: "error",
      CANCELED: "canceled",
    };

    const mappedStatus = statusMap[status.readyState] || "building";

    // Update our DB if status changed
    if (mappedStatus !== record.status) {
      await updateDeploymentStatus(
        deploymentId,
        mappedStatus,
        status.url ?? undefined,
      );
    }

    return Response.json({
      deploymentId,
      vercelDeploymentId: record.deployer_deployment_id,
      status: mappedStatus,
      url: status.url,
      inspectorUrl: status.inspectorUrl,
      environment: record.environment,
    });
  } catch (err: any) {
    console.error("[deploy-status] Error:", err);
    return Response.json(
      { error: err?.message || "Failed to get deployment status" },
      { status: 500 },
    );
  }
}
