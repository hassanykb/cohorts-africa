"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";

const FILLED_APPLICATION_STATUSES = ["PENDING", "ACCEPTED"] as const;

function countFilledApplications(applications: Array<{ status?: string | null }>): number {
    return applications.filter((app) => FILLED_APPLICATION_STATUSES.includes((app.status ?? "") as (typeof FILLED_APPLICATION_STATUSES)[number])).length;
}

async function requireMentorCircleAccess(circleId: string, mentorId: string) {
    const supabase = createServerClient();
    const { data: circle, error } = await supabase
        .from("Circle")
        .select("id, mentorId, maxCapacity, status")
        .eq("id", circleId)
        .maybeSingle();

    if (error) throw error;
    if (!circle) throw new Error("Circle not found.");
    if (circle.mentorId !== mentorId) throw new Error("You are not allowed to manage this circle.");
    return { supabase, circle };
}

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
        .select("*, Application(id, status)")
        .eq("mentorId", mentorId)
        .order("createdAt", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

export async function getCirclesByCreator(creatorId: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("Circle")
        .select("*, Application(id, status)")
        .eq("creatorId", creatorId)
        .order("createdAt", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

export async function getPitchRequestsForMentor(mentorId: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("Circle")
        .select("*, User!Circle_creatorId_fkey(name, email)")
        .eq("mentorId", mentorId)
        .eq("status", "PROPOSED")
        .order("createdAt", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

export async function getCircleForApplication(circleId: string) {
    const supabase = createServerClient();
    const [{ data: circle, error: circleError }, { data: applications, error: appError }] = await Promise.all([
        supabase
            .from("Circle")
            .select("id, title, description, maxCapacity, status, User!Circle_mentorId_fkey(name)")
            .eq("id", circleId)
            .maybeSingle(),
        supabase
            .from("Application")
            .select("status")
            .eq("circleId", circleId),
    ]);

    if (circleError) throw circleError;
    if (appError) throw appError;
    if (!circle) return null;

    const allApplications = (applications ?? []) as Array<{ status?: string | null }>;
    const filled = countFilledApplications(allApplications);
    const waitlistCount = allApplications.filter((app) => app.status === "WAITLIST").length;

    return {
        ...circle,
        filled,
        waitlistCount,
        spotsLeft: Math.max((circle.maxCapacity ?? 0) - filled, 0),
    };
}

export async function createCircle(formData: FormData, mentorId: string, options?: { asDraft?: boolean }) {
    const supabase = createServerClient();
    const now = new Date().toISOString();
    const circleId = crypto.randomUUID();
    const asDraft = options?.asDraft ?? false;

    const titleInput = formData.get("title");
    const descriptionInput = formData.get("description");
    const durationInput = formData.get("durationWeeks");
    const title = typeof titleInput === "string" ? titleInput.trim() : "";
    const description = typeof descriptionInput === "string" ? descriptionInput.trim() : "";
    const durationWeeks = Number(durationInput ?? 4);

    const resolvedTitle = title || (asDraft ? "Untitled Draft Circle" : "");
    const resolvedDescription = description || (asDraft ? "Draft description" : "");

    if (!resolvedTitle || !resolvedDescription) {
        throw new Error("Title and description are required.");
    }

    const { error } = await supabase.from("Circle").insert({
        id: circleId,
        creatorId: mentorId,
        mentorId: mentorId,
        title: resolvedTitle,
        description: resolvedDescription,
        maxCapacity: Number(formData.get("capacity") ?? 10),
        durationWeeks: Number.isFinite(durationWeeks) && durationWeeks > 0 ? durationWeeks : 4,
        status: asDraft ? "DRAFT" : "OPEN",
        createdAt: now,
        updatedAt: now,
    });

    if (error) throw error;
    revalidatePath("/dashboard/mentor");
    revalidatePath("/explore");
    return circleId;
}

export async function savePitchDraft(data: {
    creatorId: string;
    mentorId?: string | null;
    title?: string;
    description?: string;
    durationWeeks?: number;
}) {
    const supabase = createServerClient();
    const now = new Date().toISOString();
    const circleId = crypto.randomUUID();

    const title = data.title?.trim() || "Untitled Draft Pitch";
    const description = data.description?.trim() || "Draft description";

    const { error } = await supabase.from("Circle").insert({
        id: circleId,
        creatorId: data.creatorId,
        mentorId: data.mentorId ?? null,
        title,
        description,
        maxCapacity: 10,
        durationWeeks: data.durationWeeks ?? 4,
        status: "DRAFT",
        createdAt: now,
        updatedAt: now,
    });

    if (error) throw error;
    revalidatePath("/dashboard/mentee");
    revalidatePath("/pitch");
    return circleId;
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

export async function getDraftCirclesByCreator(creatorId: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("Circle")
        .select("id, title, description, updatedAt, mentorId, status")
        .eq("creatorId", creatorId)
        .order("updatedAt", { ascending: false });

    if (error) throw error;

    return (data ?? []).filter((circle: { status?: string }) => circle.status === "DRAFT");
}

export async function submitApplication(circleId: string, menteeId: string, intentStatement: string) {
    const supabase = createServerClient();
    const now = new Date().toISOString();

    const [{ data: circle, error: circleError }, { data: existing, error: existingError }, { data: allApplications, error: countError }] = await Promise.all([
        supabase
            .from("Circle")
            .select("id, status, maxCapacity")
            .eq("id", circleId)
            .maybeSingle(),
        supabase
            .from("Application")
            .select("id, status")
            .eq("circleId", circleId)
            .eq("menteeId", menteeId)
            .maybeSingle(),
        supabase
            .from("Application")
            .select("status")
            .eq("circleId", circleId),
    ]);

    if (circleError) throw circleError;
    if (existingError) throw existingError;
    if (countError) throw countError;
    if (!circle) throw new Error("Circle not found.");
    if (!["OPEN", "ACTIVE"].includes(circle.status)) {
        throw new Error("Applications are currently closed for this circle.");
    }
    if (existing && existing.status !== "REJECTED") {
        throw new Error(`You already have an application for this circle (${existing.status}).`);
    }

    const filled = countFilledApplications((allApplications ?? []) as Array<{ status?: string | null }>);
    const applicationStatus = filled >= (circle.maxCapacity ?? 0) ? "WAITLIST" : "PENDING";

    if (existing?.status === "REJECTED") {
        const { error } = await supabase
            .from("Application")
            .update({
                intentStatement,
                status: applicationStatus,
                updatedAt: now,
            })
            .eq("id", existing.id);

        if (error) {
            if (applicationStatus === "WAITLIST" && error.message.includes("invalid input value for enum")) {
                throw new Error("Waitlist status is not available in the database yet. Run the latest Supabase migration.");
            }
            throw error;
        }
    } else {
        const { error } = await supabase.from("Application").insert({
            id: crypto.randomUUID(),
            circleId,
            menteeId,
            intentStatement,
            status: applicationStatus,
            createdAt: now,
            updatedAt: now,
        });

        if (error) {
            if (applicationStatus === "WAITLIST" && error.message.includes("invalid input value for enum")) {
                throw new Error("Waitlist status is not available in the database yet. Run the latest Supabase migration.");
            }
            throw error;
        }
    }

    if (applicationStatus === "PENDING" && filled + 1 >= (circle.maxCapacity ?? 0) && circle.status === "OPEN") {
        const { error: closeError } = await supabase
            .from("Circle")
            .update({
                status: "ACTIVE",
                updatedAt: now,
            })
            .eq("id", circleId);
        if (closeError) throw closeError;
    }

    revalidatePath("/dashboard/mentee");
    revalidatePath("/dashboard/mentor");
    revalidatePath("/explore");
    return { status: applicationStatus as "PENDING" | "WAITLIST" };
}

export async function closeCircleApplications(circleId: string, mentorId: string) {
    const now = new Date().toISOString();
    const { supabase, circle } = await requireMentorCircleAccess(circleId, mentorId);
    if (circle.status !== "OPEN") return;

    const { error } = await supabase
        .from("Circle")
        .update({
            status: "ACTIVE",
            updatedAt: now,
        })
        .eq("id", circleId);

    if (error) throw error;
    revalidatePath("/dashboard/mentor");
    revalidatePath("/explore");
    revalidatePath(`/circles/${circleId}`);
}

export async function reopenCircleApplications(circleId: string, mentorId: string) {
    const now = new Date().toISOString();
    const { supabase, circle } = await requireMentorCircleAccess(circleId, mentorId);
    if (circle.status === "OPEN") return;
    if (circle.status === "COMPLETED") {
        throw new Error("Completed circles cannot be reopened.");
    }

    const { data: applications, error: appError } = await supabase
        .from("Application")
        .select("status")
        .eq("circleId", circleId);

    if (appError) throw appError;
    const filled = countFilledApplications((applications ?? []) as Array<{ status?: string | null }>);
    if (filled >= (circle.maxCapacity ?? 0)) {
        throw new Error("Circle is already at capacity. Increase capacity or move someone to waitlist before reopening.");
    }

    const { error } = await supabase
        .from("Circle")
        .update({
            status: "OPEN",
            updatedAt: now,
        })
        .eq("id", circleId);

    if (error) throw error;
    revalidatePath("/dashboard/mentor");
    revalidatePath("/explore");
    revalidatePath(`/circles/${circleId}`);
}

// ─── Pitches (Mentee-Initiated Circles) ───────────────────────────────────

export async function submitPitch(data: {
    creatorId: string;
    mentorId: string;   // now required — must be a followed mentor
    title: string;
    description: string;
    tags: string[];
    durationWeeks?: number;
}) {
    const supabase = createServerClient();

    // Guard: creatorId must follow mentorId
    const { data: follow } = await supabase
        .from("Follow")
        .select("id")
        .eq("followerId", data.creatorId)
        .eq("mentorId", data.mentorId)
        .single();

    if (!follow) throw new Error("You must follow this mentor before pitching to them.");

    const now = new Date().toISOString();
    const { error } = await supabase.from("Circle").insert({
        id: crypto.randomUUID(),
        creatorId: data.creatorId,
        mentorId: data.mentorId,
        title: data.title,
        description: data.description,
        maxCapacity: 10,
        durationWeeks: data.durationWeeks ?? 4,
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
    role?: "MENTOR" | "MENTEE" | "BOTH";
    avatarUrl?: string | null;
}) {
    const supabase = createServerClient();
    const now = new Date().toISOString();

    const { error } = await supabase.from("User").upsert({
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role ?? "BOTH",
        reputationScore: 75,
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

// ─── Follow / Unfollow ────────────────────────────────────────────────────────

export type MentorWithFollow = {
    id: string;
    name: string;
    email: string;
    linkedinUrl: string | null;
    bio: string | null;
    avatarUrl: string | null;
    isFollowing: boolean;
};

export async function getMentorsWithFollowStatus(viewerId: string): Promise<MentorWithFollow[]> {
    const supabase = createServerClient();

    const [{ data: mentors }, { data: follows }] = await Promise.all([
        supabase.from("User").select("id, name, email, linkedinUrl, bio, avatarUrl").in("role", ["MENTOR", "MENTEE", "BOTH"]).neq("id", viewerId),
        supabase.from("Follow").select("mentorId").eq("followerId", viewerId),
    ]);

    const followedIds = new Set((follows ?? []).map((f: { mentorId: string }) => f.mentorId));

    return (mentors ?? []).map((m: Omit<MentorWithFollow, "isFollowing">) => ({
        ...m,
        isFollowing: followedIds.has(m.id),
    }));
}

export async function followMentor(followerId: string, mentorId: string) {
    const supabase = createServerClient();
    const { error } = await supabase.from("Follow").insert({
        id: crypto.randomUUID(),
        followerId,
        mentorId,
        createdAt: new Date().toISOString(),
    });
    if (error && !error.message.includes("duplicate")) throw error;
    revalidatePath("/pitch");
}

export async function unfollowMentor(followerId: string, mentorId: string) {
    const supabase = createServerClient();
    const { error } = await supabase
        .from("Follow")
        .delete()
        .eq("followerId", followerId)
        .eq("mentorId", mentorId);
    if (error) throw error;
    revalidatePath("/pitch");
}

export async function searchUsers(query: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from("User")
        .select("id, name, email")
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

    if (error) throw error;
    return data ?? [];
}
