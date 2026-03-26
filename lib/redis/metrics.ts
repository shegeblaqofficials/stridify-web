import { redis } from "./client";
import { createClient } from "@/lib/supabase/server";

// ── Key patterns ──────────────────────────────────────────────────────
// Org total input tokens:   org:tokens:input:{orgId}     → number
// Org total output tokens:  org:tokens:output:{orgId}    → number
// Project sessions count:   project:sessions:{projectId} → number
// Project input tokens:     project:tokens:input:{projectId}  → number
// Project output tokens:    project:tokens:output:{projectId} → number
// Project last active:      project:tokens:last:{projectId}   → string (ISO)
// Org project set:          org:projects:{orgId}         → Set<projectId>
// Balance (token_balance) lives in Supabase — it is the source of truth.

const keys = {
  orgInputTokens: (orgId: string) => `org:tokens:input:${orgId}`,
  orgOutputTokens: (orgId: string) => `org:tokens:output:${orgId}`,
  projectSessions: (pid: string) => `project:sessions:${pid}`,
  projectInputTokens: (pid: string) => `project:tokens:input:${pid}`,
  projectOutputTokens: (pid: string) => `project:tokens:output:${pid}`,
  projectLastActive: (pid: string) => `project:tokens:last:${pid}`,
  orgProjects: (orgId: string) => `org:projects:${orgId}`,
};

// ── Balance (Supabase — source of truth) ──────────────────────────────

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
}

// ── Record a session metric ───────────────────────────────────────────

export async function recordSessionMetric(opts: {
  organizationId: string;
  projectId: string;
  projectTitle: string;
  inputTokens: number;
  outputTokens: number;
}): Promise<void> {
  const { organizationId, projectId, projectTitle, inputTokens, outputTokens } =
    opts;

  const pipeline = redis.pipeline();

  // Track project as belonging to org
  pipeline.sadd(keys.orgProjects(organizationId), projectId);

  // Increment session count
  pipeline.incr(keys.projectSessions(projectId));

  // Increment token counters (project-level)
  pipeline.incrby(keys.projectInputTokens(projectId), inputTokens);
  pipeline.incrby(keys.projectOutputTokens(projectId), outputTokens);

  // Increment token counters (org-level)
  pipeline.incrby(keys.orgInputTokens(organizationId), inputTokens);
  pipeline.incrby(keys.orgOutputTokens(organizationId), outputTokens);

  // Update last active timestamp
  pipeline.set(keys.projectLastActive(projectId), new Date().toISOString());

  await pipeline.exec();
}

// ── Cleanup ───────────────────────────────────────────────────────────

export async function deleteProjectRedisData(
  projectId: string,
  organizationId: string,
): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.del(keys.projectSessions(projectId));
  pipeline.del(keys.projectInputTokens(projectId));
  pipeline.del(keys.projectOutputTokens(projectId));
  pipeline.del(keys.projectLastActive(projectId));
  pipeline.srem(keys.orgProjects(organizationId), projectId);
  await pipeline.exec();
}

// ── Query metrics ─────────────────────────────────────────────────────

export async function getOrganizationTokenUsage(
  organizationId: string,
): Promise<{
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  balance: number;
}> {
  const [inputTokens, outputTokens, balance] = await Promise.all([
    redis.get<number>(keys.orgInputTokens(organizationId)),
    redis.get<number>(keys.orgOutputTokens(organizationId)),
    getOrganizationBalance(organizationId),
  ]);

  const input = inputTokens ?? 0;
  const output = outputTokens ?? 0;

  return {
    inputTokens: input,
    outputTokens: output,
    totalTokens: input + output,
    balance: balance ?? 0,
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
  // Get all project IDs tracked for this org
  const projectIds = await redis.smembers<string[]>(
    keys.orgProjects(organizationId),
  );
  if (!projectIds || projectIds.length === 0) return [];

  // Fetch all project data in a single pipeline
  const pipeline = redis.pipeline();
  for (const pid of projectIds) {
    pipeline.get(keys.projectSessions(pid));
    pipeline.get(keys.projectInputTokens(pid));
    pipeline.get(keys.projectOutputTokens(pid));
    pipeline.get(keys.projectLastActive(pid));
  }

  const results = await pipeline.exec();

  const metrics = [];
  for (let i = 0; i < projectIds.length; i++) {
    const offset = i * 5;
    const title = (results[offset] as string) ?? "Untitled Project";
    const sessions = (results[offset + 1] as number) ?? 0;
    const inputTokens = (results[offset + 2] as number) ?? 0;
    const outputTokens = (results[offset + 3] as number) ?? 0;
    const lastActive = (results[offset + 4] as string) ?? "";

    if (sessions > 0) {
      metrics.push({
        project_id: projectIds[i],
        project_title: title,
        sessions,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
        last_active: lastActive,
      });
    }
  }

  // Sort by last_active descending
  metrics.sort(
    (a, b) =>
      new Date(b.last_active).getTime() - new Date(a.last_active).getTime(),
  );

  return metrics;
}
