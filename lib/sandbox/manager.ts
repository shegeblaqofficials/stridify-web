import { Sandbox } from "@vercel/sandbox";

const GIT_TEMPLATE = "https://github.com/vercel/sandbox-example-next.git";
const SANDBOX_TIMEOUT = 240_000; // 4 minutes idle timeout

/**
 * Create a new sandbox from a git template, install deps, and start dev server.
 */
export async function createSandboxFromTemplate(): Promise<{
  sandbox: Sandbox;
  previewUrl: string;
}> {
  console.log("[sandbox] creating from git template...");
  const sandbox = await Sandbox.create({
    source: { type: "git", url: GIT_TEMPLATE },
    resources: { vcpus: 2 },
    ports: [3000],
    runtime: "node22",
    timeout: SANDBOX_TIMEOUT,
  });
  console.log(`[sandbox] created id=${sandbox.sandboxId}`);

  console.log("[sandbox] running pnpm install...");
  const install = await sandbox.runCommand({ cmd: "pnpm", args: ["install"] });
  console.log(`[sandbox] pnpm install exit=${install.exitCode}`);

  console.log("[sandbox] starting dev server...");
  await sandbox.runCommand({
    cmd: "pnpm",
    args: ["run", "dev"],
    detached: true,
  });

  // Wait for dev server to be ready
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const previewUrl = sandbox.domain(3000);
  console.log(`[sandbox] dev server ready at ${previewUrl}`);

  return { sandbox, previewUrl };
}

/**
 * Restore a sandbox from a snapshot, then start dev server.
 */
export async function createSandboxFromSnapshot(
  snapshotId: string,
): Promise<{ sandbox: Sandbox; previewUrl: string }> {
  console.log(`[sandbox] restoring from snapshot ${snapshotId}...`);
  const sandbox = await Sandbox.create({
    source: { type: "snapshot", snapshotId },
    ports: [3000],
    timeout: SANDBOX_TIMEOUT,
  });
  console.log(`[sandbox] restored id=${sandbox.sandboxId}`);

  // Restart the dev server (snapshot preserves files but not running processes)
  console.log("[sandbox] restarting dev server...");
  await sandbox.runCommand({
    cmd: "pnpm",
    args: ["run", "dev"],
    detached: true,
  });

  await new Promise((resolve) => setTimeout(resolve, 3000));
  const previewUrl = sandbox.domain(3000);
  console.log(`[sandbox] dev server ready at ${previewUrl}`);

  return { sandbox, previewUrl };
}

/**
 * Take a snapshot of the current sandbox state.
 * Returns the Vercel snapshot ID.
 */
export async function takeSandboxSnapshot(sandbox: Sandbox): Promise<string> {
  console.log(`[sandbox] taking snapshot of ${sandbox.sandboxId}...`);
  const snapshot = await sandbox.snapshot({
    expiration: 14 * 24 * 60 * 60 * 1000, // 14 days
  });
  console.log(`[sandbox] snapshot created: ${snapshot.snapshotId}`);
  return snapshot.snapshotId;
}

/**
 * Try to reconnect to an existing sandbox. Returns the sandbox + previewUrl
 * if it's still running, or null if it needs to be recreated.
 */
export async function getExistingSandbox(
  sandboxId: string,
): Promise<{ sandbox: Sandbox; previewUrl: string } | null> {
  try {
    console.log(`[sandbox] attempting to get existing sandbox ${sandboxId}...`);
    const sandbox = await Sandbox.get({ sandboxId });

    // Wait for pending sandbox to finish starting
    let status = sandbox.status;
    console.log(`[sandbox] current status=${status}`);

    if (status === "pending") {
      console.log("[sandbox] sandbox is pending, waiting for it to start...");
      let attempts = 0;
      while (status === "pending" && attempts < 20) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const refreshed = await Sandbox.get({ sandboxId });
        status = refreshed.status;
        attempts++;
      }
      if (status !== "running") {
        console.log(`[sandbox] sandbox never started, status=${status}`);
        return null;
      }
      // Re-fetch to get the running instance
      const runningSandbox = await Sandbox.get({ sandboxId });
      const previewUrl = runningSandbox.domain(3000);
      console.log(`[sandbox] sandbox now running at ${previewUrl}`);
      return { sandbox: runningSandbox, previewUrl };
    }

    if (status === "running") {
      const previewUrl = sandbox.domain(3000);
      console.log(`[sandbox] already running at ${previewUrl}`);
      return { sandbox, previewUrl };
    }

    // stopped, failed, aborted, snapshotting — need to recreate
    console.log(`[sandbox] status=${status}, needs recreation`);
    return null;
  } catch (err) {
    console.log(`[sandbox] failed to get sandbox ${sandboxId}:`, err);
    return null;
  }
}
