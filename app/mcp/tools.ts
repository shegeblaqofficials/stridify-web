import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  getProject,
  getProjectPrompts,
  getTelephonyProject,
  getWidgetProject,
  updateProjectPrompt,
} from "@/lib/project/actions";
import {
  deductOrganizationTokens,
  getOrganizationBalance,
  recordSessionMetric,
} from "@/lib/redis/metrics";

/**
 * Helper to wrap any value as a single-text MCP tool response.
 */
function jsonResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
  };
}

function errorResult(message: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}

/**
 * Register every Stridify MCP tool on the given server. Keep tool surface
 * focused on what the LiveKit agent worker actually needs at runtime.
 */
export function registerStridifyTools(server: McpServer) {
  // ── Project context ────────────────────────────────────────────────

  server.tool(
    "get_project_context",
    "Fetch everything the LiveKit agent needs to run a session for a project: latest system prompt, agent type, widget/telephony config, organization id.",
    { projectId: z.string().uuid() },
    async ({ projectId }) => {
      const project = await getProject(projectId);
      if (!project) return errorResult(`Project ${projectId} not found`);

      const [prompts, widget, telephony] = await Promise.all([
        getProjectPrompts(projectId),
        project.agent_type === "widget"
          ? getWidgetProject(projectId)
          : Promise.resolve(null),
        project.agent_type === "telephony"
          ? getTelephonyProject(projectId)
          : Promise.resolve(null),
      ]);

      const latestPrompt =
        prompts.length > 0 ? prompts[prompts.length - 1].content : "";

      return jsonResult({
        projectId: project.project_id,
        organizationId: project.organization_id,
        agentType: project.agent_type,
        title: project.title,
        status: project.status,
        prompt: latestPrompt,
        widget,
        telephony,
      });
    },
  );

  server.tool(
    "update_project_prompt",
    "Replace the system prompt for a project. Use sparingly — this affects every future agent session.",
    {
      projectId: z.string().uuid(),
      content: z.string().min(20).max(20_000),
    },
    async ({ projectId, content }) => {
      const project = await getProject(projectId);
      if (!project) return errorResult(`Project ${projectId} not found`);

      const updated = await updateProjectPrompt(
        projectId,
        project.organization_id,
        content,
      );
      if (!updated) return errorResult("Failed to update prompt");

      return jsonResult({ ok: true, promptId: updated.prompt_id });
    },
  );

  // ── Billing / usage ────────────────────────────────────────────────

  server.tool(
    "get_organization_balance",
    "Return the remaining token balance for an organization. Use to short-circuit a session if the org is out of tokens.",
    { organizationId: z.string() },
    async ({ organizationId }) => {
      const balance = await getOrganizationBalance(organizationId);
      return jsonResult({ organizationId, balance });
    },
  );

  server.tool(
    "record_session_usage",
    "Record token usage for a completed (or in-progress) agent session and deduct it from the organization balance.",
    {
      projectId: z.string().uuid(),
      organizationId: z.string(),
      projectTitle: z.string(),
      inputTokens: z.number().int().nonnegative(),
      outputTokens: z.number().int().nonnegative(),
    },
    async ({
      projectId,
      organizationId,
      projectTitle,
      inputTokens,
      outputTokens,
    }) => {
      await recordSessionMetric({
        organizationId,
        projectId,
        projectTitle,
        inputTokens,
        outputTokens,
      });
      const total = inputTokens + outputTokens;
      if (total > 0) {
        await deductOrganizationTokens(organizationId, total);
      }
      const balance = await getOrganizationBalance(organizationId);
      return jsonResult({ ok: true, deducted: total, balance });
    },
  );
}
