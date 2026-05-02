export interface TelephonyProject {
  id: number;
  telephony_project_id: string;
  project_id: string;
  organization_id: string;
  telephone_number: string | null;
  phone_number_provider: string | null;
  agent_name: string;
  agent_voice: string;
  voice_provider: string;
  agent_status: string;
  provider: string;
  sip_trunk_id: string | null;
  sip_dispatch_rule_id: string | null;
  livekit_phone_number_id: string | null;
  created_at: string;
  updated_at: string;
}
