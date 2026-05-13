/**
 * POST /api/knowledge/search - Search knowledge base
 * DELETE /api/knowledge/search - Delete knowledge file
 */

import { NextRequest, NextResponse } from "next/server";
import { searchKnowledge, deleteKnowledge } from "@/lib/knowledge/search";

/**
 * POST /api/knowledge/search
 * Search knowledge base using semantic similarity
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, organization_id, project_id, limit = 5 } = body;

    if (!query || !organization_id || !project_id) {
      return NextResponse.json(
        {
          error: "Missing required fields: query, organization_id, project_id",
        },
        { status: 400 },
      );
    }

    const results = await searchKnowledge(
      query,
      organization_id,
      project_id,
      Math.min(limit, 20), // Cap at 20 results
    );

    return NextResponse.json({
      success: true,
      query,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Search failed",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/knowledge/search
 * Delete a knowledge file and its embeddings
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const knowledgeId = searchParams.get("knowledge_id");
    const organizationId = searchParams.get("organization_id");

    if (!knowledgeId || !organizationId) {
      return NextResponse.json(
        { error: "Missing knowledge_id or organization_id" },
        { status: 400 },
      );
    }

    const success = await deleteKnowledge(knowledgeId, organizationId);

    if (!success) {
      throw new Error("Failed to delete knowledge file");
    }

    return NextResponse.json({
      success: true,
      message: "Knowledge file deleted",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Delete failed",
      },
      { status: 500 },
    );
  }
}
