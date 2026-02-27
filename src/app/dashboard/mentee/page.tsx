import Link from "next/link";
import { redirect } from "next/navigation";
import {
    Globe2, ShieldCheck, BookOpen, Clock, CheckCircle,
    AlertCircle, ArrowRight, PlusCircle, Trophy,
} from "lucide-react";
import { getUser } from "@/lib/get-user";
import { getApplicationsByMentee } from "@/lib/actions";
import ProfileMenu from "@/components/ProfileMenu";
import BrandLogo from "@/components/BrandLogo";

function initials(name?: string | null) {
    if (!name) return "ME";
    return name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function scoreColor(score: number) {
    if (score >= 80) return { badge: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500", label: "Excellent standing — elite circles unlocked!" };
    if (score >= 60) return { badge: "bg-amber-100 text-amber-700", bar: "bg-amber-500", label: "Good standing — keep attending sessions." };
    return { badge: "bg-rose-100 text-rose-700", bar: "bg-rose-500", label: "Low score — missed sessions restrict elite access." };
}

export default async function MenteeDashboard() {
    const user = await getUser();
    if (!user) redirect("/login");

    const applications = await getApplicationsByMentee(user.id);
    const active = applications.filter((a: Record<string, unknown>) => a.status === "ACCEPTED");
    const pending = applications.filter((a: Record<string, unknown>) => a.status === "PENDING" || a.status === "REJECTED");
    const score = scoreColor(user.reputationScore);
    const firstName = user.name?.split(" ")[0] ?? "there";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Nav */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <BrandLogo role={user.role} />
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <Link href="/dashboard/mentee" className="text-indigo-600">My Dashboard</Link>
                            <Link href="/explore" className="text-slate-600 hover:text-indigo-600 transition-colors">Explore</Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${score.badge}`}>
                                <ShieldCheck className="w-4 h-4" />
                                {user.reputationScore} pts
                            </div>
                            <ProfileMenu
                                name={user.name}
                                email={user.email}
                                initials={initials(user.name)}
                                role={user.role}
                                avatarUrl={user?.avatarUrl}
                            />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome + Reputation */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Welcome, {firstName} 👋</h1>
                        <p className="text-slate-500 mt-1">Your active circles and applications at a glance.</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 min-w-[200px]">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                <Trophy className="w-3.5 h-3.5 text-amber-500" /> Reputation Score
                            </p>
                            <span className="text-lg font-extrabold text-slate-900">{user.reputationScore}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all ${score.bar}`} style={{ width: `${user.reputationScore}%` }} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5">{score.label}</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Active Circles */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-slate-900">Active Circles</h2>
                                <Link href="/explore" className="text-sm text-indigo-600 hover:underline font-medium flex items-center gap-1">
                                    Find more <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            {active.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                                    <p className="text-slate-400 text-sm mb-3">You're not in any circles yet.</p>
                                    <Link href="/explore" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700">
                                        Explore Circles →
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {active.map((app: Record<string, unknown>) => {
                                        const circle = app.Circle as Record<string, unknown> | null;
                                        return (
                                            <div key={app.id as string} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mb-2">ACTIVE</span>
                                                        <h3 className="text-base font-semibold text-slate-900">{circle?.title as string ?? "Circle"}</h3>
                                                    </div>
                                                    <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>In progress</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* My Applications */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">My Applications</h2>
                            {pending.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-sm">
                                    No pending applications. <Link href="/explore" className="text-indigo-600 font-medium hover:underline">Apply to a circle →</Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pending.map((app: Record<string, unknown>) => {
                                        const circle = app.Circle as Record<string, unknown> | null;
                                        const status = app.status as string;
                                        return (
                                            <div key={app.id as string} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${status === "PENDING" ? "bg-amber-100" : "bg-rose-100"}`}>
                                                        {status === "PENDING"
                                                            ? <Clock className="w-4 h-4 text-amber-600" />
                                                            : <AlertCircle className="w-4 h-4 text-rose-600" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">{circle?.title as string ?? "Circle"}</p>
                                                        <p className="text-xs text-slate-500">Applied · {new Date(app.createdAt as string).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                                                    {status}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">
                        {/* Profile card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-lg">
                                    {initials(user.name)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{user.name}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                            </div>
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${score.badge}`}>
                                <ShieldCheck className="w-3.5 h-3.5" />
                                {user.reputationScore} Reputation Points
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <Link href="/explore" className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors group">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200">
                                        <BookOpen className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">Browse Open Circles</span>
                                </Link>
                                <Link href="/pitch" className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 transition-colors group">
                                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200">
                                        <PlusCircle className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-amber-700">Pitch a Custom Circle</span>
                                </Link>
                            </div>
                        </div>

                        {/* Completed Circles */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Your Alumni Circles</h3>
                            <div className="text-center text-slate-400 text-sm py-4">
                                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                                Complete a circle to earn your first badge.
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
