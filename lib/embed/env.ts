import type { AppConfig } from "./types";

export const APP_CONFIG_DEFAULTS: AppConfig = {
  sandboxId: undefined,
  agentName: undefined,
  supportsChatInput: true,
  supportsVideoInput: false,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,
  startButtonText: "Chat with Agent",
  triggerLabel: "Talk to us",
  companyName: "Stridify",
  accent: undefined,
  accentDark: undefined,
  logo: undefined,
  logoDark: undefined,
};

export const THEME_STORAGE_KEY = "stridify-embed-theme";
export const THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";

/**
 * Public endpoint that returns SandboxConfig overrides for a given project id.
 * Always relative so it works for both server and browser bundles (including
 * the standalone embed popup bundle, which doesn't have access to
 * `process.env`).
 */
const CONFIG_ENDPOINT = "/api/embed-config";

/**
 * The origin of the Stridify backend that serves the popup bundle and API.
 * For the popup bundle (cross-origin embed), this is set at bundle init time
 * from the `<script src>` URL. For same-origin contexts (the iframe page,
 * SSR), it falls back to the current origin.
 */
let STRIDIFY_API_ORIGIN: string | null = null;

export function setStridifyApiOrigin(origin: string) {
  STRIDIFY_API_ORIGIN = origin;
}

export function getStridifyApiOrigin(): string {
  if (STRIDIFY_API_ORIGIN) return STRIDIFY_API_ORIGIN;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function getOrigin(headers: Headers): string {
  const host = headers.get("host");
  const proto = headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

/**
 * Derive a default sandbox / project id from the current origin's first
 * subdomain (e.g. `abc123.stridify.app` → `abc123`). Useful as a fallback
 * when no explicit id is provided on the embedding script tag.
 */
export function getSandboxId(origin: string): string {
  const host = origin.replace(/^https?:\/\//, "");
  return host.split(".")[0] ?? "";
}

export const getAppConfig = async (
  origin: string,
  sandboxIdAttribute?: string,
): Promise<AppConfig> => {
  const sandboxId = sandboxIdAttribute ?? getSandboxId(origin);
  const config: AppConfig = { ...APP_CONFIG_DEFAULTS, sandboxId };

  if (!sandboxId) return config;

  try {
    const apiOrigin = getStridifyApiOrigin() || origin;
    const url = `${apiOrigin}${CONFIG_ENDPOINT}/${sandboxId}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return config;
    const remote = (await res.json()) as Partial<AppConfig>;
    return { ...config, ...remote, sandboxId };
  } catch {
    return config;
  }
};
