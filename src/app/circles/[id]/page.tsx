import { getUser } from "@/lib/get-user";
import { getCircleRoom } from "@/lib/circle-room-actions";
import { notFound, redirect } from "next/navigation";
import CircleRoomClient from "./circle-room-client";

export default async function CircleRoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getUser();
    if (!user) redirect("/login");

    const { circle, sessions, resources, posts } = await getCircleRoom(id);
    if (!circle) notFound();

    const isMentor = circle.mentorId === user.id;

    return (
        <CircleRoomClient
            circle={circle}
            sessions={sessions}
            resources={resources}
            posts={posts}
            currentUser={user}
            isMentor={isMentor}
        />
    );
}
