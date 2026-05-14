
-- 1. Table to store user accounts
CREATE TABLE public.accounts (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid DEFAULT gen_random_uuid(),
  first_name character varying,
  last_name character varying,
  photo_url text,
  is_active boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email character varying,
  organization_id character varying,
  CONSTRAINT account_pkey PRIMARY KEY (id)
);

-- 2. Enable RLS
alter table accounts enable row level security;

-- 3. Create policy 
create policy "Authenticated read access to accounts"
on accounts for select
to authenticated, anon
using ( true );

-- 4. Add index on user_id,email,organization_id for faster lookups
CREATE INDEX idx_accounts_user_id ON public.accounts (user_id);
CREATE INDEX idx_accounts_email ON public.accounts (email);
CREATE INDEX idx_accounts_organization_id ON public.accounts (organization_id);

-- 1. Table to store projects 
CREATE TABLE public.projects (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  project_id character varying,
  organization_id character varying,
  title character varying,
  agent_type character varying,
  preview_url text,
  sandbox_id character varying,
  sandbox_provider character varying DEFAULT 'vercel',
  sandbox_slot integer DEFAULT 1,
  status character varying,
  created_by_user_id character varying,
  access_type character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT project_pkey PRIMARY KEY (id)
);
-- 2. Enable RLS
alter table projects enable row level security;

-- 3. Create policy
create policy "Authenticated read access to projects"
on projects for select
to authenticated, anon
using ( true );

-- 4. Add index on project_id and organization_id for faster lookups
CREATE INDEX idx_projects_project_id ON public.projects (project_id);
CREATE INDEX idx_projects_organization_id ON public.projects (organization_id);


-- 1.Table to store organizations
CREATE TABLE public.organizations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  organization_id character varying,
  name character varying,
  token_balance  integer,
  is_subscribed boolean DEFAULT false,
  is_free_plan boolean DEFAULT true,
  plan character varying,
  stripe_customer_id character varying,
  stripe_subscription_id character varying,
  subscription_status character varying DEFAULT 'inactive',
  is_active boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT organization_pkey PRIMARY KEY (id)
);

-- 2. Enable RLS
alter table organizations enable row level security;

-- 3. Create policy
create policy "Authenticated read access to organizations"
on organizations for select
to authenticated, anon
using ( true );

-- 4. Add index on organization_id,token_balance, stripe_customer_id,is_active for faster lookups
CREATE INDEX idx_organizations_organization_id ON public.organizations (organization_id);
CREATE INDEX idx_organizations_token_balance ON public.organizations (token_balance);
CREATE INDEX idx_organizations_stripe_customer_id ON public.organizations (stripe_customer_id);
CREATE INDEX idx_organizations_is_active ON public.organizations (is_active);

-- Table to store prompts
CREATE TABLE public.prompts (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  prompt_id character varying,
  project_id character varying,
  organization_id character varying,
  content text,
  created_by_user_id character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT prompt_pkey PRIMARY KEY (id)
);
---Table to store project snapshots
CREATE TABLE public.snapshots (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  snapshot_id character varying,
  project_id character varying,
  organization_id character varying,
  version_name character varying,
  version_number integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT snapshot_pkey PRIMARY KEY (id)
);

--- Table organization members
CREATE TABLE public.organization_members (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  organization_id character varying,
  user_id character varying,
  role character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT organization_members_pkey PRIMARY KEY (id)
);

-- Table to store Vercel project mappings
CREATE TABLE public.vercel_projects (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  vercel_project_id character varying NOT NULL,
  project_id character varying NOT NULL,
  organization_id character varying NOT NULL,
  vercel_project_name character varying NOT NULL,
  framework character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT vercel_project_pkey PRIMARY KEY (id)
);

-- 1. Table to store deployments
CREATE TABLE public.deployments (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  deployment_id character varying NOT NULL,
  project_id character varying NOT NULL,
  organization_id character varying NOT NULL,
  deployer_project_id character varying NOT NULL,
  deployer_deployment_id character varying NOT NULL,
  deployment_provider character varying NOT NULL DEFAULT 'vercel',
  environment character varying NOT NULL DEFAULT 'preview',
  status character varying NOT NULL DEFAULT 'queued',
  url text,
  inspector_url text,
  deployment_name character varying,
  created_by_user_id character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT deployment_pkey PRIMARY KEY (id)
);

-- 2. Enable RLS on deployments
alter table deployments enable row level security;

-- 3. Create policy for deployments
create policy "Authenticated read access to deployments"
on deployments for select
to authenticated, anon
using ( true );

-- 4. Add index on deployment_id, project_id, organization_id, deployer_project_id for faster lookups
CREATE INDEX idx_deployments_deployment_id ON public.deployments (deployment_id);
CREATE INDEX idx_deployments_project_id ON public.deployments (project_id);
CREATE INDEX idx_deployments_organization_id ON public.deployments (organization_id);
CREATE INDEX idx_deployments_deployer_project_id ON public.deployments (deployer_project_id);

-- 1. Table to store telephony project
CREATE TABLE public.telephony_projects (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  telephony_project_id character varying NOT NULL,
  project_id character varying NOT NULL,
  organization_id character varying NOT NULL,
  telephone_number character varying,
  phone_number_provider character varying,
  agent_name character varying,
  agent_voice character varying,
  voice_provider character varying,
  agent_status character varying NOT NULL DEFAULT 'not_connected',
  provider character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT telephony_project_pkey PRIMARY KEY (id)
);

-- 2. Enable RLS on telephony_projects
alter table telephony_projects enable row level security;

-- 3. Create policy for telephony_projects
create policy "Full access to telephony_projects"
on telephony_projects for all
to authenticated, anon
using ( true )
with check ( true );

-- 4. Add index on telephony_project_id, project_id, organization_id for faster lookups
CREATE INDEX idx_telephony_projects_telephony_project_id ON public.telephony_projects (telephony_project_id);
CREATE INDEX idx_telephony_projects_project_id ON public.telephony_projects (project_id);
CREATE INDEX idx_telephony_projects_organization_id ON public.telephony_projects (organization_id);
CREATE INDEX idx_telephony_projects_telephone_number ON public.telephony_projects (telephone_number);

-- 5. Add LiveKit SIP columns for phone number provisioning
ALTER TABLE public.telephony_projects ADD COLUMN IF NOT EXISTS sip_trunk_id character varying;
ALTER TABLE public.telephony_projects ADD COLUMN IF NOT EXISTS sip_dispatch_rule_id character varying;
ALTER TABLE public.telephony_projects ADD COLUMN IF NOT EXISTS livekit_phone_number_id character varying;
ALTER TABLE public.telephony_projects ADD COLUMN IF NOT EXISTS phone_number_provider character varying;

-- 1. Table to store widget project (embed iframe / popup) settings
CREATE TABLE public.widget_projects (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  widget_project_id character varying NOT NULL,
  project_id character varying NOT NULL,
  organization_id character varying NOT NULL,
  agent_name character varying NOT NULL DEFAULT 'Voice Assistant',
  agent_voice character varying NOT NULL DEFAULT 'default',
  trigger_label character varying NOT NULL DEFAULT 'Talk to us',
  company_name character varying NOT NULL DEFAULT '',
  logo_url text,
  logo_dark_url text,
  accent character varying,
  accent_dark character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT widget_project_pkey PRIMARY KEY (id)
);

-- 2. Enable RLS on widget_projects
alter table widget_projects enable row level security;

-- 3. Create policy for widget_projects
create policy "Full access to widget_projects"
on widget_projects for all
to authenticated, anon
using ( true )
with check ( true );

-- 4. Add index on widget_project_id, project_id, organization_id for faster lookups
CREATE INDEX idx_widget_projects_widget_project_id ON public.widget_projects (widget_project_id);
CREATE INDEX idx_widget_projects_project_id ON public.widget_projects (project_id);
CREATE INDEX idx_widget_projects_organization_id ON public.widget_projects (organization_id);

-- Voices table (TTS voice catalogue)
CREATE TABLE IF NOT EXISTS public.voices (
  id serial PRIMARY KEY,
  name character varying NOT NULL,
  description character varying NOT NULL,
  tts_id character varying NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Enable RLS on voices
ALTER TABLE public.voices ENABLE ROW LEVEL SECURITY;

-- 3. Anyone (authenticated or anon) can read voices; only service role can write
CREATE POLICY "Public read access to voices"
ON public.voices FOR SELECT
TO authenticated, anon
USING ( true );

INSERT INTO public.voices (name, description, tts_id) VALUES
  ('Ashley', 'Warm, natural American female',     'inworld/inworld-tts-1:Ashley'),
  ('Edward', 'Fast talking, emphatic American male', 'inworld/inworld-tts-1:Edward'),
  ('Olivia', 'Upbeat, friendly British female',   'inworld/inworld-tts-1:Olivia'),
  ('Diego',  'Soothing, gentle Mexican male',     'inworld/inworld-tts-1:Diego')
ON CONFLICT (tts_id) DO NOTHING;



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

-- RPC function for vector similarity search
-- Searches knowledge embeddings with cosine similarity, filtered by org and project
CREATE OR REPLACE FUNCTION public.knowledge_search(
  query_embedding extensions.vector,
  organization_id varchar,
  project_id varchar,
  result_limit int DEFAULT 5
)
RETURNS TABLE(
  id uuid,
  knowledge_id uuid,
  chunk_index integer,
  text text,
  filename varchar,
  similarity float8
) LANGUAGE sql STABLE AS $$
  SELECT
    ke.id,
    ke.knowledge_id,
    ke.chunk_index,
    ke.text,
    kf.filename,
    (1 - (ke.embedding <=> query_embedding)) AS similarity
  FROM public.knowledge_embeddings ke
  INNER JOIN public.knowledge_files kf ON ke.knowledge_id = kf.id
  WHERE ke.organization_id = knowledge_search.organization_id
    AND ke.project_id = knowledge_search.project_id
  ORDER BY ke.embedding <=> query_embedding ASC
  LIMIT knowledge_search.result_limit;
$$;
