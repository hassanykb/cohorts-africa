import { getUser } from "@/lib/get-user";
import { getMentorsWithFollowStatus } from "@/lib/actions";
import { redirect } from "next/navigation";
import PitchClient from "./pitch-client";

export default async function PitchPage() {
    const user = await getUser();
    if (!user) redirect("/login");

    const mentors = await getMentorsWithFollowStatus(user.id);

    return <PitchClient user={user} mentors={mentors} />;
}
