"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";

// ─── Circle Room Data ─────────────────────────────────────────────────────────

export async function getCircleRoom(circleId: string) {
    const supabase = createServerClient();

    const [{ data: circle }, { data: sessions }, { data: resources }, { data: posts }] =
        await Promise.all([
            supabase.from("Circle").select("*, User!Circle_mentorId_fkey(name, email)").eq("id", circleId).single(),
            supabase.from("CircleSession").select("*").eq("circleId", circleId).order("scheduledAt", { ascending: true }),
            supabase.from("Resource").select("*, User!Resource_addedById_fkey(name)").eq("circleId", circleId).order("createdAt", { ascending: false }),
            supabase.from("DiscussionPost").select("*, User!DiscussionPost_authorId_fkey(name)").eq("circleId", circleId).is("parentId", null).order("createdAt", { ascending: false }),
        ]);

    return { circle, sessions: sessions ?? [], resources: resources ?? [], posts: posts ?? [] };
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function addSession(circleId: string, data: {
    title: string;
    scheduledAt: string;
    videoCallUrl: string;
}) {
    const supabase = createServerClient();
    const { error } = await supabase.from("CircleSession").insert({
        id: crypto.randomUUID(),
        circleId,
        title: data.title,
        scheduledAt: data.scheduledAt,
        videoCallUrl: data.videoCallUrl || null,
        status: "UPCOMING",
        createdAt: new Date().toISOString(),
    });
    if (error) throw error;
    revalidatePath(`/circles/${circleId}`);
}

export async function markSessionComplete(sessionId: string, circleId: string, notes: string) {
    const supabase = createServerClient();
    const { error } = await supabase.from("CircleSession").update({ status: "COMPLETED", notes }).eq("id", sessionId);
    if (error) throw error;
    revalidatePath(`/circles/${circleId}`);
}

// ─── Resources ────────────────────────────────────────────────────────────────

export async function addResource(circleId: string, addedById: string, data: {
    title: string;
    url: string;
    type: string;
}) {
    const supabase = createServerClient();
    const { error } = await supabase.from("Resource").insert({
        id: crypto.randomUUID(),
        circleId,
        addedById,
        title: data.title,
        url: data.url,
        type: data.type,
        createdAt: new Date().toISOString(),
    });
    if (error) throw error;
    revalidatePath(`/circles/${circleId}`);
}

export async function deleteResource(resourceId: string, circleId: string) {
    const supabase = createServerClient();
    const { error } = await supabase.from("Resource").delete().eq("id", resourceId);
    if (error) throw error;
    revalidatePath(`/circles/${circleId}`);
}

// ─── Discussion ───────────────────────────────────────────────────────────────

export async function postDiscussion(circleId: string, authorId: string, content: string, parentId?: string) {
    const supabase = createServerClient();
    const { error } = await supabase.from("DiscussionPost").insert({
        id: crypto.randomUUID(),
        circleId,
        authorId,
        content,
        parentId: parentId ?? null,
        createdAt: new Date().toISOString(),
    });
    if (error) throw error;
    revalidatePath(`/circles/${circleId}`);
}
