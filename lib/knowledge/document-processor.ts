/**
 * Document Processor
 * Handles chunking and embedding generation
 */

import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { parse as csvParse } from "csv-parse/sync";

// Dynamic import for pdf-parse to handle ESM/CommonJS compatibility
let pdfParse: any = null;
const loadPdfParse = async () => {
  if (!pdfParse) {
    const module = await import("pdf-parse");
    pdfParse = (module as any).default || (module as any).parse || module;
  }
  return pdfParse;
};

interface ChunkData {
  index: number;
  text: string;
  tokens: number;
}

export interface ChunkDataWithEmbedding extends ChunkData {
  embedding: number[];
}

const CHUNK_SIZE = 500; // tokens/characters per chunk
const CHUNK_OVERLAP = 50; // overlap tokens for context

/**
 * Extract text from different file types
 */
async function extractText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  if (file.type === "application/pdf") {
    try {
      const parser = await loadPdfParse();
      const pdf = await parser(Buffer.from(buffer));
      return pdf.text;
    } catch (error) {
      throw new Error(
        `PDF parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  if (file.type === "text/plain") {
    return new TextDecoder().decode(buffer);
  }

  if (file.type === "text/csv" || file.name.endsWith(".csv")) {
    try {
      const text = new TextDecoder().decode(buffer);
      const records = csvParse(text, { columns: false });
      // Convert CSV to readable text
      return records.map((row: string[]) => row.join(" | ")).join("\n");
    } catch (error) {
      throw new Error(
        `CSV parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  throw new Error(`Unsupported file type: ${file.type}`);
}

/**
 * Split text into chunks with overlap
 */
function createChunks(text: string): ChunkData[] {
  // Normalize text
  const cleaned = text
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  if (cleaned.length === 0) {
    throw new Error("No text content extracted from file");
  }

  const chunks: ChunkData[] = [];
  let startIndex = 0;

  while (startIndex < cleaned.length) {
    const endIndex = Math.min(startIndex + CHUNK_SIZE, cleaned.length);
    const chunkText = cleaned.substring(startIndex, endIndex).trim();

    // Keep all chunks with meaningful content (> 50 chars)
    // OR if it's the last chunk, keep it even if small
    if (chunkText.length > 50 || endIndex === cleaned.length) {
      if (chunkText.length > 0) {
        // Don't add empty chunks
        chunks.push({
          index: chunks.length,
          text: chunkText,
          tokens: Math.ceil(chunkText.length / 4), // Rough token estimate
        });
      }
    }

    // If we reached the end, break to avoid infinite loop
    if (endIndex === cleaned.length) {
      break;
    }

    // Move start position, keeping overlap
    startIndex = endIndex - CHUNK_OVERLAP;

    // Safety: ensure we always move forward by at least 1 character
    if (startIndex >= endIndex) {
      startIndex = endIndex;
    }
  }

  console.log(
    `Created ${chunks.length} chunks from text (total length: ${cleaned.length} characters)`,
  );
  return chunks;
}

/**
 * Generate embeddings for multiple texts in parallel
 * Chunks into batches to avoid overwhelming the API
 */
export async function generateEmbeddingsBatch(
  texts: string[],
): Promise<number[][]> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not set. Using zero vector fallback.");
      return texts.map(() => new Array(384).fill(0));
    }

    if (texts.length === 0) {
      return [];
    }

    console.log(`Starting embedding generation for ${texts.length} texts...`);

    // Process in smaller batches to avoid API overload (max 10 per batch)
    const BATCH_SIZE = 10;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, Math.min(i + BATCH_SIZE, texts.length));
      console.log(
        `Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(texts.length / BATCH_SIZE)} (${batch.length} texts)...`,
      );

      // Generate embeddings for this batch in parallel
      const embeddingPromises = batch.map(async (text) => {
        try {
          console.log(
            `Generating embedding for text (${text.length} chars)...`,
          );
          const { embedding } = await embed({
            model: openai.embedding("text-embedding-3-small"),
            value: text,
          });

          console.log(
            `Got embedding with ${embedding.length} dimensions, normalizing to 384...`,
          );

          // Normalize from 1536 to 384 dimensions
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
          console.error("Error generating single embedding:", error);
          throw error;
        }
      });

      // Wait for batch to complete
      const batchEmbeddings = await Promise.all(embeddingPromises);
      allEmbeddings.push(...batchEmbeddings);
      console.log(
        `Batch complete. Total embeddings so far: ${allEmbeddings.length}`,
      );
    }

    console.log(
      `Embedding generation complete: ${allEmbeddings.length} embeddings`,
    );
    return allEmbeddings;
  } catch (error) {
    console.error("Batch embedding generation error:", error);
    throw error; // Re-throw so upload route can handle it properly
  }
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddings = await generateEmbeddingsBatch([text]);
  return embeddings[0];
}

/**
 * Process document: extract and chunk
 * Embeddings are generated in the upload route while looping
 */
export async function processDocument(
  file: File,
  organizationId: string,
  projectId: string,
): Promise<{
  chunks: ChunkData[];
  metadata: {
    organization_id: string;
    project_id: string;
    filename: string;
    file_type: "pdf" | "txt" | "csv";
    file_size: number;
    chunks_count: number;
    total_tokens: number;
  };
}> {
  // Extract text
  const text = await extractText(file);
  console.log(`Extracted text length: ${text.length} characters`);

  // Create chunks
  const chunks = createChunks(text);
  console.log(`Created ${chunks.length} chunks from document`);

  if (chunks.length === 0) {
    throw new Error("No content chunks created from file");
  }

  const fileType = file.name.endsWith(".pdf")
    ? "pdf"
    : file.name.endsWith(".csv")
      ? "csv"
      : "txt";

  return {
    chunks,
    metadata: {
      organization_id: organizationId,
      project_id: projectId,
      filename: file.name,
      file_type: fileType,
      file_size: file.size,
      chunks_count: chunks.length,
      total_tokens: chunks.reduce((sum, c) => sum + c.tokens, 0),
    },
  };
}
