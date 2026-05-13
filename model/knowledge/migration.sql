-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector SCHEMA extensions;

-- Knowledge files metadata table
CREATE TABLE IF NOT EXISTS public.knowledge_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id varchar NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
  project_id varchar NOT NULL,
  filename varchar NOT NULL,
  file_type varchar NOT NULL CHECK (file_type IN ('pdf', 'txt', 'csv')),
  file_size integer NOT NULL,
  file_url text NOT NULL,
  chunks_count integer NOT NULL DEFAULT 0,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Embeddings table with pgvector (384 dimensions for gte-small)
CREATE TABLE IF NOT EXISTS public.knowledge_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id varchar NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
  project_id varchar NOT NULL,
  knowledge_id uuid NOT NULL REFERENCES public.knowledge_files(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  text text NOT NULL,
  embedding extensions.vector(384) NOT NULL,
  tokens_estimate integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_files_org_project 
  ON public.knowledge_files(organization_id, project_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_files_created_at 
  ON public.knowledge_files(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_org_project 
  ON public.knowledge_embeddings(organization_id, project_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_knowledge_id 
  ON public.knowledge_embeddings(knowledge_id);

-- Vector index for fast similarity search (using HNSW algorithm)
-- Uses cosine distance (<=> operator)
CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_vector 
  ON public.knowledge_embeddings 
  USING hnsw (embedding vector_cosine_ops) 
  WITH (m = 16, ef_construction = 64);

-- Enable RLS for security
ALTER TABLE public.knowledge_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS policies - allow access to user's organizations
-- Uses the accounts table to check if the user belongs to this org
CREATE POLICY "knowledge_files_org_access" 
  ON public.knowledge_files FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM accounts 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "knowledge_embeddings_org_access" 
  ON public.knowledge_embeddings FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM accounts 
      WHERE user_id = auth.uid()
    )
  );
