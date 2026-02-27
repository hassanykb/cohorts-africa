import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";
import SettingsClient from "@/app/settings/settings-client";
import Link from "next/link";
import { Globe2 } from "lucide-react";
import ProfileMenu from "@/components/ProfileMenu";
import BrandLogo from "@/components/BrandLogo";

function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default async function SettingsPage() {
    const user = await getUser();
    if (!user) redirect("/login");

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
                    <BrandLogo role={user.role} />
                    <ProfileMenu name={user.name} email={user.email} initials={initials(user.name)} role={user.role} avatarUrl={user.avatarUrl} />
                </div>
            </nav>
            <SettingsClient user={user} />
        </div>
    );
}
