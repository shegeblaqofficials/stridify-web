import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/middleware";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

// Routes that require authentication and active organization
const protectedRoutes = [
  "/home",
  "/projects",
  "/deployments",
  "/templates",
  "/settings",
  "/pricing",
  "/discover",
];

// Routes that authenticated users should be redirected away from
const publicOnlyRoutes = ["/"];

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const { pathname } = request.nextUrl;

  // Refresh the session (important for Supabase SSR)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed-in user hitting landing page → redirect to /home
  if (user && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // Unauthenticated user hitting a protected route → redirect to /
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // For authenticated users on protected routes, check organization is_active
  if (user && isProtected) {
    const admin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: account } = await admin
      .from("accounts")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (account?.organization_id) {
      const { data: org } = await admin
        .from("organizations")
        .select("is_active")
        .eq("organization_id", account.organization_id)
        .single();

      if (!org || org.is_active === false) {
        const url = request.nextUrl.clone();
        url.pathname = "/beta-access";
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets
     * - API routes
     * - auth callback
     */
    "/((?!_next/static|_next/image|favicon.ico|assets|api|auth).*)",
  ],
};
