"use server";

import { Snapshot as VercelSnapshot } from "@vercel/sandbox";
import type { Snapshot } from "@/model/project/snapshot";
import { createClient } from "../supabase/server";

const MAX_SNAPSHOTS = 5;

export async function createSnapshot(
  projectId: string,
  organizationId: string,
  snapshotId: string,
  versionName: string,
): Promise<Snapshot | null> {
  const supabase = await createClient();

  // Prune to MAX_SNAPSHOTS - 1 before inserting so we always end up at MAX_SNAPSHOTS
  await pruneOldSnapshots(projectId);

  // Get the current highest version number for this project
  const { data: latest } = await supabase
    .from("snapshots")
    .select("version_number")
    .eq("project_id", projectId)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();

  const versionNumber = (latest?.version_number ?? 0) + 1;

  const { data, error } = await supabase
    .from("snapshots")
    .insert({
      snapshot_id: snapshotId,
      project_id: projectId,
      organization_id: organizationId,
      version_name: versionName || `v${versionNumber}`,
      version_number: versionNumber,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating snapshot:", error.message);
    return null;
  }

  return data as Snapshot;
}

export async function getLatestSnapshot(
  projectId: string,
): Promise<Snapshot | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("snapshots")
    .select("*")
    .eq("project_id", projectId)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();
  return (data as Snapshot) ?? null;
}

export async function getProjectSnapshots(
  projectId: string,
): Promise<Snapshot[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("snapshots")
    .select("*")
    .eq("project_id", projectId)
    .order("version_number", { ascending: false })
    .limit(MAX_SNAPSHOTS);
  return (data as Snapshot[]) ?? [];
}

/**
 * Keep only the newest (MAX_SNAPSHOTS - 1) snapshots for a project,
 * deleting everything else from both Vercel and the database.
 * Called before inserting a new snapshot so the total stays at MAX_SNAPSHOTS.
 */
async function pruneOldSnapshots(projectId: string): Promise<void> {
  const supabase = await createClient();
  const keepCount = MAX_SNAPSHOTS - 1;

  // Fetch ALL snapshots for the project, newest first
  const { data: all } = await supabase
    .from("snapshots")
    .select("id, snapshot_id")
    .eq("project_id", projectId)
    .order("version_number", { ascending: false });

  if (!all || all.length <= keepCount) return;

  // Everything after the first `keepCount` entries gets deleted
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

  // Delete from database
  const ids = toDelete.map((row) => row.id);
  const { error } = await supabase.from("snapshots").delete().in("id", ids);

  if (error) {
    console.error("[snapshot] failed to delete old snapshots from DB:", error);
  }
}
