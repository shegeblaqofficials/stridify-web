import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

// Routes that require authentication
const protectedRoutes = [
  "/home",
  "/projects",
  "/deployments",
  "/templates",
  "/settings",
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

  // For authenticated users on protected routes, check is_active
  if (user && isProtected) {
    const { data: account } = await supabase
      .from("accounts")
      .select("is_active")
      .eq("user_id", user.id)
      .single();

    if (account && account.is_active === false) {
      const url = request.nextUrl.clone();
      url.pathname = "/beta-access";
      return NextResponse.redirect(url);
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
