/**
 * Knowledge Base Schema
 * PostgreSQL with pgvector for embeddings
 */

export type FileType = "pdf" | "txt" | "csv";
export type EmbeddingModel = "gte-small"; // 384 dimensions

export interface KnowledgeFile {
  id: string;
  organization_id: string;
  project_id: string;
  filename: string;
  file_type: FileType;
  file_size: number; // bytes
  file_url: string; // Supabase Storage path
  chunks_count: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeEmbedding {
  id: string;
  organization_id: string;
  project_id: string;
  knowledge_id: string;
  chunk_index: number;
  text: string;
  embedding: number[]; // 384-dim vector for gte-small
  tokens_estimate: number;
  created_at: string;
}

export interface SearchResult {
  chunk_id: string;
  knowledge_id: string;
  filename: string;
  text: string;
  similarity: number;
  chunk_index: number;
}
