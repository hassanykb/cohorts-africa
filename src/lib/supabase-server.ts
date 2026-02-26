import { createClient } from "@supabase/supabase-js";

// Server-only admin client — bypasses RLS. Only use in Server Components & Server Actions.
export function createServerClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}
