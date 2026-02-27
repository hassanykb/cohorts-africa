import Link from "next/link";
import { redirect } from "next/navigation";
import {
    ShieldCheck, BookOpen, Clock, CheckCircle,
    AlertCircle, ArrowRight, PlusCircle, Trophy,
    Linkedin,
} from "lucide-react";
import { getUser } from "@/lib/get-user";
import { getApplicationsByMentee, getDraftCirclesByCreator } from "@/lib/actions";
import AppNavbar from "@/components/AppNavbar";

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

    const [applicationsResult, draftsResult] = await Promise.allSettled([
        getApplicationsByMentee(user.id),
        getDraftCirclesByCreator(user.id),
    ]);
    if (applicationsResult.status === "rejected") {
        console.error("Mentee dashboard: failed to load applications", applicationsResult.reason);
    }
    if (draftsResult.status === "rejected") {
        console.error("Mentee dashboard: failed to load drafts", draftsResult.reason);
    }

    const applications = applicationsResult.status === "fulfilled" ? applicationsResult.value : [];
    const drafts = draftsResult.status === "fulfilled" ? draftsResult.value : [];

    const active = applications.filter((a: Record<string, unknown>) => a.status === "ACCEPTED");
    const waitlisted = applications.filter((a: Record<string, unknown>) => a.status === "WAITLIST");
    const pending = applications.filter((a: Record<string, unknown>) => a.status === "PENDING" || a.status === "REJECTED");
    const score = scoreColor(user.reputationScore);
    const firstName = user.name?.split(" ")[0] ?? "there";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <AppNavbar user={user} active="dashboard" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome + Reputation */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Welcome, {firstName} 👋</h1>
                        <p className="text-slate-500 mt-1">Your active circles and applications at a glance.</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 min-w-[250px]">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                <Trophy className="w-3.5 h-3.5 text-amber-500" /> Reputation Score
                            </p>
                            <span className="text-lg font-extrabold text-slate-900">{user.reputationScore}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all ${score.bar}`} style={{ width: `${user.reputationScore}%` }} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 mb-3">{score.label}</p>

                        <div className="flex items-center gap-2">
                            <a
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=https://cohortsnetwork.com&summary=I just reached a reputation score of ${user.reputationScore} on Cohorts Network! 🚀`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#0077B5] text-white text-[10px] font-bold hover:bg-[#006097] transition-colors cursor-pointer"
                            >
                                <Linkedin className="w-3 h-3" /> Share
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?text=I just reached a reputation score of ${user.reputationScore} on Cohorts Network! 🚀 join me at https://cohortsnetwork.com`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-black text-white text-[10px] font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.134l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> Tweet
                            </a>
                        </div>
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
                                    <p className="text-slate-400 text-sm mb-3">You&apos;re not in any circles yet.</p>
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
                            <h2 className="text-xl font-bold text-slate-900 mb-4">My Draft Circles</h2>
                            {drafts.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-sm mb-8">
                                    No drafts yet. Start one from <Link href="/pitch" className="text-indigo-600 font-medium hover:underline">Pitch a Custom Circle</Link>.
                                </div>
                            ) : (
                                <div className="space-y-3 mb-8">
                                    {drafts.map((draft: Record<string, unknown>) => (
                                        <div key={draft.id as string} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{draft.title as string}</p>
                                                <p className="text-xs text-slate-500">
                                                    Last updated · {new Date(draft.updatedAt as string).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/circles/${draft.id as string}`}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                                            >
                                                Open Draft <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </section>

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

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">My Waitlist</h2>
                            {waitlisted.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-sm">
                                    You are not waitlisted for any circles.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {waitlisted.map((app: Record<string, unknown>) => {
                                        const circle = app.Circle as Record<string, unknown> | null;
                                        return (
                                            <div key={app.id as string} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-100">
                                                        <Clock className="w-4 h-4 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">{circle?.title as string ?? "Circle"}</p>
                                                        <p className="text-xs text-slate-500">Waitlisted · {new Date(app.createdAt as string).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                                                    WAITLIST
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
