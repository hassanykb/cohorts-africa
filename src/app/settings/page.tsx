import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";
import SettingsClient from "@/app/settings/settings-client";
import AppNavbar from "@/components/AppNavbar";

export default async function SettingsPage() {
    const user = await getUser();
    if (!user) redirect("/login");

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <AppNavbar user={user} />
            <SettingsClient user={user} />
        </div>
    );
}
