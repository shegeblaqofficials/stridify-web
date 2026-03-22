"use server";

import type { Project, AgentType } from "@/model/project/project";
import type { Prompt } from "@/model/project/prompt";
import { createClient } from "../supabase/server";
import { cookies } from "next/headers";
import { getOrganizationBalance } from "@/lib/redis/metrics";

const PENDING_PROMPT_COOKIE = "pendingPrompt";

export async function setPendingPrompt(prompt: string, agentType: string) {
  const cookieStore = await cookies();
  cookieStore.set(
    PENDING_PROMPT_COOKIE,
    JSON.stringify({ prompt, agentType }),
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
    const { prompt, agentType } = JSON.parse(raw);
    if (!prompt) return null;
    return createProject(
      organizationId,
      userId,
      prompt.slice(0, 80),
      agentType || "web",
      prompt,
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

export async function deleteProject(projectId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("project_id", projectId);
  if (error) {
    console.error("Error deleting project:", error.message);
    return false;
  }
  return true;
}
