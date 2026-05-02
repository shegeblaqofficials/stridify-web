import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getProject } from "@/lib/project/actions";
import { getOrganizationBalance } from "@/lib/redis/metrics";

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

export function registerStridifyTools(server: McpServer) {
  server.tool(
    "get_company_details",
    "Fetch company details for a given project.",
    { projectId: z.string().uuid() },
    async ({ projectId }) => {
      return jsonResult({
        projectId,
        company: {
          name: "Acme Corp",
          industry: "Technology",
          founded: 2018,
          employees: 142,
          website: "https://acme.example.com",
          headquarters: "San Francisco, CA",
          plan: "pro",
        },
      });
    },
  );

  server.tool(
    "get_balance",
    "Fetch the token balance for the organization that owns a project.",
    { projectId: z.string().uuid() },
    async ({ projectId }) => {
      const project = await getProject(projectId);
      if (!project) return errorResult(`Project ${projectId} not found`);

      const balance = await getOrganizationBalance(project.organization_id);

      return jsonResult({
        projectId: project.project_id,
        organizationId: project.organization_id,
        balance,
      });
    },
  );
}
