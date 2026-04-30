import { APP_CONFIG_DEFAULTS } from "@/lib/embed/env";
import type { AppConfig } from "@/lib/embed/types";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * GET /api/embed-config/[sandboxId]
 *
 * Returns the AppConfig (branding, capabilities) for the given sandbox/project id.
 * Defaults to APP_CONFIG_DEFAULTS until per-project configuration is wired up.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sandboxId: string }> },
) {
  const { sandboxId } = await params;

  // TODO: lookup project-specific overrides (accent, agentName, companyName)
  // by sandboxId from the projects table.
  const config: AppConfig = {
    ...APP_CONFIG_DEFAULTS,
  };

  void sandboxId;

  return Response.json(config, {
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
