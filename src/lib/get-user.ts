import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase-server";

export type AppUser = {
    id: string;
    email: string;
    name: string;
    role: "MENTOR" | "MENTEE" | "ADMIN" | "SPONSOR";
    reputationScore: number;
};

/**
 * Returns the authenticated user from the Supabase DB,
 * or null if the user is not signed in.
 */
export async function getUser(): Promise<AppUser | null> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const supabase = createServerClient();

    // Upsert on every call ensures new OAuth sign-ins are always recorded
    const now = new Date().toISOString();
    const userId = (session.user as { id?: string }).id ?? session.user.email;

    await supabase.from("User").upsert({
        id: userId,
        email: session.user.email,
        name: session.user.name ?? session.user.email,
        role: "MENTEE",
        reputationScore: 100,
        createdAt: now,
        updatedAt: now,
    }, { onConflict: "id", ignoreDuplicates: true });

    const { data } = await supabase
        .from("User")
        .select("*")
        .eq("id", userId)
        .single();

    return data as AppUser | null;
}
