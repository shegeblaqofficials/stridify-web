/**
 * POST /api/knowledge/upload
 * Upload a document and create embeddings
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import {
  processDocument,
  generateEmbeddingsBatch,
} from "@/lib/knowledge/document-processor";

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const organizationId = formData.get("organization_id") as string;
    const projectId = formData.get("project_id") as string;
    const description = formData.get("description") as string | null;

    // Validate
    if (!file || !organizationId || !projectId) {
      return NextResponse.json(
        { error: "Missing required fields: file, organization_id, project_id" },
        { status: 400 },
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 50MB)" },
        { status: 400 },
      );
    }

    const supabaseAuth = await createAuthClient();

    // Create service role client for database operations (bypasses RLS)
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error("Missing Supabase environment variables:", {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      });
      throw new Error(
        "Supabase configuration incomplete. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
      );
    }

    const supabaseServiceRole = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    console.log("step 1: file received");

    // Step 1: Process document (extract, chunk, embed)
    const { chunks, metadata } = await processDocument(
      file,
      organizationId,
      projectId,
    );

    console.log(
      `step 1 complete: ${chunks.length} chunks created, metadata extracted. Uploading file and saving records...`,
    );

    // Step 2: Upload original file to Supabase Storage (use authenticated client)
    const fileName = `${Date.now()}-${file.name}`;
    const storagePath = `organizations/${organizationId}/knowledge/${projectId}/${fileName}`;

    console.log(`step 2: uploading file to storage path: ${storagePath}`);

    // Attempt upload
    const { error: uploadError } = await supabaseAuth.storage
      .from("knowledge-files")
      .upload(storagePath, file, { upsert: false });

    if (uploadError) {
      console.error("step 2: Storage upload error details:", {
        message: uploadError.message,
        status: uploadError.status,
        storagePath,
        hint: uploadError.message.includes("policy")
          ? "Storage RLS policy is blocking uploads. Disable RLS: Supabase → Storage → knowledge-files → Policies → Disable RLS"
          : "Check bucket permissions or if bucket exists",
      });
      throw new Error(`File upload to storage failed: ${uploadError.message}`);
    }
    console.log("step 2 complete: file uploaded to storage");
    // Get public URL
    const { data: publicUrl } = supabaseAuth.storage
      .from("knowledge-files")
      .getPublicUrl(storagePath);

    console.log("Public URL for uploaded file:", publicUrl.publicUrl);

    // Step 3: Create knowledge_files entry (use service role to bypass RLS)
    console.log(
      `step 3: Creating knowledge record for org=${organizationId}, project=${projectId}`,
    );
    const { data: knowledgeRecord, error: fileError } =
      await supabaseServiceRole
        .from("knowledge_files")
        .insert({
          organization_id: organizationId,
          project_id: projectId,
          filename: file.name,
          file_type: metadata.file_type,
          file_size: metadata.file_size,
          file_url: publicUrl.publicUrl,
          chunks_count: metadata.chunks_count,
          description: description || null,
        })
        .select("id")
        .single();

    if (fileError || !knowledgeRecord) {
      console.error("step 3: Database insert error:", {
        error: fileError,
        hasRecord: !!knowledgeRecord,
      });
      throw new Error(
        `Failed to create knowledge record: ${fileError?.message || "Unknown error"}`,
      );
    }

    console.log(
      `step 3 complete: knowledge record created with ID ${knowledgeRecord.id}. Generating and inserting embeddings for each chunk...`,
    );

    // Step 4: Generate embeddings for all chunks in batch (much faster)
    console.log(
      `step 4a: Starting embedding generation for ${chunks.length} chunks...`,
    );
    const chunkTexts = chunks.map((chunk) => chunk.text);

    let embeddings;
    try {
      embeddings = await generateEmbeddingsBatch(chunkTexts);
      console.log(
        `step 4b: Successfully generated ${embeddings.length} embeddings`,
      );
    } catch (error) {
      console.error("step 4b: Error during embedding generation:", error);
      throw new Error(
        `Embedding generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    // Prepare all embedding records
    console.log(
      `step 4c: Preparing ${chunks.length} embedding records for insert...`,
    );
    const embeddingRecords = chunks.map((chunk, index) => ({
      organization_id: organizationId,
      project_id: projectId,
      knowledge_id: knowledgeRecord.id,
      chunk_index: chunk.index,
      text: chunk.text,
      embedding: embeddings[index],
      tokens_estimate: chunk.tokens,
    }));

    // Insert all embeddings at once
    console.log(
      `step 4d: Inserting ${embeddingRecords.length} embeddings into database...`,
    );
    const { error: embeddingError } = await supabaseServiceRole
      .from("knowledge_embeddings")
      .insert(embeddingRecords);

    if (embeddingError) {
      console.error("step 4d: Database insert error:", embeddingError);
      throw new Error(`Failed to insert embeddings: ${embeddingError.message}`);
    }

    console.log(`Successfully inserted ${embeddings.length} embeddings`);

    console.log("step 4 complete: all embeddings inserted.");

    return NextResponse.json({
      success: true,
      knowledge: {
        id: knowledgeRecord.id,
        filename: file.name,
        file_type: metadata.file_type,
        chunks_count: metadata.chunks_count,
        file_size: metadata.file_size,
        file_url: publicUrl.publicUrl,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/knowledge/upload
 * List knowledge files for organization/project
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organization_id");
    const projectId = searchParams.get("project_id");

    if (!organizationId || !projectId) {
      return NextResponse.json(
        { error: "Missing organization_id or project_id" },
        { status: 400 },
      );
    }

    // Create service role client for database operations (bypasses RLS)
    const supabaseServiceRole = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    );

    const { data, error } = await supabaseServiceRole
      .from("knowledge_files")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      knowledge: data || [],
    });
  } catch (error) {
    console.error("List error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list knowledge",
      },
      { status: 500 },
    );
  }
}
