import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import { getUser } from "@/lib/get-user";
import ProfileMenu from "@/components/ProfileMenu";
import BrandLogo from "@/components/BrandLogo";
import ExploreClient from "./explore-client";

async function getCircles() {
    const supabase = createServerClient();
    const { data } = await supabase
        .from("Circle")
        .select("*, User!Circle_mentorId_fkey(name)")
        .in("status", ["OPEN", "ACTIVE", "PROPOSED"])
        .order("createdAt", { ascending: false });
    return data ?? [];
}

function initials(name?: string | null) {
    if (!name) return "ME";
    return name.split(" ").filter(Boolean).map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default async function Explore() {
    const [circles, user] = await Promise.all([getCircles(), getUser()]);
    const userRole = user?.role;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <BrandLogo role={userRole} />
                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                                <Link href="/explore" className="text-indigo-600">Explore</Link>
                                <Link href={userRole === "MENTOR" ? "/dashboard/mentor" : "/dashboard/mentee"} className="text-slate-600 hover:text-indigo-600 transition-colors">Dashboard</Link>
                            </div>
                            {user && (
                                <ProfileMenu
                                    name={user.name}
                                    email={user.email}
                                    initials={initials(user.name)}
                                    role={user.role}
                                    avatarUrl={user.avatarUrl}
                                />
                            )}
                            {!user && (
                                <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer">Sign In</Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ExploreClient circles={circles} />
            </main>
        </div>
    );
}
