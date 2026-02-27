import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";
import CreateCircleClient from "./create-circle-client";

export default async function CreateCirclePage() {
    const user = await getUser();
    if (!user) redirect("/login");

    return <CreateCircleClient user={user} />;
}
