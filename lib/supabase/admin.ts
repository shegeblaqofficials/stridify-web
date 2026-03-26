import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-free Supabase client using the service role key.
 * Use this for server-side operations that run outside of a request
 * context (e.g. inside `after()`, `onFinish`, background jobs) where
 * `cookies()` is not available.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
