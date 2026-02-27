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

    // In case 'BOTH' is not in the DB Enum yet, we might need a fallback or just handle the error
    try {
        const { error } = await supabase
            .from("User")
            .update({
                name: data.name,
                bio: data.bio,
                linkedinUrl: data.linkedinUrl || null,
                avatarUrl: data.avatarUrl || null,
                role: data.role === "BOTH" ? "MENTEE" : data.role, // Fallback to MENTEE if BOTH isn't in DB yet
                updatedAt: new Date().toISOString(),
            })
            .eq("id", userId);

        if (error) {
            console.error("Update Profile Error:", { error, userId, data });
            throw new Error(error.message || "Failed to save changes.");
        }
    } catch (e: any) {
        console.error("updateProfile: unexpected error", e);
        throw new Error(e.message || "A database error occurred.");
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard/mentee");
    revalidatePath("/dashboard/mentor");
    revalidatePath("/settings");
}
