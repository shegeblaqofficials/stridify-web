"use server";

import type {
  Project,
  AgentType,
  ProjectAccessType,
} from "@/model/project/project";
import type { Prompt } from "@/model/project/prompt";
import { createClient } from "../supabase/server";
import { cookies } from "next/headers";
import { Snapshot as VercelSnapshot } from "@vercel/sandbox";
import {
  getOrganizationBalance,
  deleteProjectRedisData,
} from "@/lib/redis/metrics";
import { deleteChatMessages } from "@/lib/redis/chat";

const PENDING_PROMPT_COOKIE = "pendingPrompt";

export async function setPendingPrompt(
  prompt: string,
  agentType: string,
  accessType: string = "public",
) {
  const cookieStore = await cookies();
  cookieStore.set(
    PENDING_PROMPT_COOKIE,
    JSON.stringify({ prompt, agentType, accessType }),
    {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
    },
  );
}

export async function createProjectFromPendingPrompt(
  organizationId: string,
  userId: string,
): Promise<{ project: Project; prompt: Prompt } | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PENDING_PROMPT_COOKIE)?.value;
  if (!raw) return null;

  // Clear the cookie immediately
  cookieStore.delete(PENDING_PROMPT_COOKIE);

  try {
    const { prompt, agentType, accessType } = JSON.parse(raw);
    if (!prompt) return null;
    return createProject(
      organizationId,
      userId,
      prompt.slice(0, 80),
      agentType || "web",
      prompt,
      accessType || "public",
    );
  } catch {
    return null;
  }
}

export async function createProject(
  organizationId: string,
  user_id: string,
  title: string,
  agentType: AgentType,
  promptContent: string,
  accessType: ProjectAccessType = "public",
): Promise<{ project: Project; prompt: Prompt } | null> {
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      project_id: crypto.randomUUID(),
      organization_id: organizationId,
      title,
      agent_type: agentType,
      created_by_user_id: user_id,
      status: "draft",
      access_type: accessType,
    })
    .select()
    .single();

  if (projectError || !project) {
    console.error("Error creating project:", projectError?.message);
    return null;
  }

  const { data: prompt, error: promptError } = await supabase
    .from("prompts")
    .insert({
      prompt_id: crypto.randomUUID(),
      project_id: project.project_id,
      organization_id: organizationId,
      content: promptContent,
      created_by_user_id: user_id,
    })
    .select()
    .single();

  if (promptError || !prompt) {
    console.error("Error creating prompt:", promptError?.message);
    return null;
  }

  // If agent type is telephony, create a telephony_projects record
  if (agentType === "telephony") {
    await createTelephonyProject({
      projectId: project.project_id,
      organizationId: organizationId,
      agentName: "Voice Assistant",
      agentVoice: "nova-professional",
      voiceProvider: "openai",
      provider: "livekit",
    });
  }

  return { project: project as Project, prompt: prompt as Prompt };
}

export async function getProject(projectId: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("project_id", projectId)
    .single();
  return (data as Project) ?? null;
}

/**
 * Check whether a project's organization has exhausted its token balance.
 * Used by the client to verify balance after a streaming error/abort.
 */
export async function checkProjectBalance(
  projectId: string,
): Promise<{ exhausted: boolean }> {
  const project = await getProject(projectId);
  if (!project) return { exhausted: false };
  const balance = await getOrganizationBalance(project.organization_id);
  return { exhausted: balance <= 0 };
}

export async function getProjectPrompts(projectId: string): Promise<Prompt[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("prompts")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  return (data as Prompt[]) ?? [];
}

/**
 * Update the content of the latest prompt for a project (or insert one if
 * none exists). Returns the resulting prompt row, or null on failure.
 *
 * Used by the widget agent's `updatePrompt` tool to refine the system
 * instructions that will be injected into the LiveKit voice agent.
 */
export async function updateProjectPrompt(
  projectId: string,
  organizationId: string,
  content: string,
  userId?: string,
): Promise<Prompt | null> {
  const supabase = await createClient();

  // Look up the most recent prompt for this project
  const { data: existing } = await supabase
    .from("prompts")
    .select("prompt_id")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.prompt_id) {
    const { data, error } = await supabase
      .from("prompts")
      .update({ content })
      .eq("prompt_id", existing.prompt_id)
      .select()
      .single();
    if (error) {
      console.error("Error updating prompt:", error.message);
      return null;
    }
    return data as Prompt;
  }

  // No prompt exists — insert one
  const { data, error } = await supabase
    .from("prompts")
    .insert({
      prompt_id: crypto.randomUUID(),
      project_id: projectId,
      organization_id: organizationId,
      content,
      created_by_user_id: userId,
    })
    .select()
    .single();
  if (error) {
    console.error("Error inserting prompt:", error.message);
    return null;
  }
  return data as Prompt;
}

export async function getProjects(organizationId: string): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });
  return (data as Project[]) ?? [];
}

export async function updateProjectSandbox(
  projectId: string,
  sandboxId: string,
  previewUrl: string,
) {
  const supabase = await createClient();
  await supabase
    .from("projects")
    .update({ sandbox_id: sandboxId, preview_url: previewUrl })
    .eq("project_id", projectId);
}

export async function updateProjectTitle(
  projectId: string,
  title: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ title })
    .eq("project_id", projectId);
  if (error) {
    console.error("Error updating project title:", error.message);
    return false;
  }
  return true;
}

export async function updateProjectStatus(
  projectId: string,
  status: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("project_id", projectId);
  if (error) {
    console.error("Error updating project status:", error.message);
    return false;
  }
  return true;
}

export async function deleteProject(projectId: string): Promise<boolean> {
  const supabase = await createClient();

  // Fetch org ID before deleting so we can clean up Redis
  const { data: project } = await supabase
    .from("projects")
    .select("organization_id")
    .eq("project_id", projectId)
    .single();

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("project_id", projectId);
  if (error) {
    console.error("Error deleting project:", error.message);
    return false;
  }

  // Cascade: clean up Redis data (best-effort, don't fail the delete)
  try {
    const cleanups: Promise<void>[] = [deleteChatMessages(projectId)];
    if (project?.organization_id) {
      cleanups.push(deleteProjectRedisData(projectId, project.organization_id));
    }
    await Promise.all(cleanups);
  } catch (err) {
    console.error("Error cleaning up Redis data for project:", err);
  }

  // Cascade: delete associated prompt
  try {
    await supabase.from("prompts").delete().eq("project_id", projectId);
  } catch (err) {
    console.error("Error deleting prompt for project:", err);
  }

  // Cascade: delete associated snapshots (Vercel + DB)
  try {
    const { data: snapshots } = await supabase
      .from("snapshots")
      .select("id, snapshot_id")
      .eq("project_id", projectId);

    if (snapshots && snapshots.length > 0) {
      // Delete from Vercel in parallel (best-effort)
      await Promise.allSettled(
        snapshots.map(async (row) => {
          try {
            const snap = await VercelSnapshot.get({
              snapshotId: row.snapshot_id,
            });
            await snap.delete();
          } catch {}
        }),
      );

      // Delete from database
      const ids = snapshots.map((row) => row.id);
      await supabase.from("snapshots").delete().in("id", ids);
    }
  } catch (err) {
    console.error("Error deleting snapshots for project:", err);
  }

  // Cascade: delete associated telephony project record
  try {
    await supabase
      .from("telephony_projects")
      .delete()
      .eq("project_id", projectId);
  } catch (err) {
    console.error("Error deleting telephony project for project:", err);
  }

  return true;
}

// ─── Telephony Project Helpers ─────────────────────────────

import type { TelephonyProject } from "@/model/project/telephony-project";

export async function createTelephonyProject(params: {
  projectId: string;
  organizationId: string;
  agentName: string;
  agentVoice: string;
  voiceProvider: string;
  provider: string;
}): Promise<TelephonyProject | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("telephony_projects")
    .insert({
      telephony_project_id: crypto.randomUUID(),
      project_id: params.projectId,
      organization_id: params.organizationId,
      agent_name: params.agentName,
      agent_voice: params.agentVoice,
      voice_provider: params.voiceProvider,
      agent_status: "not_connected",
      provider: params.provider,
      telephone_number: null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error(
      "[telephony] Error creating telephony project:",
      error?.message,
    );
    return null;
  }

  return data as TelephonyProject;
}

export async function getTelephonyProject(
  projectId: string,
): Promise<TelephonyProject | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("telephony_projects")
    .select()
    .eq("project_id", projectId)
    .single();

  if (error || !data) return null;
  return data as TelephonyProject;
}

export async function updateTelephonyProject(params: {
  projectId: string;
  agentName?: string;
  agentVoice?: string;
  telephoneNumber?: string | null;
  agentStatus?: string;
}): Promise<TelephonyProject | null> {
  const supabase = await createClient();
  const update: Record<string, any> = {};
  if (params.agentName) update.agent_name = params.agentName;
  if (params.agentVoice) update.agent_voice = params.agentVoice;
  if (params.telephoneNumber !== undefined)
    update.telephone_number = params.telephoneNumber;
  if (params.agentStatus) update.agent_status = params.agentStatus;

  const { data, error } = await supabase
    .from("telephony_projects")
    .update(update)
    .eq("project_id", params.projectId)
    .select()
    .maybeSingle();

  if (error || !data) {
    console.error(
      "[telephony] Error updating telephony project:",
      error?.message,
    );
    return null;
  }

  return data as TelephonyProject;
}
