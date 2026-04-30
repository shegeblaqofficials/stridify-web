import { headers } from "next/headers";
import EmbedAgentClient from "@/components/embed/iframe/agent-client";
import { ApplyThemeScript } from "@/components/embed/iframe/theme-provider";
import { getAppConfig, getOrigin, getSandboxId } from "@/lib/embed/env";

export const dynamic = "force-dynamic";

export default async function EmbedPage({
  searchParams,
}: {
  searchParams: Promise<{ sandboxId?: string }>;
}) {
  const [hdrs, params] = await Promise.all([headers(), searchParams]);
  const origin = getOrigin(hdrs);
  // Prefer an explicit sandboxId query param (used by the widget preview and
  // any same-origin embed). Fall back to the first subdomain of the host
  // (e.g. `abc123.stridify.app` → `abc123`) for vanity-host deploys.
  const sandboxId = params.sandboxId || getSandboxId(origin);
  const appConfig = await getAppConfig(origin, sandboxId);

  return (
    <>
      <ApplyThemeScript />
      <main className="bg-transparent">
        <EmbedAgentClient appConfig={appConfig} />
      </main>
    </>
  );
}
