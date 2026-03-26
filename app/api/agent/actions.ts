import type { Sandbox } from "@vercel/sandbox";
import { Snapshot as VercelSnapshot } from "@vercel/sandbox";
import type { Snapshot } from "@/model/project/snapshot";
import {
  createSandboxFromTemplate,
  createSandboxFromSnapshot,
  getExistingSandbox,
  takeSandboxSnapshot,
} from "@/lib/sandbox/manager";
import { getProject } from "@/lib/project/actions";
import { recordSessionMetric } from "@/lib/redis/metrics";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_SNAPSHOTS = 5;

/* --------------------------------------------------------------------------
 * Sandbox resolution
 * ----------------------------------------------------------------------- */

export async function resolveSandbox(
  projectId: string,
  projectSandboxId: string | null,
  latestSnapshot: Snapshot | null,
): Promise<{ sandbox: Sandbox; previewUrl: string }> {
  // 1. Try to reconnect to the project's current sandbox
  if (projectSandboxId) {
    const existing = await getExistingSandbox(projectSandboxId);
    if (existing) {
      console.log(
        `[sandbox] reusing existing sandbox ${existing.sandbox.sandboxId}`,
      );
      return existing;
    }
  }

  // 2. Check if a warmup created a sandbox while we were loading
  const freshProject = await getProject(projectId);
  if (
    freshProject?.sandbox_id &&
    freshProject.sandbox_id !== projectSandboxId
  ) {
    console.log(
      `[sandbox] warmup created sandbox ${freshProject.sandbox_id}, trying to connect...`,
    );
    const existing = await getExistingSandbox(freshProject.sandbox_id);
    if (existing) return existing;
  }

  // 3. Create from snapshot or template
  console.log("[sandbox] creating new sandbox...");
  return latestSnapshot
    ? await createSandboxFromSnapshot(latestSnapshot.snapshot_id)
    : await createSandboxFromTemplate();
}

/* --------------------------------------------------------------------------
 * Snapshot + provision new sandbox
 * ----------------------------------------------------------------------- */

export async function snapshotAndProvision(
  sandbox: Sandbox,
  projectId: string,
  organizationId: string,
  nextVersionNumber: number,
): Promise<void> {
  const supabase = createAdminClient();

  try {
    const snapshotId = await takeSandboxSnapshot(sandbox);

    // Prune old snapshots before inserting
    await pruneOldSnapshots(supabase, projectId);

    // Insert new snapshot record
    const { error } = await supabase.from("snapshots").insert({
      snapshot_id: snapshotId,
      project_id: projectId,
      organization_id: organizationId,
      version_name: `v${nextVersionNumber}`,
      version_number: nextVersionNumber,
    });
    if (error) {
      console.error("[agent] failed to save snapshot to DB:", error.message);
    } else {
      console.log(`[agent] snapshot ${snapshotId} saved for ${projectId}`);
    }

    // Create a new sandbox from the snapshot so the preview URL stays live.
    const warm = await createSandboxFromSnapshot(snapshotId);

    // Update project with new sandbox info (cookie-free)
    await supabase
      .from("projects")
      .update({
        sandbox_id: warm.sandbox.sandboxId,
        preview_url: warm.previewUrl,
      })
      .eq("project_id", projectId);

    console.log(
      `[agent] new sandbox ${warm.sandbox.sandboxId} ready at ${warm.previewUrl}`,
    );
  } catch (err) {
    console.error("[agent] snapshot/new-sandbox failed:", err);
  }
}

/* --------------------------------------------------------------------------
 * Snapshot pruning (cookie-free, uses admin client)
 * ----------------------------------------------------------------------- */

async function pruneOldSnapshots(
  supabase: ReturnType<typeof createAdminClient>,
  projectId: string,
): Promise<void> {
  const keepCount = MAX_SNAPSHOTS - 1;

  const { data: all } = await supabase
    .from("snapshots")
    .select("id, snapshot_id")
    .eq("project_id", projectId)
    .order("version_number", { ascending: false });

  if (!all || all.length <= keepCount) return;

  const toDelete = all.slice(keepCount);
  console.log(
    `[snapshot] pruning ${toDelete.length} old snapshot(s) for project ${projectId}`,
  );

  // Delete from Vercel in parallel (best-effort)
  await Promise.allSettled(
    toDelete.map(async (row) => {
      try {
        const snap = await VercelSnapshot.get({ snapshotId: row.snapshot_id });
        await snap.delete();
        console.log(`[snapshot] deleted Vercel snapshot ${row.snapshot_id}`);
      } catch (err) {
        console.error(
          `[snapshot] failed to delete Vercel snapshot ${row.snapshot_id}:`,
          err,
        );
      }
    }),
  );

  const ids = toDelete.map((row) => row.id);
  const { error } = await supabase.from("snapshots").delete().in("id", ids);

  if (error) {
    console.error("[snapshot] failed to delete old snapshots from DB:", error);
  }
}

/* --------------------------------------------------------------------------
 * Incremental token deduction
 * --------------------------------------------------------------------------
 * Called after each orchestrator step to deduct only the delta since the
 * last deduction. This keeps the DB balance accurate in near-real-time
 * rather than waiting until the stream finishes.
 * ----------------------------------------------------------------------- */

export async function deductTokensIncremental(
  organizationId: string,
  tokensToDeduct: number,
): Promise<number> {
  if (tokensToDeduct <= 0) return 0;
  try {
    const supabase = createAdminClient();
    const { data: org } = await supabase
      .from("organizations")
      .select("token_balance")
      .eq("organization_id", organizationId)
      .single();

    const currentBalance = org?.token_balance ?? 0;
    const newBalance = Math.max(0, currentBalance - tokensToDeduct);

    await supabase
      .from("organizations")
      .update({ token_balance: newBalance })
      .eq("organization_id", organizationId);

    console.log(
      `[metric] incremental deduct ${tokensToDeduct} tokens — balance ${currentBalance} → ${newBalance}`,
    );
    return newBalance;
  } catch (err) {
    console.error("[metric] incremental deduction failed:", err);
    return -1;
  }
}

/* --------------------------------------------------------------------------
 * Token metrics
 * ----------------------------------------------------------------------- */

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export async function logTokenMetrics(
  organizationId: string,
  projectId: string,
  projectTitle: string,
  usage: TokenUsage,
  alreadyDeducted: number,
): Promise<void> {
  try {
    const remainder = Math.max(0, usage.totalTokens - alreadyDeducted);
    console.log(
      `[metric] logging tokens — in=${usage.inputTokens} out=${usage.outputTokens} total=${usage.totalTokens} alreadyDeducted=${alreadyDeducted} remainder=${remainder}`,
    );

    const supabase = createAdminClient();

    // Only deduct the remainder that wasn't covered by incremental deductions
    const deductPromise =
      remainder > 0
        ? (async () => {
            const { data: org } = await supabase
              .from("organizations")
              .select("token_balance")
              .eq("organization_id", organizationId)
              .single();
            const currentBalance = org?.token_balance ?? 0;
            const newBalance = Math.max(0, currentBalance - remainder);
            await supabase
              .from("organizations")
              .update({ token_balance: newBalance })
              .eq("organization_id", organizationId);
          })()
        : Promise.resolve();

    await Promise.all([
      recordSessionMetric({
        organizationId,
        projectId,
        projectTitle,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
      }),
      deductPromise,
    ]);

    console.log(`[metric] session recorded & tokens deducted for ${projectId}`);
  } catch (err) {
    console.error("[metric] failed to save metrics:", err);
  }
}
