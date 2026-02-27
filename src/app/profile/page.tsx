import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Award, ExternalLink } from "lucide-react";
import { getDefaultDashboardPath } from "@/lib/roles";
import AppNavbar from "@/components/AppNavbar";

function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default async function ProfilePage() {
    const user = await getUser();
    if (!user) redirect("/login");

    const scoreColor =
        user.reputationScore >= 80 ? "text-emerald-600 bg-emerald-100"
            : user.reputationScore >= 60 ? "text-amber-600 bg-amber-100"
                : "text-rose-600 bg-rose-100";

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <AppNavbar user={user} />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                <Link href={getDefaultDashboardPath(user.role)} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Cover / gradient header */}
                    <div className="h-28 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800" />

                    {/* Avatar + info */}
                    <div className="px-6 pb-6">
                        <div className="-mt-12 mb-4 flex items-end justify-between">
                            <div className="w-20 h-20 rounded-full bg-indigo-600 border-4 border-white shadow-md flex items-center justify-center font-bold text-white text-2xl">
                                {initials(user.name)}
                            </div>
                            <Link href="/settings" className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                                Edit Profile
                            </Link>
                        </div>

                        <h1 className="text-2xl font-extrabold text-slate-900">{user.name}</h1>

                        <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${scoreColor}`}>
                                <Award className="w-3.5 h-3.5 mr-1" /> {user.reputationScore} pts
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                {user.role}
                            </span>
                        </div>

                        <div className="mt-4 space-y-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                <span>{user.email}</span>
                            </div>
                            {user.linkedinUrl && (
                                <div className="flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate">
                                        {user.linkedinUrl.replace("https://", "")}
                                    </a>
                                </div>
                            )}
                        </div>

                        {user.bio ? (
                            <p className="mt-4 text-sm text-slate-600 leading-relaxed">{user.bio}</p>
                        ) : (
                            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 text-center">
                                No bio yet — <Link href="/settings" className="text-indigo-500 hover:underline">add one in Settings</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Score breakdown */}
                <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Reputation Score</h2>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Current score</span>
                        <span className="text-xl font-extrabold text-slate-900">{user.reputationScore} / 100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all ${user.reputationScore >= 80 ? "bg-emerald-500" : user.reputationScore >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                            style={{ width: `${user.reputationScore}%` }}
                        />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
                        <div className={`p-2 rounded-lg ${user.reputationScore < 60 ? "bg-rose-50 text-rose-600 font-semibold" : ""}`}>0–59<br />Restricted</div>
                        <div className={`p-2 rounded-lg ${user.reputationScore >= 60 && user.reputationScore < 80 ? "bg-amber-50 text-amber-600 font-semibold" : ""}`}>60–79<br />Good</div>
                        <div className={`p-2 rounded-lg ${user.reputationScore >= 80 ? "bg-emerald-50 text-emerald-600 font-semibold" : ""}`}>80–100<br />Elite ✦</div>
                    </div>
                </div>
            </main>
        </div>
    );
}
