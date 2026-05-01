import { APP_CONFIG_DEFAULTS } from "@/lib/embed/env";
import type { AppConfig } from "@/lib/embed/types";
import { getWidgetProject } from "@/lib/project/actions";

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
 * Loads per-project widget overrides from the widget_projects table.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sandboxId: string }> },
) {
  const { sandboxId } = await params;
  const widget = await getWidgetProject(sandboxId);

  const config: AppConfig = {
    ...APP_CONFIG_DEFAULTS,
    sandboxId,
    ...(widget && {
      triggerLabel: widget.trigger_label,
      companyName: widget.company_name,
      accent: widget.accent ?? undefined,
      accentDark: widget.accent_dark ?? undefined,
      logo: widget.logo_url ?? undefined,
      logoDark: widget.logo_dark_url ?? undefined,
    }),
  };

  return Response.json(config, {
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
