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

    // Upsert on every call ensures new OAuth sign-ins are always recorded.
    // Keep payload aligned with live DB columns.
    try {
        await supabase.from("User").upsert({
            id: userId,
            email: session.user.email,
            name: session.user.name ?? session.user.email,
            role: "MENTEE",
            reputationScore: 75,
            updatedAt: now,
        }, { onConflict: "id", ignoreDuplicates: true });
    } catch (e) {
        console.error("getUser: Silent upsert failure", e);
    }

    const { data: userData, error: selectError } = await supabase
        .from("User")
        .select("*")
        .eq("id", userId)
        .single();

    if (selectError) {
        console.error("getUser: Select failure", selectError);
    }

    if (!userData) return null;

    return {
        ...(userData as Omit<AppUser, "bio" | "avatarUrl">),
        bio: (userData as { bio?: string | null }).bio ?? null,
        avatarUrl: (userData as { avatarUrl?: string | null }).avatarUrl ?? null,
    } as AppUser;
}
