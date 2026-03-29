import { Sandbox } from "@vercel/sandbox";

const GIT_TEMPLATE = "https://github.com/vercel/sandbox-example-next.git";
const SANDBOX_TIMEOUT = 600_000; // 10 minutes idle timeout

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
    expiration: 0, // Never expire
  });
  console.log(`[sandbox] snapshot created: ${snapshot.snapshotId}`);
  return snapshot.snapshotId;
}

/**
 * Extend the sandbox timeout. Called periodically to keep the sandbox
 * alive while the agent is working.
 *
 * Note: `sandbox.timeout` is the static configured value (not a live
 * countdown), so we track the deadline ourselves.
 */
const sandboxDeadlines = new Map<string, number>();

export async function extendSandboxTimeout(sandbox: Sandbox): Promise<void> {
  try {
    const now = Date.now();
    const deadline = sandboxDeadlines.get(sandbox.sandboxId) ?? 0;

    // Only extend if less than 2 minutes remain on our tracked deadline
    if (deadline - now > 120_000) return;

    await sandbox.extendTimeout(SANDBOX_TIMEOUT);
    sandboxDeadlines.set(sandbox.sandboxId, now + SANDBOX_TIMEOUT);
    console.log(`[sandbox] extended timeout for ${sandbox.sandboxId}`);
  } catch (err) {
    console.error(`[sandbox] failed to extend timeout:`, err);
  }
}

/**
 * Immediately stop a running sandbox.
 */
export async function shutdownSandbox(sandbox: Sandbox): Promise<void> {
  try {
    await sandbox.stop({ blocking: true });
    console.log(`[sandbox] stopped ${sandbox.sandboxId}`);
  } catch (err) {
    console.error(`[sandbox] failed to stop:`, err);
  }
}

/**
 * Try to reconnect to an existing running sandbox. Returns null if
 * the sandbox is stopped, failed, or no longer exists — the caller
 * should create a new one from snapshot or template.
 */
export async function getExistingSandbox(
  sandboxId: string,
): Promise<{ sandbox: Sandbox; previewUrl: string } | null> {
  try {
    console.log(`[sandbox] attempting to get existing sandbox ${sandboxId}...`);
    const sandbox = await Sandbox.get({ sandboxId });
    let status = sandbox.status;
    console.log(`[sandbox] current status=${status}`);

    if (status === "running") {
      const previewUrl = sandbox.domain(3000);
      console.log(`[sandbox] already running at ${previewUrl}`);
      return { sandbox, previewUrl };
    }

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
      const runningSandbox = await Sandbox.get({ sandboxId });
      const previewUrl = runningSandbox.domain(3000);
      console.log(`[sandbox] sandbox now running at ${previewUrl}`);
      return { sandbox: runningSandbox, previewUrl };
    }

    // stopped, failed, or any other non-running state — needs recreation
    console.log(`[sandbox] status=${status}, needs recreation`);
    return null;
  } catch (err) {
    console.log(`[sandbox] failed to get sandbox ${sandboxId}:`, err);
    return null;
  }
}
