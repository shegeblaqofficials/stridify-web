export interface TelephonyProject {
  id: number;
  telephony_project_id: string;
  project_id: string;
  organization_id: string;
  telephone_number: string | null;
  agent_name: string;
  agent_voice: string;
  voice_provider: string;
  agent_status: string;
  provider: string;
  created_at: string;
  updated_at: string;
}
