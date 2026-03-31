"use server";

import type {
  Deployment,
  VercelProject,
  DeploymentStatus,
} from "@/model/deployment/deployment";
import { createClient } from "@/lib/supabase/server";

// ─── Vercel Project Helpers ────────────────────────────────

export async function getVercelProjectByProjectId(
  projectId: string,
): Promise<VercelProject | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vercel_projects")
    .select()
    .eq("project_id", projectId)
    .single();

  if (error || !data) return null;
  return data as VercelProject;
}

export async function createVercelProjectRecord(params: {
  vercelProjectId: string;
  projectId: string;
  organizationId: string;
  vercelProjectName: string;
  framework?: string;
}): Promise<VercelProject | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vercel_projects")
    .insert({
      vercel_project_id: params.vercelProjectId,
      project_id: params.projectId,
      organization_id: params.organizationId,
      vercel_project_name: params.vercelProjectName,
      framework: params.framework ?? "nextjs",
    })
    .select()
    .single();

  if (error || !data) {
    console.error(
      "[deployment] Error creating vercel project record:",
      error?.message,
    );
    return null;
  }
  return data as VercelProject;
}

// ─── Deployment Helpers ────────────────────────────────────

export async function createDeploymentRecord(params: {
  deploymentId: string;
  projectId: string;
  organizationId: string;
  vercelProjectId: string;
  vercelDeploymentId: string;
  environment: string;
  status: string;
  url?: string;
  inspectorUrl?: string;
  deploymentName?: string;
  createdByUserId?: string;
  deploymentProvider?: string;
}): Promise<Deployment | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deployments")
    .insert({
      deployment_id: params.deploymentId,
      project_id: params.projectId,
      organization_id: params.organizationId,
      deployer_project_id: params.vercelProjectId,
      deployer_deployment_id: params.vercelDeploymentId,
      deployment_provider: params.deploymentProvider ?? "vercel",
      environment: params.environment,
      status: params.status,
      url: params.url,
      inspector_url: params.inspectorUrl,
      deployment_name: params.deploymentName,
      created_by_user_id: params.createdByUserId,
    })
    .select()
    .single();

  if (error || !data) {
    console.error(
      "[deployment] Error creating deployment record:",
      error?.message,
    );
    return null;
  }
  return data as Deployment;
}

export async function updateDeploymentStatus(
  deploymentId: string,
  status: DeploymentStatus,
  url?: string,
): Promise<void> {
  const supabase = await createClient();
  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (url) update.url = url;

  const { error } = await supabase
    .from("deployments")
    .update(update)
    .eq("deployment_id", deploymentId);

  if (error) {
    console.error(
      "[deployment] Error updating deployment status:",
      error.message,
    );
  }
}

export async function getDeployment(
  deploymentId: string,
): Promise<Deployment | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deployments")
    .select()
    .eq("deployment_id", deploymentId)
    .single();

  if (error || !data) return null;
  return data as Deployment;
}

export async function getProjectDeployments(
  projectId: string,
): Promise<Deployment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deployments")
    .select()
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Deployment[];
}

export async function getOrganizationDeployments(
  organizationId: string,
): Promise<Deployment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deployments")
    .select()
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Deployment[];
}

export async function countOtherDeploymentsForVercelProject(
  vercelProjectId: string,
  excludeDeploymentId: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("deployments")
    .select("id", { count: "exact", head: true })
    .eq("deployer_project_id", vercelProjectId)
    .neq("deployment_id", excludeDeploymentId);

  if (error) {
    console.error(
      "[deployment] Error counting project deployments:",
      error.message,
    );
    return 0;
  }

  return count ?? 0;
}

export async function deleteDeploymentRecord(
  deploymentId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("deployments")
    .delete()
    .eq("deployment_id", deploymentId);

  if (error) {
    console.error(
      "[deployment] Error deleting deployment record:",
      error.message,
    );
    return false;
  }

  return true;
}

export async function deleteVercelProjectRecord(
  vercelProjectId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("vercel_projects")
    .delete()
    .eq("vercel_project_id", vercelProjectId);

  if (error) {
    console.error(
      "[deployment] Error deleting vercel project record:",
      error.message,
    );
    return false;
  }

  return true;
}
