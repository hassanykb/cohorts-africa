import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase-server";

export type AppUser = {
    id: string;
    email: string;
    name: string;
    role: "MENTOR" | "MENTEE" | "ADMIN" | "SPONSOR" | "BOTH";
    reputationScore: number;
    bio: string | null;
    linkedinUrl: string | null;
    avatarUrl: string | null;
};

/**
 * Returns the authenticated user from the Supabase DB,
 * or null if the user is not signed in.
 */
export async function getUser(): Promise<AppUser | null> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const supabase = createServerClient();
    const now = new Date().toISOString();
    const userId = (session.user as { id?: string }).id ?? session.user.email;

    // Upsert on every call ensures new OAuth sign-ins are always recorded
    // We wrap in try/catch to avoid crashing if DB schema is slightly out of sync
    try {
        await supabase.from("User").upsert({
            id: userId,
            email: session.user.email,
            name: session.user.name ?? session.user.email,
            avatarUrl: session.user.image ?? null,
            role: "MENTEE",
            reputationScore: 75,
            updatedAt: now,
        }, { onConflict: "id", ignoreDuplicates: true });
    } catch (e) {
        console.error("getUser: Silent upsert failure", e);
    }

    const { data } = await supabase
        .from("User")
        .select("*")
        .eq("id", userId)
        .single();

    return data as AppUser | null;
}
