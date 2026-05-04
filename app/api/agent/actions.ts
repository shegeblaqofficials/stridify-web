import type { Sandbox } from "@vercel/sandbox";
import { Snapshot as VercelSnapshot } from "@vercel/sandbox";
import type { Snapshot } from "@/model/project/snapshot";
import { getOrCreateSandbox, takeSandboxSnapshot } from "@/lib/sandbox/manager";
import { getProject } from "@/lib/project/actions";
import { recordSessionMetric } from "@/lib/redis/metrics";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_SNAPSHOTS = 5;

/* --------------------------------------------------------------------------
 * Sandbox resolution — uses named persistent sandboxes
 * ----------------------------------------------------------------------- */

export async function resolveSandbox(
  projectId: string,
  latestSnapshot: Snapshot | null,
  slot = 1,
): Promise<{ sandbox: Sandbox; previewUrl: string }> {
  return getOrCreateSandbox(projectId, latestSnapshot?.snapshot_id, slot);
}

/* --------------------------------------------------------------------------
 * Manual snapshot — triggered by user "Save Version" action
 * ----------------------------------------------------------------------- */

export async function saveSnapshot(
  sandbox: Sandbox,
  projectId: string,
  organizationId: string,
  nextVersionNumber: number,
  versionName?: string,
): Promise<{ snapshotId: string; versionNumber: number } | null> {
  const supabase = createAdminClient();

  try {
    const snapshotId = await takeSandboxSnapshot(sandbox);

    // Prune old snapshots before inserting
    await pruneOldSnapshots(supabase, projectId);

    const label = versionName || `v${nextVersionNumber}`;

    // Insert new snapshot record
    const { error } = await supabase.from("snapshots").insert({
      snapshot_id: snapshotId,
      project_id: projectId,
      organization_id: organizationId,
      version_name: label,
      version_number: nextVersionNumber,
    });
    if (error) {
      console.error("[snapshot] failed to save to DB:", error.message);
      return null;
    }

    console.log(
      `[snapshot] saved ${snapshotId} as "${label}" for ${projectId}`,
    );
    return { snapshotId, versionNumber: nextVersionNumber };
  } catch (err) {
    console.error("[snapshot] save failed:", err);
    return null;
  }
}

/* --------------------------------------------------------------------------
 * Emergency snapshot on balance exhaustion
 * ----------------------------------------------------------------------- */

export async function emergencySnapshot(
  sandbox: Sandbox,
  projectId: string,
  organizationId: string,
  nextVersionNumber: number,
): Promise<void> {
  try {
    await saveSnapshot(
      sandbox,
      projectId,
      organizationId,
      nextVersionNumber,
      `v${nextVersionNumber} (auto-save)`,
    );
  } catch (err) {
    console.error("[agent] emergency snapshot failed:", err);
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
 * Token metrics
 * --------------------------------------------------------------------------
 * Records session statistics only. Token balance reconciliation is handled
 * separately by reconcileBooking() in lib/redis/token-balance.ts (atomic
 * Redis INCRBY/DECRBY — no Supabase read-modify-write race conditions).
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
): Promise<void> {
  try {
    console.log(
      `[metric] logging tokens — in=${usage.inputTokens} out=${usage.outputTokens} total=${usage.totalTokens}`,
    );
    await recordSessionMetric({
      organizationId,
      projectId,
      projectTitle,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
    });
    console.log(`[metric] session recorded for ${projectId}`);
  } catch (err) {
    console.error("[metric] failed to save metrics:", err);
  }
}
