import type { TranscriptionSegment } from "livekit-client";
import type { ReactNode } from "react";

export interface CombinedTranscription extends TranscriptionSegment {
  role: "assistant" | "user";
  receivedAtMediaTimestamp: number;
  receivedAt: number;
}

export type ThemeMode = "dark" | "light" | "system";

/**
 * Configuration for an embedded Stridify widget.
 *
 * `sandboxId` is the project identifier (used to look up server-side metadata
 * such as the LiveKit agent name and theming).
 */
export interface AppConfig {
  sandboxId?: string;
  agentName?: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  startButtonText?: string;
  /**
   * Text shown on the floating popup trigger when the user hovers it.
   * The trigger expands from a circle to a pill with this label. Defaults
   * to "Talk to us".
   */
  triggerLabel?: string;
  companyName?: string;
  accent?: string;
  accentDark?: string;
  logo?: string;
  logoDark?: string;
}

export interface SandboxConfig {
  [key: string]:
    | { type: "string"; value: string }
    | { type: "number"; value: number }
    | { type: "boolean"; value: boolean }
    | null;
}

export type EmbedErrorDetails = {
  title: ReactNode;
  description: ReactNode;
};
