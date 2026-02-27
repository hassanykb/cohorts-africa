"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";

export async function updateProfile(userId: string, data: {
    name: string;
    bio: string;
    linkedinUrl: string;
    avatarUrl?: string | null;
    role: "MENTOR" | "MENTEE" | "BOTH";
}) {
    const supabase = createServerClient();

    // Current DB enum supports MENTOR/MENTEE. "BOTH" is stored as MENTEE until enum is migrated.
    const persistedRole: "MENTOR" | "MENTEE" = data.role === "MENTOR" ? "MENTOR" : "MENTEE";

    try {
        const { error } = await supabase
            .from("User")
            .update({
                name: data.name,
                linkedinUrl: data.linkedinUrl || null,
                role: persistedRole,
                updatedAt: new Date().toISOString(),
            })
            .eq("id", userId);

        if (error) {
            console.error("Update Profile Error:", { error, userId, data });
            throw new Error(error.message || "Failed to save changes.");
        }
    } catch (e: unknown) {
        console.error("updateProfile: unexpected error", e);
        throw new Error(e instanceof Error ? e.message : "A database error occurred.");
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard/mentee");
    revalidatePath("/dashboard/mentor");
    revalidatePath("/settings");
}
