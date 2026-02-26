"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";

// ─── Circles ────────────────────────────────────────────────────────────────

export async function getCircles() {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("Circle")
        .select("*")
        .in("status", ["OPEN", "ACTIVE", "PROPOSED"])
        .order("createdAt", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

export async function getCirclesByMentor(mentorId: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("Circle")
        .select("*, Application(id)")
        .eq("mentorId", mentorId)
        .order("createdAt", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

export async function getPitchRequestsForMentor(mentorId: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("Circle")
        .select("*, User!Circle_creatorId_fkey(name, email)")
        .is("mentorId", null)
        .eq("status", "PROPOSED")
        .order("createdAt", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

export async function createCircle(formData: FormData, mentorId: string) {
    const supabase = createServerClient();
    const now = new Date().toISOString();

    const { error } = await supabase.from("Circle").insert({
        id: crypto.randomUUID(),
        creatorId: mentorId,
        mentorId: mentorId,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        maxCapacity: Number(formData.get("capacity") ?? 10),
        status: "OPEN",
        createdAt: now,
        updatedAt: now,
    });

    if (error) throw error;
    revalidatePath("/dashboard/mentor");
    revalidatePath("/explore");
}

// ─── Applications ─────────────────────────────────────────────────────────

export async function getApplicationsByMentee(menteeId: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("Application")
        .select("*, Circle(title, mentorId)")
        .eq("menteeId", menteeId)
        .order("createdAt", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

export async function submitApplication(circleId: string, menteeId: string, intentStatement: string) {
    const supabase = createServerClient();
    const now = new Date().toISOString();

    const { error } = await supabase.from("Application").insert({
        id: crypto.randomUUID(),
        circleId,
        menteeId,
        intentStatement,
        status: "PENDING",
        createdAt: now,
        updatedAt: now,
    });

    if (error) throw error;
    revalidatePath("/dashboard/mentee");
}

// ─── Pitches (Mentee-Initiated Circles) ───────────────────────────────────

export async function submitPitch(data: {
    creatorId: string;
    title: string;
    description: string;
    tags: string[];
}) {
    const supabase = createServerClient();
    const now = new Date().toISOString();

    const { error } = await supabase.from("Circle").insert({
        id: crypto.randomUUID(),
        creatorId: data.creatorId,
        mentorId: null, // Awaiting mentor acceptance
        title: data.title,
        description: data.description,
        maxCapacity: 10,
        status: "PROPOSED",
        createdAt: now,
        updatedAt: now,
    });

    if (error) throw error;
    revalidatePath("/dashboard/mentee");
    revalidatePath("/explore");
}

// ─── Users ────────────────────────────────────────────────────────────────

export async function upsertUser(user: {
    id: string;
    email: string;
    name: string;
    role?: "MENTOR" | "MENTEE";
}) {
    const supabase = createServerClient();
    const now = new Date().toISOString();

    const { error } = await supabase.from("User").upsert({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role ?? "MENTEE",
        reputationScore: 100,
        createdAt: now,
        updatedAt: now,
    }, { onConflict: "id" });

    if (error) throw error;
}

export async function acceptPitch(circleId: string, mentorId: string) {
    const supabase = createServerClient();
    const { error } = await supabase
        .from("Circle")
        .update({ mentorId, status: "OPEN", updatedAt: new Date().toISOString() })
        .eq("id", circleId);

    if (error) throw error;
    revalidatePath("/dashboard/mentor");
}

export async function declinePitch(circleId: string) {
    const supabase = createServerClient();
    const { error } = await supabase
        .from("Circle")
        .delete()
        .eq("id", circleId);

    if (error) throw error;
    revalidatePath("/dashboard/mentor");
}
