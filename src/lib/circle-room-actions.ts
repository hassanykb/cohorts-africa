"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";
import { getUser } from "@/lib/get-user";

type CircleAccessErrorCode = "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND";
type CircleAccessError = Error & { code: CircleAccessErrorCode };
type QueryError = { code?: string | null; message?: string | null };
type CircleRow = {
    id: string;
    mentorId: string | null;
    creatorId: string;
    maxCapacity: number;
    durationWeeks: number;
    status: string;
};
type CircleChangeRequestRow = {
    id: string;
    newMaxCapacity: number | null;
    newDurationWeeks: number | null;
    notes: string | null;
    status: string;
    creatorApproved: boolean;
    mentorApproved: boolean;
    proposedById: string;
    createdAt: string;
    User?: unknown;
};

type CircleAccessContext = {
    supabase: ReturnType<typeof createServerClient>;
    userId: string;
    isMentor: boolean;
    isCreator: boolean;
    circle: CircleRow;
};

function createCircleAccessError(code: CircleAccessErrorCode, message: string): CircleAccessError {
    const error = new Error(message) as CircleAccessError;
    error.code = code;
    return error;
}

function isRecoverableRoomSchemaError(error: QueryError | null | undefined): boolean {
    if (!error) return false;
    const code = error.code ?? "";
    if (code === "42P01" || code === "42703" || code === "PGRST200" || code === "PGRST201" || code === "PGRST204" || code === "PGRST205") {
        return true;
    }

    const message = (error.message ?? "").toLowerCase();
    return (
        message.includes("does not exist")
        || message.includes("could not find the table")
        || message.includes("could not find a relationship")
        || message.includes("schema cache")
        || message.includes("column")
    );
}

async function requireCircleAccess(circleId: string, options?: { mentorOnly?: boolean }): Promise<CircleAccessContext> {
    const user = await getUser();
    if (!user) {
        throw createCircleAccessError("UNAUTHENTICATED", "You must be logged in.");
    }

    const supabase = createServerClient();
    const { data: circle, error: circleError } = await supabase
        .from("Circle")
        .select("id, mentorId, creatorId, maxCapacity, durationWeeks, status")
        .eq("id", circleId)
        .maybeSingle();

    if (circleError) throw circleError;
    if (!circle) {
        throw createCircleAccessError("NOT_FOUND", "Circle not found.");
    }

    const isMentor = circle.mentorId === user.id;
    const isCreator = circle.creatorId === user.id;
    let isAcceptedMentee = false;

    if (!isMentor && !isCreator) {
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

    if (!isMentor && !isCreator && !isAcceptedMentee) {
        throw createCircleAccessError("FORBIDDEN", "You are not a member of this circle.");
    }

    if (options?.mentorOnly && !isMentor) {
        throw createCircleAccessError("FORBIDDEN", "Only the mentor can perform this action.");
    }

    return {
        supabase,
        userId: user.id,
        isMentor,
        isCreator,
        circle: {
            id: circle.id,
            mentorId: circle.mentorId,
            creatorId: circle.creatorId,
            maxCapacity: circle.maxCapacity ?? 10,
            durationWeeks: circle.durationWeeks ?? 4,
            status: circle.status ?? "OPEN",
        },
    };
}

function revalidateCirclePaths(circleId: string) {
    revalidatePath(`/circles/${circleId}`);
    revalidatePath("/dashboard/mentor");
    revalidatePath("/dashboard/mentee");
    revalidatePath("/explore");
}

async function getFilledApplicationCount(
    supabase: ReturnType<typeof createServerClient>,
    circleId: string,
): Promise<number> {
    const { data, error } = await supabase
        .from("Application")
        .select("status")
        .eq("circleId", circleId)
        .in("status", ["PENDING", "ACCEPTED"]);

    if (error) throw error;
    return (data ?? []).length;
}

async function promoteWaitlistedApplications(
    supabase: ReturnType<typeof createServerClient>,
    circleId: string,
    maxCapacity: number,
): Promise<number> {
    const { data: applications, error } = await supabase
        .from("Application")
        .select("id, status")
        .eq("circleId", circleId)
        .order("createdAt", { ascending: true });

    if (error) throw error;

    const rows = applications ?? [];
    const filled = rows.filter((item) => item.status === "PENDING" || item.status === "ACCEPTED").length;
    const availableSlots = maxCapacity - filled;
    if (availableSlots <= 0) return 0;

    const waitlistIds = rows
        .filter((item) => item.status === "WAITLIST")
        .slice(0, availableSlots)
        .map((item) => item.id);

    if (waitlistIds.length === 0) return 0;

    const now = new Date().toISOString();
    const { error: promoteError } = await supabase
        .from("Application")
        .update({ status: "PENDING", updatedAt: now })
        .in("id", waitlistIds)
        .eq("circleId", circleId);

    if (promoteError) throw promoteError;
    return waitlistIds.length;
}

async function applyCircleValues(
    supabase: ReturnType<typeof createServerClient>,
    circleId: string,
    values: { newMaxCapacity: number | null; newDurationWeeks: number | null },
) {
    const payload: { maxCapacity?: number; durationWeeks?: number; updatedAt: string } = {
        updatedAt: new Date().toISOString(),
    };
    if (values.newMaxCapacity !== null) payload.maxCapacity = values.newMaxCapacity;
    if (values.newDurationWeeks !== null) payload.durationWeeks = values.newDurationWeeks;

    const { error } = await supabase
        .from("Circle")
        .update(payload)
        .eq("id", circleId);

    if (error) throw error;

    if (typeof payload.maxCapacity === "number") {
        await promoteWaitlistedApplications(supabase, circleId, payload.maxCapacity);
    }
}

// ─── Circle Room Data ─────────────────────────────────────────────────────────

export async function getCircleRoom(circleId: string) {
    const { supabase, isMentor, isCreator } = await requireCircleAccess(circleId);

    const [{ data: circleWithMentor, error: circleError }, { data: sessions, error: sessionsError }, { data: resources, error: resourcesError }, { data: posts, error: postsError }, { data: changeRequests, error: changeRequestsError }] =
        await Promise.all([
            supabase.from("Circle").select("*, User!Circle_mentorId_fkey(name, email)").eq("id", circleId).single(),
            supabase.from("CircleSession").select("*").eq("circleId", circleId).order("scheduledAt", { ascending: true }),
            supabase.from("Resource").select("*, User!Resource_addedById_fkey(name)").eq("circleId", circleId).order("createdAt", { ascending: false }),
            supabase.from("DiscussionPost").select("*, User!DiscussionPost_authorId_fkey(name)").eq("circleId", circleId).is("parentId", null).order("createdAt", { ascending: false }),
            supabase
                .from("CircleChangeRequest")
                .select("id, newMaxCapacity, newDurationWeeks, notes, status, creatorApproved, mentorApproved, proposedById, createdAt, User!CircleChangeRequest_proposedById_fkey(name)")
                .eq("circleId", circleId)
                .eq("status", "PENDING")
                .order("createdAt", { ascending: false }),
        ]);

    let circle = circleWithMentor;
    if (circleError) {
        if (!isRecoverableRoomSchemaError(circleError)) throw circleError;
        const { data: fallbackCircle, error: fallbackCircleError } = await supabase
            .from("Circle")
            .select("*")
            .eq("id", circleId)
            .single();

        if (fallbackCircleError) throw fallbackCircleError;
        circle = { ...fallbackCircle, User: null };
    }

    let safeSessions = sessions ?? [];
    if (sessionsError) {
        if (!isRecoverableRoomSchemaError(sessionsError)) throw sessionsError;
        console.warn("Circle room: session table/schema not ready, returning empty sessions.", sessionsError.message);
        safeSessions = [];
    }

    let safeResources = resources ?? [];
    if (resourcesError) {
        if (!isRecoverableRoomSchemaError(resourcesError)) throw resourcesError;
        const { data: fallbackResources, error: fallbackResourcesError } = await supabase
            .from("Resource")
            .select("*")
            .eq("circleId", circleId)
            .order("createdAt", { ascending: false });

        if (fallbackResourcesError) {
            if (!isRecoverableRoomSchemaError(fallbackResourcesError)) throw fallbackResourcesError;
            console.warn("Circle room: resource table/schema not ready, returning empty resources.", fallbackResourcesError.message);
            safeResources = [];
        } else {
            safeResources = (fallbackResources ?? []).map((item) => ({ ...item, User: null }));
        }
    }

    let safePosts = posts ?? [];
    if (postsError) {
        if (!isRecoverableRoomSchemaError(postsError)) throw postsError;
        const { data: fallbackPosts, error: fallbackPostsError } = await supabase
            .from("DiscussionPost")
            .select("*")
            .eq("circleId", circleId)
            .is("parentId", null)
            .order("createdAt", { ascending: false });

        if (fallbackPostsError) {
            if (!isRecoverableRoomSchemaError(fallbackPostsError)) throw fallbackPostsError;
            console.warn("Circle room: discussion table/schema not ready, returning empty discussion.", fallbackPostsError.message);
            safePosts = [];
        } else {
            safePosts = (fallbackPosts ?? []).map((item) => ({ ...item, User: null }));
        }
    }

    let safeChangeRequests: CircleChangeRequestRow[] = (changeRequests ?? []) as CircleChangeRequestRow[];
    if (changeRequestsError) {
        if (!isRecoverableRoomSchemaError(changeRequestsError)) throw changeRequestsError;
        const { data: fallbackRequests, error: fallbackRequestsError } = await supabase
            .from("CircleChangeRequest")
            .select("id, newMaxCapacity, newDurationWeeks, notes, status, creatorApproved, mentorApproved, proposedById, createdAt")
            .eq("circleId", circleId)
            .eq("status", "PENDING")
            .order("createdAt", { ascending: false });

        if (fallbackRequestsError) {
            if (!isRecoverableRoomSchemaError(fallbackRequestsError)) throw fallbackRequestsError;
            safeChangeRequests = [];
        } else {
            safeChangeRequests = (fallbackRequests ?? []).map((item) => ({ ...item, User: null })) as CircleChangeRequestRow[];
        }
    }

    if (!circle) {
        throw createCircleAccessError("NOT_FOUND", "Circle not found.");
    }

    const normalizedChangeRequests = safeChangeRequests.map((item) => {
        const userRelation = (item as { User?: unknown }).User;
        const normalizedUser = Array.isArray(userRelation) ? (userRelation[0] ?? null) : (userRelation ?? null);
        return {
            ...item,
            User: normalizedUser as { name: string } | null,
        };
    });

    return {
        circle,
        sessions: safeSessions,
        resources: safeResources,
        posts: safePosts,
        changeRequests: normalizedChangeRequests,
        isMentor,
        isCreator,
    };
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
    revalidateCirclePaths(circleId);
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

    revalidateCirclePaths(circleId);
}

export async function updateSession(sessionId: string, circleId: string, data: {
    title: string;
    scheduledAt: string;
    videoCallUrl: string;
}) {
    const { supabase } = await requireCircleAccess(circleId, { mentorOnly: true });

    const title = data.title.trim();
    if (!title) {
        throw new Error("Session title is required.");
    }
    if (!data.scheduledAt) {
        throw new Error("Session date/time is required.");
    }

    const { data: existingSession, error: existingError } = await supabase
        .from("CircleSession")
        .select("id, status")
        .eq("id", sessionId)
        .eq("circleId", circleId)
        .maybeSingle();

    if (existingError) throw existingError;
    if (!existingSession) {
        throw createCircleAccessError("NOT_FOUND", "Session not found.");
    }
    if (existingSession.status !== "UPCOMING") {
        throw new Error("Only upcoming sessions can be edited.");
    }

    const { error } = await supabase
        .from("CircleSession")
        .update({
            title,
            scheduledAt: data.scheduledAt,
            videoCallUrl: data.videoCallUrl || null,
        })
        .eq("id", sessionId)
        .eq("circleId", circleId);

    if (error) throw error;
    revalidateCirclePaths(circleId);
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
    revalidateCirclePaths(circleId);
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
    revalidateCirclePaths(circleId);
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
    revalidateCirclePaths(circleId);
}

// ─── Circle Change Requests ───────────────────────────────────────────────────

export async function proposeCircleUpdate(circleId: string, data: {
    newMaxCapacity?: number | null;
    extendByWeeks?: number | null;
    notes?: string;
}) {
    const { supabase, isMentor, isCreator, circle } = await requireCircleAccess(circleId);
    if (!isMentor && !isCreator) {
        throw createCircleAccessError("FORBIDDEN", "Only the organizer or mentor can propose circle changes.");
    }

    const maxValue = typeof data.newMaxCapacity === "number" ? Math.floor(data.newMaxCapacity) : null;
    const extendByWeeks = typeof data.extendByWeeks === "number" ? Math.floor(data.extendByWeeks) : 0;
    const newMaxCapacity = maxValue !== null ? maxValue : null;
    const newDurationWeeks = extendByWeeks > 0 ? circle.durationWeeks + extendByWeeks : null;
    const notes = data.notes?.trim() || null;

    if (newMaxCapacity === null && newDurationWeeks === null) {
        throw new Error("Provide at least one change: increase capacity and/or extend duration.");
    }
    if (newMaxCapacity !== null && newMaxCapacity <= circle.maxCapacity) {
        throw new Error(`Capacity must be greater than current capacity (${circle.maxCapacity}).`);
    }
    if (newDurationWeeks !== null && newDurationWeeks <= circle.durationWeeks) {
        throw new Error("Duration extension must add at least one week.");
    }

    if (newMaxCapacity !== null) {
        const filledCount = await getFilledApplicationCount(supabase, circleId);
        if (newMaxCapacity < filledCount) {
            throw new Error(`Capacity cannot be less than current enrolled count (${filledCount}).`);
        }
    }

    const requiresDualApproval = Boolean(circle.mentorId) && circle.creatorId !== circle.mentorId;
    if (!requiresDualApproval) {
        await applyCircleValues(supabase, circleId, { newMaxCapacity, newDurationWeeks });
        revalidateCirclePaths(circleId);
        return {
            status: "APPLIED" as const,
            message: "Circle changes applied.",
        };
    }

    const { data: pendingRequests, error: pendingError } = await supabase
        .from("CircleChangeRequest")
        .select("id, newMaxCapacity, newDurationWeeks, creatorApproved, mentorApproved, notes")
        .eq("circleId", circleId)
        .eq("status", "PENDING")
        .order("createdAt", { ascending: false });

    if (pendingError) throw pendingError;

    const existingRequest = (pendingRequests ?? []).find((request) =>
        (request.newMaxCapacity ?? null) === (newMaxCapacity ?? null)
        && (request.newDurationWeeks ?? null) === (newDurationWeeks ?? null),
    );

    const creatorApproved = isCreator || Boolean(existingRequest?.creatorApproved);
    const mentorApproved = isMentor || Boolean(existingRequest?.mentorApproved);
    const now = new Date().toISOString();

    let requestId: string;
    if (existingRequest) {
        requestId = existingRequest.id;
        const { error: updateError } = await supabase
            .from("CircleChangeRequest")
            .update({
                creatorApproved,
                mentorApproved,
                notes: notes ?? existingRequest.notes ?? null,
                updatedAt: now,
            })
            .eq("id", existingRequest.id);
        if (updateError) throw updateError;
    } else {
        requestId = crypto.randomUUID();
        const { error: createError } = await supabase.from("CircleChangeRequest").insert({
            id: requestId,
            circleId,
            proposedById: isCreator ? circle.creatorId : (circle.mentorId ?? circle.creatorId),
            newMaxCapacity,
            newDurationWeeks,
            notes,
            status: "PENDING",
            creatorApproved,
            mentorApproved,
            createdAt: now,
            updatedAt: now,
        });
        if (createError) throw createError;
    }

    if (creatorApproved && mentorApproved) {
        await applyCircleValues(supabase, circleId, { newMaxCapacity, newDurationWeeks });
        const { error: completeError } = await supabase
            .from("CircleChangeRequest")
            .update({ status: "APPLIED", updatedAt: now })
            .eq("id", requestId);
        if (completeError) throw completeError;

        revalidateCirclePaths(circleId);
        return {
            status: "APPLIED" as const,
            message: "Both approvals received. Circle changes applied.",
        };
    }

    revalidateCirclePaths(circleId);
    return {
        status: "PENDING" as const,
        message: "Change request recorded. Waiting for the other approver.",
        pendingFor: creatorApproved ? "MENTOR" as const : "ORGANIZER" as const,
    };
}

export async function approveCircleUpdateRequest(circleId: string, requestId: string) {
    const { supabase, isMentor, isCreator, circle } = await requireCircleAccess(circleId);
    if (!isMentor && !isCreator) {
        throw createCircleAccessError("FORBIDDEN", "Only the organizer or mentor can approve this request.");
    }

    const { data: request, error } = await supabase
        .from("CircleChangeRequest")
        .select("id, newMaxCapacity, newDurationWeeks, creatorApproved, mentorApproved, status")
        .eq("id", requestId)
        .eq("circleId", circleId)
        .maybeSingle();

    if (error) throw error;
    if (!request || request.status !== "PENDING") {
        throw createCircleAccessError("NOT_FOUND", "Pending change request not found.");
    }

    const creatorApproved = request.creatorApproved || isCreator;
    const mentorApproved = request.mentorApproved || isMentor;
    const now = new Date().toISOString();

    const { error: approveError } = await supabase
        .from("CircleChangeRequest")
        .update({
            creatorApproved,
            mentorApproved,
            updatedAt: now,
        })
        .eq("id", requestId);
    if (approveError) throw approveError;

    if (creatorApproved && mentorApproved) {
        if (request.newMaxCapacity !== null && request.newMaxCapacity < circle.maxCapacity) {
            throw new Error("Requested capacity is lower than current capacity. Create a new request.");
        }
        if (request.newDurationWeeks !== null && request.newDurationWeeks < circle.durationWeeks) {
            throw new Error("Requested duration is lower than current duration. Create a new request.");
        }

        if (request.newMaxCapacity !== null) {
            const filledCount = await getFilledApplicationCount(supabase, circleId);
            if (request.newMaxCapacity < filledCount) {
                throw new Error(`Requested capacity is below current enrolled count (${filledCount}).`);
            }
        }

        await applyCircleValues(supabase, circleId, {
            newMaxCapacity: request.newMaxCapacity,
            newDurationWeeks: request.newDurationWeeks,
        });

        const { error: completeError } = await supabase
            .from("CircleChangeRequest")
            .update({ status: "APPLIED", updatedAt: now })
            .eq("id", requestId);
        if (completeError) throw completeError;

        revalidateCirclePaths(circleId);
        return { status: "APPLIED" as const };
    }

    revalidateCirclePaths(circleId);
    return { status: "PENDING" as const };
}
