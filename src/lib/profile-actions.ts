"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";

export async function updateProfile(userId: string, data: {
    name: string;
    bio: string;
    linkedinUrl: string;
    role: "MENTOR" | "MENTEE" | "BOTH";
}) {
    const supabase = createServerClient();
    const { error } = await supabase
        .from("User")
        .update({
            name: data.name,
            bio: data.bio,
            linkedinUrl: data.linkedinUrl || null,
            role: data.role,
            updatedAt: new Date().toISOString(),
        })
        .eq("id", userId);

    if (error) throw error;
    revalidatePath("/profile");
    revalidatePath("/dashboard/mentee");
    revalidatePath("/dashboard/mentor");
    revalidatePath("/settings");
}
