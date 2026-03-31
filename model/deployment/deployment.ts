export type DeploymentEnvironment = "preview" | "production";

export type DeploymentStatus =
  | "queued"
  | "building"
  | "ready"
  | "error"
  | "canceled";

export interface VercelProject {
  id: number;
  vercel_project_id: string;
  project_id: string;
  organization_id: string;
  vercel_project_name: string;
  framework: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deployment {
  id: number;
  deployment_id: string;
  project_id: string;
  organization_id: string;
  deployer_project_id: string;
  deployer_deployment_id: string;
  deployment_provider: string;
  environment: DeploymentEnvironment;
  status: DeploymentStatus;
  url: string | null;
  inspector_url: string | null;
  deployment_name: string | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
}
