import { Sandbox } from "@vercel/sandbox";
import { createAdminClient } from "@/lib/supabase/admin";

const GIT_TEMPLATE = "https://github.com/vercel/sandbox-example-next.git";
const SANDBOX_TIMEOUT = 600_000; // 10 minutes idle timeout

/**
 * Persist sandbox ID and preview URL to the project row immediately
 * so the sandbox can be resumed on next visit.
 */
async function persistSandboxInfo(
  projectId: string,
  sandboxId: string,
  previewUrl: string,
): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase
      .from("projects")
      .update({ sandbox_id: sandboxId, preview_url: previewUrl })
      .eq("project_id", projectId);
    console.log(
      `[sandbox] persisted sandbox_id=${sandboxId} for project ${projectId}`,
    );
  } catch (err) {
    console.error(`[sandbox] failed to persist sandbox info:`, err);
  }
}

/**
 * Build a deterministic sandbox name for a project.
 * Format: `{projectId}-{slot}` where slot starts at 1.
 * Later we can use slot 2+ for snapshots / branching.
 */
export function sandboxName(projectId: string, slot = 1): string {
  return `${projectId}-${slot}`;
}

/**
 * Get or create a named persistent sandbox for a project.
 *
 * With persistent sandboxes the filesystem is auto-saved when the sandbox
 * stops and auto-restored when it resumes — no manual snapshots needed
 * for normal operation.
 *
 * Flow:
 *  1. Try `Sandbox.get({ name })` to resume an existing sandbox.
 *  2. If it doesn't exist, create from snapshot (if provided) or git template.
 *  3. Start the dev server if needed.
 */
export async function getOrCreateSandbox(
  projectId: string,
  snapshotId?: string | null,
  slot = 1,
): Promise<{ sandbox: Sandbox; previewUrl: string }> {
  const name = sandboxName(projectId, slot);

  // 1. Try to resume an existing named sandbox
  try {
    console.log(`[sandbox] attempting to get named sandbox "${name}"...`);
    const sandbox = await Sandbox.get({ name });
    const status = sandbox.status;
    console.log(`[sandbox] found "${name}" status=${status}`);

    if (status === "running") {
      const previewUrl = sandbox.domain(3000);
      console.log(`[sandbox] already running at ${previewUrl}`);
      await persistSandboxInfo(projectId, name, previewUrl);
      return { sandbox, previewUrl };
    }

    // If stopped, the beta SDK will auto-resume on next command.
    // Start the dev server to bring it back.
    if (status === "stopped") {
      console.log(`[sandbox] resuming stopped sandbox "${name}"...`);
      await sandbox.runCommand({
        cmd: "pnpm",
        args: ["run", "dev"],
        detached: true,
      });
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const previewUrl = sandbox.domain(3000);
      console.log(`[sandbox] resumed at ${previewUrl}`);
      await persistSandboxInfo(projectId, name, previewUrl);
      return { sandbox, previewUrl };
    }

    // Pending — wait for it
    if (status === "pending") {
      console.log(`[sandbox] waiting for pending sandbox "${name}"...`);
      let attempts = 0;
      let current = sandbox;
      while (current.status === "pending" && attempts < 20) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        current = await Sandbox.get({ name });
        attempts++;
      }
      if (current.status === "running") {
        const previewUrl = current.domain(3000);
        await persistSandboxInfo(projectId, name, previewUrl);
        return { sandbox: current, previewUrl };
      }
    }

    // Any other state — fall through to create fresh
    console.log(`[sandbox] status=${status}, creating fresh...`);
  } catch (err: any) {
    // Sandbox doesn't exist yet — this is expected for new projects
    console.log(`[sandbox] named sandbox "${name}" not found, creating new...`);
  }

  // 2. Create a new named persistent sandbox
  const result = snapshotId
    ? await createNamedSandboxFromSnapshot(name, snapshotId)
    : await createNamedSandboxFromTemplate(name);

  await persistSandboxInfo(projectId, name, result.previewUrl);
  return result;
}

/**
 * Create a new named sandbox from a git template.
 */
async function createNamedSandboxFromTemplate(
  name: string,
): Promise<{ sandbox: Sandbox; previewUrl: string }> {
  console.log(
    `[sandbox] creating named sandbox "${name}" from git template...`,
  );
  const sandbox = await Sandbox.create({
    name,
    source: { type: "git", url: GIT_TEMPLATE },
    resources: { vcpus: 2 },
    ports: [3000],
    runtime: "node22",
    timeout: SANDBOX_TIMEOUT,
  });
  console.log(`[sandbox] created "${name}" id=${sandbox.sandboxId}`);

  console.log("[sandbox] running pnpm install...");
  const install = await sandbox.runCommand({ cmd: "pnpm", args: ["install"] });
  console.log(`[sandbox] pnpm install exit=${install.exitCode}`);

  console.log("[sandbox] starting dev server...");
  await sandbox.runCommand({
    cmd: "pnpm",
    args: ["run", "dev"],
    detached: true,
  });

  await new Promise((resolve) => setTimeout(resolve, 5000));
  const previewUrl = sandbox.domain(3000);
  console.log(`[sandbox] dev server ready at ${previewUrl}`);

  return { sandbox, previewUrl };
}

/**
 * Create a new named sandbox from a snapshot.
 */
async function createNamedSandboxFromSnapshot(
  name: string,
  snapshotId: string,
): Promise<{ sandbox: Sandbox; previewUrl: string }> {
  console.log(
    `[sandbox] creating named sandbox "${name}" from snapshot ${snapshotId}...`,
  );
  const sandbox = await Sandbox.create({
    name,
    source: { type: "snapshot", snapshotId },
    ports: [3000],
    timeout: SANDBOX_TIMEOUT,
  });
  console.log(`[sandbox] created "${name}" id=${sandbox.sandboxId}`);

  console.log("[sandbox] starting dev server...");
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
 * After snapshotting, immediately restart the dev server so the user
 * is not affected by the sandbox stopping.
 * Returns the Vercel snapshot ID.
 */
export async function takeSandboxSnapshot(sandbox: Sandbox): Promise<string> {
  console.log(`[sandbox] taking snapshot of ${sandbox.sandboxId}...`);
  const snapshot = await sandbox.snapshot({
    expiration: 0, // Never expire
  });
  console.log(`[sandbox] snapshot created: ${snapshot.snapshotId}`);

  // Snapshot may stop the sandbox — restart the dev server immediately
  await resumeAfterSnapshot(sandbox);

  return snapshot.snapshotId;
}

/**
 * Resume the sandbox dev server after a snapshot.
 * Snapshots can stop the sandbox; this brings it back so the user is unaffected.
 */
async function resumeAfterSnapshot(sandbox: Sandbox): Promise<void> {
  try {
    // Re-fetch to get current status after snapshot
    const current = await Sandbox.get({ sandboxId: sandbox.sandboxId });
    console.log(`[sandbox] post-snapshot status=${current.status}`);

    if (current.status === "running") return;

    if (current.status === "stopped" || current.status === "pending") {
      // Wait for pending to resolve
      if (current.status === "pending") {
        let attempts = 0;
        let s = current;
        while (s.status === "pending" && attempts < 20) {
          await new Promise((r) => setTimeout(r, 500));
          s = await Sandbox.get({ sandboxId: sandbox.sandboxId });
          attempts++;
        }
      }

      console.log(`[sandbox] restarting dev server after snapshot...`);
      await sandbox.runCommand({
        cmd: "pnpm",
        args: ["run", "dev"],
        detached: true,
      });
      await new Promise((r) => setTimeout(r, 3000));
      console.log(`[sandbox] dev server restarted after snapshot`);
    }
  } catch (err) {
    console.error(`[sandbox] failed to resume after snapshot:`, err);
  }
}

/**
 * Extend the sandbox timeout. Called periodically to keep the sandbox
 * alive while the agent is working.
 */
const sandboxDeadlines = new Map<string, number>();

export async function extendSandboxTimeout(sandbox: Sandbox): Promise<void> {
  try {
    const now = Date.now();
    const deadline = sandboxDeadlines.get(sandbox.sandboxId) ?? 0;

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
 * With persistent sandboxes, the filesystem is auto-saved on stop.
 */
export async function shutdownSandbox(sandbox: Sandbox): Promise<void> {
  try {
    await sandbox.stop({ blocking: true });
    console.log(`[sandbox] stopped ${sandbox.sandboxId}`);
  } catch (err) {
    console.error(`[sandbox] failed to stop:`, err);
  }
}
