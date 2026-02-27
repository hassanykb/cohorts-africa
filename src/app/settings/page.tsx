import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";
import SettingsClient from "./settings-client";
import Link from "next/link";
import { Globe2 } from "lucide-react";
import ProfileMenu from "@/components/ProfileMenu";

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
                    <Link href="/" className="font-bold text-xl flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                            <Globe2 className="w-5 h-5 text-white" />
                        </div>
                        Cohorts.Africa
                    </Link>
                    <ProfileMenu name={user.name} email={user.email} initials={initials(user.name)} role={user.role} />
                </div>
            </nav>
            <SettingsClient user={user} />
        </div>
    );
}
