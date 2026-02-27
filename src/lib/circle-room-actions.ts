"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";
import { getUser } from "@/lib/get-user";

type CircleAccessErrorCode = "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND";
type CircleAccessError = Error & { code: CircleAccessErrorCode };

type CircleAccessContext = {
    supabase: ReturnType<typeof createServerClient>;
    userId: string;
    isMentor: boolean;
};

function createCircleAccessError(code: CircleAccessErrorCode, message: string): CircleAccessError {
    const error = new Error(message) as CircleAccessError;
    error.code = code;
    return error;
}

export function isCircleAccessError(error: unknown, code?: CircleAccessErrorCode): boolean {
    if (!(error instanceof Error)) return false;
    const value = (error as { code?: unknown }).code;
    if (
        value !== "UNAUTHENTICATED"
        && value !== "FORBIDDEN"
        && value !== "NOT_FOUND"
    ) {
        return false;
    }
    return code ? value === code : true;
}

async function requireCircleAccess(circleId: string, options?: { mentorOnly?: boolean }): Promise<CircleAccessContext> {
    const user = await getUser();
    if (!user) {
        throw createCircleAccessError("UNAUTHENTICATED", "You must be logged in.");
    }

    const supabase = createServerClient();
    const { data: circle, error: circleError } = await supabase
        .from("Circle")
        .select("id, mentorId")
        .eq("id", circleId)
        .maybeSingle();

    if (circleError) throw circleError;
    if (!circle) {
        throw createCircleAccessError("NOT_FOUND", "Circle not found.");
    }

    const isMentor = circle.mentorId === user.id;
    let isAcceptedMentee = false;

    if (!isMentor) {
        const { data: membership, error: membershipError } = await supabase
            .from("Application")
            .select("id")
            .eq("circleId", circleId)
            .eq("menteeId", user.id)
            .eq("status", "ACCEPTED")
            .maybeSingle();

        if (membershipError) throw membershipError;
        isAcceptedMentee = Boolean(membership);
    }

    if (!isMentor && !isAcceptedMentee) {
        throw createCircleAccessError("FORBIDDEN", "You are not a member of this circle.");
    }

    if (options?.mentorOnly && !isMentor) {
        throw createCircleAccessError("FORBIDDEN", "Only the mentor can perform this action.");
    }

    return { supabase, userId: user.id, isMentor };
}

// ─── Circle Room Data ─────────────────────────────────────────────────────────

export async function getCircleRoom(circleId: string) {
    const { supabase, isMentor } = await requireCircleAccess(circleId);

    const [{ data: circle, error: circleError }, { data: sessions, error: sessionsError }, { data: resources, error: resourcesError }, { data: posts, error: postsError }] =
        await Promise.all([
            supabase.from("Circle").select("*, User!Circle_mentorId_fkey(name, email)").eq("id", circleId).single(),
            supabase.from("CircleSession").select("*").eq("circleId", circleId).order("scheduledAt", { ascending: true }),
            supabase.from("Resource").select("*, User!Resource_addedById_fkey(name)").eq("circleId", circleId).order("createdAt", { ascending: false }),
            supabase.from("DiscussionPost").select("*, User!DiscussionPost_authorId_fkey(name)").eq("circleId", circleId).is("parentId", null).order("createdAt", { ascending: false }),
        ]);

    if (circleError) throw circleError;
    if (sessionsError) throw sessionsError;
    if (resourcesError) throw resourcesError;
    if (postsError) throw postsError;
    if (!circle) {
        throw createCircleAccessError("NOT_FOUND", "Circle not found.");
    }

    return { circle, sessions: sessions ?? [], resources: resources ?? [], posts: posts ?? [], isMentor };
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function addSession(circleId: string, data: {
    title: string;
    scheduledAt: string;
    videoCallUrl: string;
}) {
    const { supabase } = await requireCircleAccess(circleId, { mentorOnly: true });
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
    const { supabase } = await requireCircleAccess(circleId, { mentorOnly: true });
    const { data: updatedSession, error } = await supabase
        .from("CircleSession")
        .update({ status: "COMPLETED", notes })
        .eq("id", sessionId)
        .eq("circleId", circleId)
        .select("id")
        .maybeSingle();

    if (error) throw error;
    if (!updatedSession) {
        throw createCircleAccessError("NOT_FOUND", "Session not found.");
    }

    revalidatePath(`/circles/${circleId}`);
}

// ─── Resources ────────────────────────────────────────────────────────────────

export async function addResource(circleId: string, data: {
    title: string;
    url: string;
    type: string;
}) {
    const { supabase, userId } = await requireCircleAccess(circleId);
    const { error } = await supabase.from("Resource").insert({
        id: crypto.randomUUID(),
        circleId,
        addedById: userId,
        title: data.title,
        url: data.url,
        type: data.type,
        createdAt: new Date().toISOString(),
    });
    if (error) throw error;
    revalidatePath(`/circles/${circleId}`);
}

export async function deleteResource(resourceId: string, circleId: string) {
    const { supabase, userId, isMentor } = await requireCircleAccess(circleId);
    const { data: resource, error: resourceError } = await supabase
        .from("Resource")
        .select("id, addedById")
        .eq("id", resourceId)
        .eq("circleId", circleId)
        .maybeSingle();

    if (resourceError) throw resourceError;
    if (!resource) {
        throw createCircleAccessError("NOT_FOUND", "Resource not found.");
    }
    if (!isMentor && resource.addedById !== userId) {
        throw createCircleAccessError("FORBIDDEN", "Only the mentor or resource owner can delete this.");
    }

    const { error } = await supabase
        .from("Resource")
        .delete()
        .eq("id", resourceId)
        .eq("circleId", circleId);

    if (error) throw error;
    revalidatePath(`/circles/${circleId}`);
}

// ─── Discussion ───────────────────────────────────────────────────────────────

export async function postDiscussion(circleId: string, content: string, parentId?: string) {
    const { supabase, userId } = await requireCircleAccess(circleId);
    const trimmedContent = content.trim();
    if (!trimmedContent) throw new Error("Post content cannot be empty.");

    if (parentId) {
        const { data: parent, error: parentError } = await supabase
            .from("DiscussionPost")
            .select("id")
            .eq("id", parentId)
            .eq("circleId", circleId)
            .maybeSingle();

        if (parentError) throw parentError;
        if (!parent) {
            throw createCircleAccessError("NOT_FOUND", "Parent discussion post not found.");
        }
    }

    const { error } = await supabase.from("DiscussionPost").insert({
        id: crypto.randomUUID(),
        circleId,
        authorId: userId,
        content: trimmedContent,
        parentId: parentId ?? null,
        createdAt: new Date().toISOString(),
    });
    if (error) throw error;
    revalidatePath(`/circles/${circleId}`);
}
