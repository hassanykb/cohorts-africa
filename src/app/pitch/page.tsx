import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";
import PitchClient from "./pitch-client";

export default async function PitchPage() {
    const user = await getUser();
    if (!user) redirect("/login");

    return <PitchClient userId={user.id} />;
}
