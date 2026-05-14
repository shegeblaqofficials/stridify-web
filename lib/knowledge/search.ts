/**
 * Knowledge Search Service
 * Query embeddings using pgvector similarity
 */

import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@/lib/supabase/server";
import type { SearchResult } from "@/model/knowledge/schema";

/**
 * Generate embedding for search query using OpenAI
 */
async function getQueryEmbedding(query: string): Promise<number[]> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not set. Using zero vector fallback.");
      return new Array(384).fill(0);
    }

    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: query,
    });

    // Normalize from 1536 to 384 dimensions (same as document chunks)
    if (embedding.length === 1536) {
      const normalized = new Array(384);
      const stride = 1536 / 384;
      for (let j = 0; j < 384; j++) {
        const start = Math.floor(j * stride);
        const end = Math.floor((j + 1) * stride);
        normalized[j] =
          embedding
            .slice(start, end)
            .reduce((a: number, b: number) => a + b, 0) /
          (end - start);
      }
      return normalized;
    }

    if (embedding.length === 384) {
      return embedding;
    }

    if (embedding.length > 384) {
      return embedding.slice(0, 384);
    }

    return [...embedding, ...new Array(384 - embedding.length).fill(0)];
  } catch (error) {
    console.error("Query embedding failed:", error);
    // Return zero vector as fallback
    return new Array(384).fill(0);
  }
}

/**
 * Search knowledge base using vector similarity
 * Uses cosine similarity with pgvector
 */
export async function searchKnowledge(
  query: string,
  organizationId: string,
  projectId: string,
  limit: number = 5,
): Promise<SearchResult[]> {
  const supabase = await createClient();

  try {
    // Get embedding for query
    const queryEmbedding = await getQueryEmbedding(query);
    console.log(
      `[search] Query embedding generated (${queryEmbedding.length} dims) for: "${query.substring(0, 50)}..."`,
    );

    // Query using cosine similarity (<=> operator)
    const { data, error } = await supabase.rpc("knowledge_search", {
      query_embedding: queryEmbedding,
      organization_id: organizationId,
      project_id: projectId,
      result_limit: limit,
    });

    if (error) {
      console.error(
        `[search] RPC error for org=${organizationId}, project=${projectId}:`,
        error,
      );
      return [];
    }

    if (!data) {
      console.warn(
        `[search] No data returned for org=${organizationId}, project=${projectId}`,
      );
      return [];
    }

    console.log(
      `[search] Found ${data.length} results for org=${organizationId}, project=${projectId}`,
    );

    // Map results to SearchResult type
    return data.map((result: any) => ({
      chunk_id: result.id,
      knowledge_id: result.knowledge_id,
      filename: result.filename,
      text: result.text,
      similarity: result.similarity,
      chunk_index: result.chunk_index,
    }));
  } catch (error) {
    console.error(
      `[search] Knowledge search failed for org=${organizationId}, project=${projectId}:`,
      error,
    );
    return [];
  }
}

/**
 * Delete knowledge file and all its embeddings
 */
export async function deleteKnowledge(
  knowledgeId: string,
  organizationId: string,
): Promise<boolean> {
  const supabase = await createClient();

  try {
    // Delete from knowledge_files (cascades to knowledge_embeddings)
    const { error } = await supabase
      .from("knowledge_files")
      .delete()
      .eq("id", knowledgeId)
      .eq("organization_id", organizationId);

    if (error) {
      console.error("Delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Delete knowledge failed:", error);
    return false;
  }
}
