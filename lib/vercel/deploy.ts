import { Sandbox } from "@vercel/sandbox";
import { getVercelClient, VERCEL_TEAM_ID } from "./client";

/**
 * Create a new Vercel project for the given name.
 * Returns the Vercel project ID.
 */
export async function createVercelProject(
  projectName: string,
  framework: string = "nextjs",
): Promise<{ vercelProjectId: string; vercelProjectName: string }> {
  const vercel = getVercelClient();
  const result = await vercel.projects.createProject({
    teamId: VERCEL_TEAM_ID,
    requestBody: {
      name: projectName,
      framework: framework as any,
    },
  });
  return {
    vercelProjectId: result.id,
    vercelProjectName: result.name,
  };
}

/**
 * Read all deployable files from a sandbox, excluding heavy directories.
 * Returns files with base64-encoded content for the Vercel deployment API.
 */
export async function readSandboxFiles(
  sandbox: Sandbox,
): Promise<{ file: string; data: string; encoding: "base64" }[]> {
  // Get list of all files, excluding node_modules, .next, .git
  const listResult = await sandbox.runCommand({
    cmd: "find",
    args: [
      "/vercel/sandbox",
      "-type",
      "f",
      "-not",
      "-path",
      "*/node_modules/*",
      "-not",
      "-path",
      "*/.next/*",
      "-not",
      "-path",
      "*/.git/*",
      "-not",
      "-path",
      "*/tmp/*",
      "-not",
      "-name",
      ".DS_Store",
    ],
  });

  if (listResult.exitCode !== 0) {
    throw new Error(`Failed to list sandbox files: ${listResult.stderr}`);
  }

  const stdout = await listResult.stdout();
  const filePaths = stdout
    .split("\n")
    .map((p: string) => p.trim())
    .filter(Boolean);

  console.log(`[deploy] found ${filePaths.length} files to deploy`);

  const files: { file: string; data: string; encoding: "base64" }[] = [];

  // Read files in batches to avoid overwhelming the sandbox
  const BATCH_SIZE = 20;
  for (let i = 0; i < filePaths.length; i += BATCH_SIZE) {
    const batch = filePaths.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (fullPath: string) => {
        try {
          const buffer = await sandbox.readFileToBuffer({ path: fullPath });
          if (!buffer) return null;
          // Convert to relative path from sandbox root
          const relativePath = fullPath.replace(/^\/vercel\/sandbox\//, "");
          return {
            file: relativePath,
            data: Buffer.from(buffer).toString("base64"),
            encoding: "base64" as const,
          };
        } catch (err) {
          console.warn(`[deploy] skipping unreadable file: ${fullPath}`);
          return null;
        }
      }),
    );
    files.push(...(results.filter(Boolean) as typeof files));
  }

  console.log(`[deploy] read ${files.length} files successfully`);
  return files;
}

/**
 * Create a deployment on Vercel using the SDK.
 * Files should be pre-read from the sandbox with readSandboxFiles().
 */
export async function createVercelDeployment(params: {
  vercelProjectId: string;
  deploymentName: string;
  files: { file: string; data: string; encoding: "base64" }[];
  target?: "production" | undefined; // undefined = preview
}): Promise<{
  deploymentId: string;
  url: string | null;
  readyState: string;
  inspectorUrl: string | null;
}> {
  const vercel = getVercelClient();
  const result = await vercel.deployments.createDeployment({
    teamId: VERCEL_TEAM_ID,
    requestBody: {
      name: params.deploymentName,
      project: params.vercelProjectId,
      files: params.files,
      projectSettings: {
        framework: "nextjs",
        buildCommand: "next build",
        installCommand: "pnpm install",
      },
      target: params.target ?? undefined,
    },
  });

  return {
    deploymentId: result.id,
    url: result.url ? `https://${result.url}` : null,
    readyState: result.readyState ?? "QUEUED",
    inspectorUrl: result.inspectorUrl ?? null,
  };
}

/**
 * Get the current status of a deployment on Vercel.
 */
export async function getVercelDeploymentStatus(deploymentId: string): Promise<{
  readyState: string;
  url: string | null;
  inspectorUrl: string | null;
  state: string | undefined;
}> {
  const vercel = getVercelClient();
  const result = await vercel.deployments.getDeployment({
    idOrUrl: deploymentId,
    teamId: VERCEL_TEAM_ID,
  });

  return {
    readyState: result.readyState ?? "QUEUED",
    url: result.url ? `https://${result.url}` : null,
    inspectorUrl: (result as any).inspectorUrl ?? null,
    state: result.status,
  };
}

/**
 * Delete a deployment on Vercel.
 */
export async function deleteVercelDeployment(
  vercelDeploymentId: string,
): Promise<void> {
  const vercel = getVercelClient();
  await vercel.deployments.deleteDeployment({
    id: vercelDeploymentId,
    teamId: VERCEL_TEAM_ID,
  });
}

/**
 * Delete a Vercel project.
 */
export async function deleteVercelProject(
  vercelProjectId: string,
): Promise<void> {
  const vercel = getVercelClient();
  await vercel.projects.deleteProject({
    idOrName: vercelProjectId,
    teamId: VERCEL_TEAM_ID,
  });
}
