import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getProject } from "@/lib/project/actions";
import { getOrganizationBalance } from "@/lib/redis/metrics";
import { searchKnowledge } from "@/lib/knowledge/search";

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
  // Knowledge Tools for RAG with pgvector
  server.tool(
    "query_knowledge",
    "Search the knowledge base for the organization to answer questions using semantic similarity. Returns the most relevant document chunks.",
    {
      query: z.string().describe("The search query or question"),
      organization_id: z.string().describe("Organization ID"),
      project_id: z.string().describe("Project ID"),
      limit: z.number().optional().default(5).describe("Max results (1-20)"),
    },
    async ({ query, organization_id, project_id, limit }) => {
      try {
        const results = await searchKnowledge(
          query,
          organization_id,
          project_id,
          limit || 5,
        );

        if (results.length === 0) {
          return jsonResult({
            success: true,
            message: "No matching documents found",
            results: [],
          });
        }

        return jsonResult({
          success: true,
          query,
          results: results.map((r) => ({
            filename: r.filename,
            text: r.text,
            similarity: (r.similarity * 100).toFixed(1) + "%",
            chunk_index: r.chunk_index,
          })),
          count: results.length,
        });
      } catch (error) {
        return errorResult(
          `Knowledge search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },
  );
}
