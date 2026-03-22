
-- Table to store user accounts
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

-- Table to store projects 
CREATE TABLE public.projects (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  project_id character varying,
  organization_id character varying,
  title character varying,
  agent_type character varying,
  preview_url text,
  sandbox_id character varying,
  status character varying,
  created_by_user_id character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT project_pkey PRIMARY KEY (id)
);
-- Table to store organizations
CREATE TABLE public.organizations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  organization_id character varying,
  name character varying,
  token_balance  integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT organization_pkey PRIMARY KEY (id)
);
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
