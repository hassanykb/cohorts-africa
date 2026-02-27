import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";
import CreateCircleClient from "./create-circle-client";
import { isMentorRole } from "@/lib/roles";

export default async function CreateCirclePage() {
    const user = await getUser();
    if (!user) redirect("/login");
    if (!isMentorRole(user.role)) redirect("/dashboard/mentee");

    return <CreateCircleClient user={user} />;
}
