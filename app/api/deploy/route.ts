import { NextRequest } from "next/server";
import { Sandbox } from "@vercel/sandbox";
import { getProject, updateProjectSandbox } from "@/lib/project/actions";
import {
  getVercelProjectByProjectId,
  createVercelProjectRecord,
  createDeploymentRecord,
} from "@/lib/deployment/actions";
import {
  createVercelProject,
  readSandboxFiles,
  createVercelDeployment,
} from "@/lib/vercel/deploy";
import {
  createSandboxFromSnapshot,
  getExistingSandbox,
} from "@/lib/sandbox/manager";
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
      deploymentName?: string;
    };

    if (!projectId || !organizationId || !userId) {
      return Response.json(
        { error: "Missing required fields: projectId, organizationId, userId" },
        { status: 400 },
      );
    }

    // 1. Get the project & get or restore a running sandbox
    const project = await getProject(projectId);
    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    let sandbox: Sandbox | null = null;

    // Try reusing the existing sandbox if it's still running
    if (project.sandbox_id) {
      const existing = await getExistingSandbox(project.sandbox_id);
      if (existing) {
        sandbox = existing.sandbox;
        console.log(`[deploy] reusing existing sandbox ${sandbox.sandboxId}`);
      }
    }

    // Sandbox not running — restore from the latest snapshot
    if (!sandbox) {
      const latestSnapshot = await getLatestSnapshot(projectId);
      if (!latestSnapshot) {
        return Response.json(
          {
            error:
              "No active sandbox or snapshot available. Open the workspace first.",
          },
          { status: 400 },
        );
      }

      console.log(
        `[deploy] restoring sandbox from snapshot ${latestSnapshot.snapshot_id}...`,
      );
      const restored = await createSandboxFromSnapshot(
        latestSnapshot.snapshot_id,
      );
      sandbox = restored.sandbox;

      // Update the project with the new sandbox so future calls can reuse it
      await updateProjectSandbox(
        projectId,
        sandbox.sandboxId,
        restored.previewUrl,
      );
      console.log(`[deploy] sandbox restored: ${sandbox.sandboxId}`);
    }

    // 2. Get or create the Vercel project
    let vercelProject = await getVercelProjectByProjectId(projectId);

    if (!vercelProject) {
      // First deployment — create a new Vercel project
      const safeName = (project.title || "stridify-project")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 50);

      const uniqueName = `${safeName}-${projectId.slice(0, 8)}`;

      console.log(`[deploy] Creating Vercel project: ${uniqueName}`);
      const { vercelProjectId, vercelProjectName } =
        await createVercelProject(uniqueName);

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
      projectName: vercelProject.vercel_project_name,
      files,
      target,
    });

    // 5. Save the deployment record
    const deploymentId = crypto.randomUUID();
    const statusMap: Record<string, string> = {
      QUEUED: "queued",
      BUILDING: "building",
      READY: "ready",
      ERROR: "error",
      CANCELED: "canceled",
    };

    const record = await createDeploymentRecord({
      deploymentId,
      projectId,
      organizationId,
      vercelProjectId: vercelProject.vercel_project_id,
      vercelDeploymentId: deployment.deploymentId,
      environment,
      status: statusMap[deployment.readyState] || "queued",
      url: deployment.url ?? undefined,
      inspectorUrl: deployment.inspectorUrl ?? undefined,
      deploymentName: deploymentName ?? undefined,
      createdByUserId: userId,
    });

    console.log(
      `[deploy] Deployment created: ${deploymentId} (vercel: ${deployment.deploymentId})`,
    );

    return Response.json({
      deploymentId,
      vercelDeploymentId: deployment.deploymentId,
      url: deployment.url,
      inspectorUrl: deployment.inspectorUrl,
      status: statusMap[deployment.readyState] || "queued",
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
