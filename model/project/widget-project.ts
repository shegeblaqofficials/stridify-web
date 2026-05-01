export interface WidgetProject {
  id: number;
  widget_project_id: string;
  project_id: string;
  organization_id: string;
  agent_name: string;
  /** "default" or a TTS voice id (e.g. inworld/inworld-tts-1:Lauren) */
  agent_voice: string;
  /** Hover label on the floating popup trigger. */
  trigger_label: string;
  /** Display name shown in the iframe / popup header. */
  company_name: string;
  /** Optional URL to a logo (light theme). */
  logo_url: string | null;
  /** Optional URL to a logo (dark theme). */
  logo_dark_url: string | null;
  /** Optional accent hex (e.g. "#0F172A"). */
  accent: string | null;
  /** Optional accent hex for dark theme. */
  accent_dark: string | null;
  created_at: string;
  updated_at: string;
}
