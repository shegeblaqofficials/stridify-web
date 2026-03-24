"use server";

import type { Snapshot } from "@/model/project/snapshot";
import { createClient } from "../supabase/server";

export async function createSnapshot(
  projectId: string,
  organizationId: string,
  snapshotId: string,
  versionName: string,
): Promise<Snapshot | null> {
  const supabase = await createClient();

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
    .limit(5);
  return (data as Snapshot[]) ?? [];
}
