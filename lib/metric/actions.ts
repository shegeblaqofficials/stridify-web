"use server";

import type { Metric, MetricInput } from "@/model/metric/metric";
import { createClient } from "../supabase/server";

export async function getOrganizationBalance(
  organizationId: string,
): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("token_balance")
    .eq("organization_id", organizationId)
    .single();
  return data?.token_balance ?? 0;
}

export async function createMetric(input: MetricInput): Promise<Metric | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("metrics")
    .insert({
      project_id: input.project_id,
      organization_id: input.organization_id,
      type: input.type,
      input_token_count: input.input_token_count,
      output_token_count: input.output_token_count,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating metric:", error.message);
    return null;
  }
  return data as Metric;
}

export async function getProjectMetrics(projectId: string): Promise<Metric[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("metrics")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return (data as Metric[]) ?? [];
}

export async function getProjectMetricsByType(
  projectId: string,
  type: string,
): Promise<Metric[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("metrics")
    .select("*")
    .eq("project_id", projectId)
    .eq("type", type)
    .order("created_at", { ascending: false });

  return (data as Metric[]) ?? [];
}

export async function getOrganizationTokenUsage(
  organizationId: string,
): Promise<{
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  balance: number;
}> {
  const supabase = await createClient();

  // Get org token balance
  const { data: org } = await supabase
    .from("organizations")
    .select("token_balance")
    .eq("organization_id", organizationId)
    .single();

  const tokenBalance = org?.token_balance ?? 0;

  // Get all project IDs for this org
  const { data: projects } = await supabase
    .from("projects")
    .select("project_id")
    .eq("organization_id", organizationId);

  if (!projects || projects.length === 0) {
    return {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      balance: tokenBalance,
    };
  }

  const projectIds = projects.map((p) => p.project_id);

  // Sum token metrics across all org projects
  const { data: metrics } = await supabase
    .from("metrics")
    .select("type, value")
    .in("project_id", projectIds)
    .in("type", ["token_input", "token_output", "token_total"]);

  if (!metrics || metrics.length === 0) {
    return {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      balance: tokenBalance,
    };
  }

  let inputTokens = 0;
  let outputTokens = 0;
  let totalTokens = 0;

  for (const m of metrics) {
    if (m.type === "token_input") inputTokens += m.value;
    else if (m.type === "token_output") outputTokens += m.value;
    else if (m.type === "token_total") totalTokens += m.value;
  }

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    balance: tokenBalance - totalTokens,
  };
}

export async function getOrganizationMetrics(organizationId: string): Promise<
  {
    project_id: string;
    project_title: string;
    sessions: number;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    last_active: string;
  }[]
> {
  const supabase = await createClient();

  // Fetch all metrics for the org
  const { data: metrics } = await supabase
    .from("metrics")
    .select("project_id, input_token_count, output_token_count, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (!metrics || metrics.length === 0) return [];

  // Fetch project titles
  const projectIds = [...new Set(metrics.map((m) => m.project_id))];
  const { data: projects } = await supabase
    .from("projects")
    .select("project_id, title")
    .in("project_id", projectIds);

  const titleMap = new Map(
    (projects ?? []).map((p) => [p.project_id, p.title]),
  );

  // Aggregate per project
  const grouped = new Map<
    string,
    {
      sessions: number;
      input_tokens: number;
      output_tokens: number;
      last_active: string;
    }
  >();

  for (const m of metrics) {
    const existing = grouped.get(m.project_id);
    if (existing) {
      existing.sessions += 1;
      existing.input_tokens += m.input_token_count;
      existing.output_tokens += m.output_token_count;
    } else {
      grouped.set(m.project_id, {
        sessions: 1,
        input_tokens: m.input_token_count,
        output_tokens: m.output_token_count,
        last_active: m.created_at,
      });
    }
  }

  return Array.from(grouped.entries()).map(([projectId, data]) => ({
    project_id: projectId,
    project_title: titleMap.get(projectId) ?? "Untitled Project",
    sessions: data.sessions,
    input_tokens: data.input_tokens,
    output_tokens: data.output_tokens,
    total_tokens: data.input_tokens + data.output_tokens,
    last_active: data.last_active,
  }));
}

export async function deductOrganizationTokens(
  organizationId: string,
  tokensUsed: number,
): Promise<void> {
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("token_balance")
    .eq("organization_id", organizationId)
    .single();

  const currentBalance = org?.token_balance ?? 0;
  const newBalance = Math.max(0, currentBalance - tokensUsed);

  await supabase
    .from("organizations")
    .update({ token_balance: newBalance })
    .eq("organization_id", organizationId);

  console.log(
    `[metric] deducted ${tokensUsed} tokens from org ${organizationId}: ${currentBalance} → ${newBalance}`,
  );
}
