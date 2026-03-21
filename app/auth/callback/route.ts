import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertAccount } from "@/lib/account/actions";
import { createProjectFromPendingPrompt } from "@/lib/project/actions";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/home";
  if (!next.startsWith("/")) {
    next = "/home";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const account = await upsertAccount();
      if (account && account.is_active === false) {
        return NextResponse.redirect(`${origin}/beta-access`);
      }

      // Pick up pending prompt: create project and redirect straight to workspace
      if (account) {
        const result = await createProjectFromPendingPrompt(
          account.organization_id,
          account.user_id,
        );
        if (result) {
          next = `/projects/${result.project.project_id}`;
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }
  return NextResponse.redirect(`${origin}/home`);
}
