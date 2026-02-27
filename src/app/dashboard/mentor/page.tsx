import Link from "next/link";
import { redirect } from "next/navigation";
import {
    Users, PlusCircle, Clock, CheckCircle,
    ArrowRight, BarChart2, Inbox,
    Linkedin,
} from "lucide-react";
import { getUser } from "@/lib/get-user";
import { getCirclesByMentor, getPitchRequestsForMentor, acceptPitch, closeCircleApplications, declinePitch, reopenCircleApplications } from "@/lib/actions";
import { isMentorRole } from "@/lib/roles";
import AppNavbar from "@/components/AppNavbar";

export default async function MentorDashboard() {
    const user = await getUser();
    if (!user) redirect("/login");
    if (!isMentorRole(user.role)) redirect("/dashboard/mentee");

    const [circles, pitches] = await Promise.all([
        getCirclesByMentor(user.id),
        getPitchRequestsForMentor(),
    ]);

    const active = circles.filter((c: Record<string, unknown>) => c.status === "ACTIVE" || c.status === "OPEN");
    const completed = circles.filter((c: Record<string, unknown>) => c.status === "COMPLETED");
    const totalMentees = circles.reduce((sum: number, c: Record<string, unknown>) => sum + ((c.Application as unknown[])?.length ?? 0), 0);
    const firstName = user.name?.split(" ")[0] ?? "there";

    const STATS = [
        { label: "Active Circles", value: String(active.length), icon: Users, color: "bg-indigo-100 text-indigo-600" },
        { label: "Total Mentees", value: String(totalMentees), icon: Users, color: "bg-emerald-100 text-emerald-600" },
        { label: "Completed Circles", value: String(completed.length), icon: CheckCircle, color: "bg-amber-100 text-amber-600" },
        { label: "Pitch Requests", value: String(pitches.length), icon: Inbox, color: "bg-purple-100 text-purple-600" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <AppNavbar user={user} active="dashboard" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Welcome, {firstName} 👋</h1>
                        <p className="text-slate-500 mt-1">Here&apos;s your mentorship impact overview.</p>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=https://cohortsnetwork.com&summary=I am mentoring the next generation of African talent on Cohorts Network! 🌍 join me as a mentor or mentee.`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-full text-sm font-bold hover:bg-[#006097] transition-colors cursor-pointer"
                        >
                            <Linkedin className="w-4 h-4" /> Share Impact
                        </a>
                        <a
                            href={`https://twitter.com/intent/tweet?text=I am mentoring the next generation of African talent on Cohorts Network! 🌍 join me at https://cohortsnetwork.com`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.134l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> Tweet
                        </a>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {STATS.map((s) => (
                        <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                                <s.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                                <p className="text-xs text-slate-500 leading-tight mt-0.5">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* My Circles */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900">My Circles</h2>
                            <Link href="/dashboard/mentor/create"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors">
                                <PlusCircle className="w-4 h-4" /> New Circle
                            </Link>
                        </div>

                        {circles.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400 text-sm">
                                No circles yet. <Link href="/dashboard/mentor/create" className="text-indigo-600 font-medium hover:underline">Create your first →</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {circles.map((circle: Record<string, unknown>) => {
                                    const applications = (circle.Application as Array<{ status?: string }>) ?? [];
                                    const filledApps = applications.filter((app) => app.status === "PENDING" || app.status === "ACCEPTED").length;
                                    const waitlistedApps = applications.filter((app) => app.status === "WAITLIST").length;
                                    const status = circle.status as string;
                                    const statusLabel = status;
                                    const maxCapacity = circle.maxCapacity as number;
                                    const canReopen = status === "ACTIVE" && filledApps < maxCapacity;
                                    return (
                                        <div key={circle.id as string} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow">
                                            <div className="flex-1 min-w-0">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${status === "ACTIVE" ? "bg-emerald-100 text-emerald-800"
                                                    : status === "OPEN" ? "bg-indigo-100 text-indigo-800"
                                                        : "bg-slate-100 text-slate-500"
                                                    }`}>
                                                    {statusLabel}
                                                </span>
                                                <h3 className="text-base font-semibold text-slate-900 mb-1 truncate">{circle.title as string}</h3>
                                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3.5 h-3.5" />
                                                        {filledApps}/{maxCapacity} mentees
                                                    </span>
                                                    {waitlistedApps > 0 && (
                                                        <>
                                                            <span className="text-slate-300">•</span>
                                                            <span>{waitlistedApps} waitlisted</span>
                                                        </>
                                                    )}
                                                    {status === "ACTIVE" && (
                                                        <>
                                                            <span className="text-slate-300">•</span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3.5 h-3.5" /> Active
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-2">
                                                <Link href={`/circles/${circle.id as string}`}
                                                    className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                                {status === "OPEN" && (
                                                    <form>
                                                        <button
                                                            formAction={async () => { "use server"; await closeCircleApplications(circle.id as string, user.id); }}
                                                            className="px-2.5 py-1 text-[11px] font-semibold rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                                                        >
                                                            Close Apps
                                                        </button>
                                                    </form>
                                                )}
                                                {status === "ACTIVE" && (
                                                    <form>
                                                        <button
                                                            disabled={!canReopen}
                                                            formAction={async () => { "use server"; await reopenCircleApplications(circle.id as string, user.id); }}
                                                            className="px-2.5 py-1 text-[11px] font-semibold rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                                        >
                                                            Reopen Apps
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Pitch Requests */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            Pitch Requests
                            {pitches.length > 0 && (
                                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">{pitches.length}</span>
                            )}
                        </h2>
                        {pitches.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-sm">
                                <BarChart2 className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                                No pitch requests yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pitches.map((pitch: Record<string, unknown>) => {
                                    const creator = pitch.User as { name: string; email: string } | null;
                                    return (
                                        <div key={pitch.id as string} className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mb-3">
                                                Pitch Awaiting Response
                                            </span>
                                            <h3 className="text-base font-semibold text-slate-900 mb-1">{pitch.title as string}</h3>
                                            <p className="text-sm text-slate-500 mb-4">
                                                Proposed by <span className="font-medium text-slate-700">{creator?.name ?? "a mentee"}</span>
                                            </p>
                                            <form className="flex gap-2">
                                                <button
                                                    formAction={async () => { "use server"; await acceptPitch(pitch.id as string, user.id); }}
                                                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
                                                    Accept
                                                </button>
                                                <button
                                                    formAction={async () => { "use server"; await declinePitch(pitch.id as string); }}
                                                    className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">
                                                    Decline
                                                </button>
                                            </form>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
