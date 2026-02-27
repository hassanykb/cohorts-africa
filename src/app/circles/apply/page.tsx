import { getUser } from "@/lib/get-user";
import { getCircleForApplication } from "@/lib/actions";
import { notFound, redirect } from "next/navigation";
import ApplyClient from "./apply-client";

export default async function ApplyPage({
    searchParams,
}: {
    searchParams: Promise<{ circleId?: string }>;
}) {
    const user = await getUser();
    if (!user) redirect("/login");

    const { circleId } = await searchParams;
    if (!circleId) redirect("/explore");

    const circle = await getCircleForApplication(circleId);
    if (!circle) notFound();
    if (!["OPEN", "ACTIVE"].includes(circle.status)) notFound();

    return <ApplyClient user={user} circleId={circleId} circle={circle} />;
}
