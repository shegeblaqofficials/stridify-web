import { NextRequest } from "next/server";
import { Sandbox } from "@vercel/sandbox";
import { getProject, updateProjectStatus } from "@/lib/project/actions";
import {
  getVercelProjectByProjectId,
  createVercelProjectRecord,
  createDeploymentRecord,
  getDeployment,
  deleteDeploymentRecord,
  deleteVercelProjectRecord,
  countOtherDeploymentsForVercelProject,
  getProjectDeployments,
  updateDeploymentForRedeploy,
} from "@/lib/deployment/actions";
import {
  createVercelProject,
  readSandboxFiles,
  createVercelDeployment,
  deleteVercelDeployment,
  deleteVercelProject,
} from "@/lib/vercel/deploy";
import { getOrCreateSandbox, sandboxName } from "@/lib/sandbox/manager";
import { getLatestSnapshot } from "@/lib/snapshot/actions";
import type { DeploymentEnvironment } from "@/model/deployment/deployment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectId,
      organizationId,
      userId,
      environment = "preview",
      deploymentName,
    } = body as {
      projectId: string;
      organizationId: string;
      userId: string;
      environment?: DeploymentEnvironment;
      deploymentName: string;
    };

    const normalizedDeploymentName = deploymentName?.trim();

    if (!projectId || !organizationId || !userId || !normalizedDeploymentName) {
      return Response.json(
        {
          error:
            "Missing required fields: projectId, organizationId, userId, deploymentName",
        },
        { status: 400 },
      );
    }

    // 1. Get the project & get or restore a running sandbox
    const project = await getProject(projectId);
    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    let sandbox: Sandbox | null = null;

    // Get or resume the named persistent sandbox
    try {
      const latestSnapshot = await getLatestSnapshot(projectId);
      const result = await getOrCreateSandbox(
        projectId,
        latestSnapshot?.snapshot_id,
        project.sandbox_slot,
      );
      sandbox = result.sandbox;

      console.log(`[deploy] sandbox ready: ${sandbox.name}`);
    } catch (err) {
      console.error("[deploy] failed to get sandbox:", err);
      return Response.json(
        {
          error: "No active sandbox available. Open the workspace first.",
        },
        { status: 400 },
      );
    }

    // 2. Get or create the Vercel project
    let vercelProject = await getVercelProjectByProjectId(projectId);

    if (!vercelProject) {
      // First deployment — create a new Vercel project using deployment name
      const safeName = normalizedDeploymentName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 50);

      const projectName = safeName || `deployment-${projectId.slice(0, 8)}`;

      console.log(`[deploy] Creating Vercel project: ${projectName}`);
      const { vercelProjectId, vercelProjectName } =
        await createVercelProject(projectName);

      vercelProject = await createVercelProjectRecord({
        vercelProjectId,
        projectId,
        organizationId,
        vercelProjectName,
        framework: "nextjs",
      });

      if (!vercelProject) {
        return Response.json(
          { error: "Failed to save Vercel project mapping" },
          { status: 500 },
        );
      }
    }

    // 3. Read files from sandbox
    console.log(`[deploy] Reading files from sandbox ${project.sandbox_id}...`);
    const files = await readSandboxFiles(sandbox);

    if (files.length === 0) {
      return Response.json(
        { error: "No files found in sandbox to deploy" },
        { status: 400 },
      );
    }

    // 4. Create the Vercel deployment
    console.log(
      `[deploy] Creating ${environment} deployment for ${vercelProject.vercel_project_name}...`,
    );
    const target = environment === "production" ? "production" : undefined;
    const deployment = await createVercelDeployment({
      vercelProjectId: vercelProject.vercel_project_id,
      deploymentName: normalizedDeploymentName,
      files,
      target,
    });

    // 5. Save the deployment record
    const statusMap: Record<string, string> = {
      QUEUED: "queued",
      BUILDING: "building",
      READY: "ready",
      ERROR: "error",
      CANCELED: "canceled",
    };
    const mappedStatus = statusMap[deployment.readyState] || "queued";

    // Check for existing deployment in this environment (update vs create)
    const existingDeployments = await getProjectDeployments(projectId);
    const existing = existingDeployments.find(
      (d) => d.environment === environment,
    );

    let deploymentId: string;
    let record;

    if (existing) {
      deploymentId = existing.deployment_id;
      record = await updateDeploymentForRedeploy({
        deploymentId,
        vercelDeploymentId: deployment.deploymentId,
        status: mappedStatus,
        url: deployment.url ?? undefined,
        inspectorUrl: deployment.inspectorUrl ?? undefined,
      });
      console.log(
        `[deploy] Deployment updated: ${deploymentId} (vercel: ${deployment.deploymentId})`,
      );
    } else {
      deploymentId = crypto.randomUUID();
      record = await createDeploymentRecord({
        deploymentId,
        projectId,
        organizationId,
        vercelProjectId: vercelProject.vercel_project_id,
        vercelDeploymentId: deployment.deploymentId,
        environment,
        status: mappedStatus,
        url: deployment.url ?? undefined,
        inspectorUrl: deployment.inspectorUrl ?? undefined,
        deploymentName: normalizedDeploymentName,
        createdByUserId: userId,
      });
      console.log(
        `[deploy] Deployment created: ${deploymentId} (vercel: ${deployment.deploymentId})`,
      );
    }

    if (!record) {
      return Response.json(
        { error: "Failed to save deployment record" },
        { status: 500 },
      );
    }

    // Update project status to deployed
    await updateProjectStatus(projectId, "deployed");

    return Response.json({
      deploymentId,
      vercelDeploymentId: deployment.deploymentId,
      url: deployment.url,
      inspectorUrl: deployment.inspectorUrl,
      status: mappedStatus,
      environment,
    });
  } catch (err: any) {
    console.error("[deploy] Error:", err);
    return Response.json(
      { error: err?.message || "Deployment failed" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get("projectId");
    if (!projectId) {
      return Response.json(
        { error: "Missing required query param: projectId" },
        { status: 400 },
      );
    }

    const deployments = await getProjectDeployments(projectId);

    // Latest (first, since ordered desc) deployment per environment
    const latest: {
      preview: (typeof deployments)[number] | null;
      production: (typeof deployments)[number] | null;
    } = { preview: null, production: null };

    for (const d of deployments) {
      if (d.environment === "preview" && !latest.preview) latest.preview = d;
      if (d.environment === "production" && !latest.production)
        latest.production = d;
      if (latest.preview && latest.production) break;
    }

    return Response.json({ latest });
  } catch (err: any) {
    console.error("[deploy] GET Error:", err);
    return Response.json(
      { error: err?.message || "Failed to load deployments" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { deploymentId } = body as { deploymentId?: string };

    if (!deploymentId) {
      return Response.json(
        { error: "Missing required field: deploymentId" },
        { status: 400 },
      );
    }

    const deployment = await getDeployment(deploymentId);
    if (!deployment) {
      return Response.json({ error: "Deployment not found" }, { status: 404 });
    }

    // 1) Delete the Vercel deployment
    await deleteVercelDeployment(deployment.deployer_deployment_id);

    // 2) Delete deployment DB record
    const deletedDeployment = await deleteDeploymentRecord(deploymentId);
    if (!deletedDeployment) {
      return Response.json(
        { error: "Failed to delete deployment record" },
        { status: 500 },
      );
    }

    // 3) If no more deployments exist for this Vercel project, delete the project + mapping
    const remaining = await countOtherDeploymentsForVercelProject(
      deployment.deployer_project_id,
      deploymentId,
    );

    let deletedVercelProject = false;

    if (remaining === 0) {
      await deleteVercelProject(deployment.deployer_project_id);
      deletedVercelProject = true;

      const deletedMapping = await deleteVercelProjectRecord(
        deployment.deployer_project_id,
      );

      if (!deletedMapping) {
        return Response.json(
          {
            error:
              "Deployment deleted, but failed to remove Vercel project mapping",
          },
          { status: 500 },
        );
      }
    }

    return Response.json({
      success: true,
      deploymentId,
      deletedVercelProject,
    });
  } catch (err: any) {
    console.error("[deploy] Delete error:", err);
    return Response.json(
      { error: err?.message || "Failed to delete deployment" },
      { status: 500 },
    );
  }
}
