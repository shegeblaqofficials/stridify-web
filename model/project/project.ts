export type AgentType = "web" | "telephony" | "widget" | "mobile";

export type ProjectStatus = "draft" | "building" | "ready" | "deployed";

export interface Project {
  id: number;
  project_id: string;
  organization_id: string;
  title: string;
  agent_type: AgentType;
  preview_url?: string;
  sandbox_id: string | null;
  status: ProjectStatus;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}
