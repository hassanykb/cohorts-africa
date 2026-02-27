import { getUser } from "@/lib/get-user";
import { getCircleRoom, isCircleAccessError } from "@/lib/circle-room-actions";
import { notFound, redirect } from "next/navigation";
import CircleRoomClient from "./circle-room-client";

export default async function CircleRoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getUser();
    if (!user) redirect("/login");

    let room: Awaited<ReturnType<typeof getCircleRoom>>;
    try {
        room = await getCircleRoom(id);
    } catch (error) {
        if (isCircleAccessError(error, "UNAUTHENTICATED")) redirect("/login");
        if (isCircleAccessError(error, "FORBIDDEN") || isCircleAccessError(error, "NOT_FOUND")) notFound();
        throw error;
    }

    return (
        <CircleRoomClient
            circle={room.circle}
            sessions={room.sessions}
            resources={room.resources}
            posts={room.posts}
            currentUser={user}
            isMentor={room.isMentor}
        />
    );
}
