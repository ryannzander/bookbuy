import { createClient } from "@supabase/supabase-js";

let _admin: ReturnType<typeof createClient> | null | undefined = undefined;

/**
 * Server-only Supabase client with service role. Use for admin operations like deleting users.
 * Returns null if SUPABASE_SERVICE_ROLE_KEY is not set.
 */
export function createAdminClient(): ReturnType<typeof createClient> | null {
  if (_admin === undefined) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      _admin = null;
    } else {
      _admin = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });
    }
  }
  return _admin;
}
