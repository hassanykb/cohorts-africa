import { getUser } from "@/lib/get-user";
import { getCircleRoom } from "@/lib/circle-room-actions";
import { notFound, redirect } from "next/navigation";
import CircleRoomClient from "./circle-room-client";

function hasCircleAccessErrorCode(
    error: unknown,
    code: "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND",
): boolean {
    if (!(error instanceof Error)) return false;
    return (error as { code?: unknown }).code === code;
}

export default async function CircleRoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getUser();
    if (!user) redirect("/login");

    let room: Awaited<ReturnType<typeof getCircleRoom>>;
    try {
        room = await getCircleRoom(id);
    } catch (error) {
        if (hasCircleAccessErrorCode(error, "UNAUTHENTICATED")) redirect("/login");
        if (hasCircleAccessErrorCode(error, "FORBIDDEN") || hasCircleAccessErrorCode(error, "NOT_FOUND")) notFound();
        throw error;
    }

    return (
        <CircleRoomClient
            circle={room.circle}
            sessions={room.sessions}
            resources={room.resources}
            posts={room.posts}
            changeRequests={room.changeRequests}
            currentUser={user}
            isMentor={room.isMentor}
            isCreator={room.isCreator}
        />
    );
}
