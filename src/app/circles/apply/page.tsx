import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";
import ApplyClient from "./apply-client";

// URL would include circleId as a query/route param in production
export default async function ApplyPage() {
    const user = await getUser();
    if (!user) redirect("/login");

    return <ApplyClient user={user} />;
}
