/**
 * MCP Knowledge Tools
 * Agents use these to query and manage knowledge
 */

import { searchKnowledge } from "@/lib/knowledge/search";

interface KnowledgeToolInput {
  query?: string;
  organization_id: string;
  project_id: string;
  limit?: number;
  chunk_id?: string;
  quality?: number;
}

/**
 * Query Knowledge Tool
 * Search the knowledge base for relevant documents
 */
export const queryKnowledgeTool = {
  name: "query_knowledge",
  description:
    "Search the knowledge base for relevant information using semantic similarity. Returns the most relevant document chunks ordered by relevance.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query or question",
      },
      organization_id: {
        type: "string",
        description: "Organization ID",
      },
      project_id: {
        type: "string",
        description: "Project ID",
      },
      limit: {
        type: "number",
        description: "Max results (1-20, default 5)",
        default: 5,
      },
    },
    required: ["query", "organization_id", "project_id"],
  },
  execute: async (input: KnowledgeToolInput) => {
    const { query, organization_id, project_id, limit } = input;

    const results = await searchKnowledge(
      query!,
      organization_id,
      project_id,
      limit || 5,
    );

    if (results.length === 0) {
      return JSON.stringify({
        success: true,
        message: "No matching documents found",
        results: [],
      });
    }

    return JSON.stringify({
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
  },
};
