"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import ProfileMenu from "@/components/ProfileMenu";
import { getDefaultDashboardPath } from "@/lib/roles";

type NavUser = {
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
};

type Props = {
    user?: NavUser | null;
    active?: "dashboard" | "explore" | "none";
};

function initials(name?: string | null) {
    if (!name) return "ME";
    return name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function linkClass(isActive: boolean) {
    return isActive ? "text-indigo-600" : "text-slate-600 hover:text-indigo-600 transition-colors";
}

export default function AppNavbar({ user, active = "none" }: Props) {
    const role = user?.role;
    const dashboardPath = getDefaultDashboardPath(role);

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
                <BrandLogo role={role} />
                <div className="flex items-center gap-6">
                    {user && (
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <Link href="/explore" className={linkClass(active === "explore")}>Explore</Link>
                            <Link href={dashboardPath} className={linkClass(active === "dashboard")}>Dashboard</Link>
                        </div>
                    )}
                    {user ? (
                        <ProfileMenu
                            name={user.name}
                            email={user.email}
                            initials={initials(user.name)}
                            role={user.role}
                            avatarUrl={user.avatarUrl}
                        />
                    ) : (
                        <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer">Sign In</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
