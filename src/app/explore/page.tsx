import { createServerClient } from "@/lib/supabase-server";
import { getUser } from "@/lib/get-user";
import ExploreClient from "./explore-client";
import AppNavbar from "@/components/AppNavbar";

async function getCircles() {
    const supabase = createServerClient();
    const { data } = await supabase
        .from("Circle")
        .select("*, User!Circle_mentorId_fkey(name)")
        .in("status", ["OPEN", "ACTIVE", "PROPOSED"])
        .order("createdAt", { ascending: false });
    return data ?? [];
}

export default async function Explore() {
    const [circles, user] = await Promise.all([getCircles(), getUser()]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <AppNavbar user={user} active="explore" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ExploreClient circles={circles} />
            </main>
        </div>
    );
}
