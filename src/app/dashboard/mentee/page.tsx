import Link from "next/link";
import { redirect } from "next/navigation";
import {
    AlertCircle,
    ArrowRight,
    Clock,
    Inbox,
    Linkedin,
    ShieldCheck,
    Users,
} from "lucide-react";
import { getUser } from "@/lib/get-user";
import {
    acceptPitch,
    closeCircleApplications,
    declinePitch,
    getApplicationsByMentee,
    getCirclesByCreator,
    getCirclesByMentor,
    getDraftCirclesByCreator,
    getPitchRequestsForMentor,
    reopenCircleApplications,
} from "@/lib/actions";
import AppNavbar from "@/components/AppNavbar";

function initials(name?: string | null) {
    if (!name) return "ME";
    return name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function scoreColor(score: number) {
    if (score >= 80) {
        return {
            badge: "bg-emerald-100 text-emerald-700",
            bar: "bg-emerald-500",
            label: "Excellent standing — elite circles unlocked!",
        };
    }
    if (score >= 60) {
        return {
            badge: "bg-amber-100 text-amber-700",
            bar: "bg-amber-500",
            label: "Good standing — keep attending sessions.",
        };
    }
    return {
        badge: "bg-rose-100 text-rose-700",
        bar: "bg-rose-500",
        label: "Low score — missed sessions restrict elite access.",
    };
}

function statusPillClass(status: string) {
    if (status === "ACTIVE") return "bg-emerald-100 text-emerald-800";
    if (status === "OPEN") return "bg-indigo-100 text-indigo-800";
    if (status === "PROPOSED") return "bg-amber-100 text-amber-800";
    if (status === "DRAFT") return "bg-slate-100 text-slate-600";
    return "bg-slate-100 text-slate-600";
}

export default async function MenteeDashboard() {
    const user = await getUser();
    if (!user) redirect("/login");

    const [applicationsResult, draftsResult, mentorCirclesResult, creatorCirclesResult, pitchesResult] = await Promise.allSettled([
        getApplicationsByMentee(user.id),
        getDraftCirclesByCreator(user.id),
        getCirclesByMentor(user.id),
        getCirclesByCreator(user.id),
        getPitchRequestsForMentor(user.id),
    ]);

    if (applicationsResult.status === "rejected") {
        console.error("Mentee dashboard: failed to load applications", applicationsResult.reason);
    }
    if (draftsResult.status === "rejected") {
        console.error("Mentee dashboard: failed to load drafts", draftsResult.reason);
    }
    if (mentorCirclesResult.status === "rejected") {
        console.error("Mentee dashboard: failed to load mentor circles", mentorCirclesResult.reason);
    }
    if (creatorCirclesResult.status === "rejected") {
        console.error("Mentee dashboard: failed to load creator circles", creatorCirclesResult.reason);
    }
    if (pitchesResult.status === "rejected") {
        console.error("Mentee dashboard: failed to load pitch requests", pitchesResult.reason);
    }

    const applications = applicationsResult.status === "fulfilled" ? applicationsResult.value : [];
    const drafts = draftsResult.status === "fulfilled" ? draftsResult.value : [];
    const mentorCircles = mentorCirclesResult.status === "fulfilled" ? mentorCirclesResult.value : [];
    const creatorCircles = creatorCirclesResult.status === "fulfilled" ? creatorCirclesResult.value : [];
    const pitches = pitchesResult.status === "fulfilled" ? pitchesResult.value : [];

    const activeMemberships = applications.filter((a: Record<string, unknown>) => a.status === "ACCEPTED");
    const waitlisted = applications.filter((a: Record<string, unknown>) => a.status === "WAITLIST");
    const pending = applications.filter((a: Record<string, unknown>) => a.status === "PENDING" || a.status === "REJECTED");

    const managedCircleMap = new Map<string, Record<string, unknown>>();
    [...mentorCircles, ...creatorCircles].forEach((circle) => {
        const key = String(circle.id ?? "");
        if (!key) return;
        if (!managedCircleMap.has(key)) managedCircleMap.set(key, circle as Record<string, unknown>);
    });

    const managedCircles = Array.from(managedCircleMap.values()).sort((a, b) => {
        const aTime = new Date(String(a.updatedAt ?? a.createdAt ?? 0)).getTime();
        const bTime = new Date(String(b.updatedAt ?? b.createdAt ?? 0)).getTime();
        return bTime - aTime;
    });

    const score = scoreColor(user.reputationScore);
    const firstName = user.name?.split(" ")[0] ?? "there";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <AppNavbar user={user} active="dashboard" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Welcome, {firstName} 👋</h1>
                        <p className="text-slate-500 mt-1">Manage circles, track applications, and jump into sessions faster.</p>
                    </div>
                </div>

                <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Managed Circles</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">{managedCircles.length}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Active Memberships</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">{activeMemberships.length}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Application Inbox</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">{pending.length + waitlisted.length}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Incoming Pitches</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">{pitches.length}</p>
                    </div>
                </section>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-slate-900">Circles You Manage</h2>
                                <Link href="/pitch" className="text-sm text-indigo-600 hover:underline font-medium flex items-center gap-1">
                                    Start circle <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            {managedCircles.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-sm">
                                    You are not managing any circles yet.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {managedCircles.map((circle: Record<string, unknown>) => {
                                        const applicationsForCircle = (circle.Application as Array<{ status?: string }>) ?? [];
                                        const filledApps = applicationsForCircle.filter((app) => app.status === "PENDING" || app.status === "ACCEPTED").length;
                                        const waitlistedApps = applicationsForCircle.filter((app) => app.status === "WAITLIST").length;
                                        const status = String(circle.status ?? "UNKNOWN");
                                        const maxCapacity = Number(circle.maxCapacity ?? 0);
                                        const durationWeeks = Number(circle.durationWeeks ?? 4);
                                        const isMentorForCircle = circle.mentorId === user.id;
                                        const isOrganizerForCircle = circle.creatorId === user.id;
                                        const canReopen = status === "ACTIVE" && filledApps < maxCapacity;
                                        const needsDualApproval = Boolean(circle.mentorId) && circle.creatorId !== circle.mentorId;

                                        return (
                                            <div key={circle.id as string} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${statusPillClass(status)}`}>
                                                            {status}
                                                        </span>
                                                        <h3 className="text-base font-semibold text-slate-900 truncate">{circle.title as string}</h3>
                                                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-3.5 h-3.5" />
                                                                {filledApps}/{maxCapacity} filled
                                                            </span>
                                                            {waitlistedApps > 0 && <span>{waitlistedApps} waitlisted</span>}
                                                            <span>{durationWeeks} weeks</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {isOrganizerForCircle && (
                                                                <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                                                    Organizer
                                                                </span>
                                                            )}
                                                            {isMentorForCircle && (
                                                                <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                                                    Mentor
                                                                </span>
                                                            )}
                                                        </div>
                                                        {needsDualApproval && (
                                                            <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 inline-block">
                                                                Capacity/duration changes need organizer + mentor approval.
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2">
                                                        <Link
                                                            href={`/circles/${circle.id as string}`}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                                                        >
                                                            Open Room
                                                        </Link>

                                                        {isMentorForCircle && status === "OPEN" && (
                                                            <form>
                                                                <button
                                                                    formAction={async () => { "use server"; await closeCircleApplications(circle.id as string, user.id); }}
                                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50"
                                                                >
                                                                    Close Apps
                                                                </button>
                                                            </form>
                                                        )}

                                                        {isMentorForCircle && status === "ACTIVE" && (
                                                            <form>
                                                                <button
                                                                    disabled={!canReopen}
                                                                    formAction={async () => { "use server"; await reopenCircleApplications(circle.id as string, user.id); }}
                                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                                                >
                                                                    Reopen Apps
                                                                </button>
                                                            </form>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-slate-900">My Active Circles</h2>
                                <Link href="/explore" className="text-sm text-indigo-600 hover:underline font-medium flex items-center gap-1">
                                    Find more <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            {activeMemberships.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                                    <p className="text-slate-400 text-sm mb-3">You&apos;re not in any circles yet.</p>
                                    <Link href="/explore" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700">
                                        Explore Circles →
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeMemberships.map((app: Record<string, unknown>) => {
                                        const circle = app.Circle as Record<string, unknown> | null;
                                        const circleId = typeof circle?.id === "string" ? circle.id : null;
                                        return (
                                            <div key={app.id as string} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mb-2">
                                                            ACTIVE
                                                        </span>
                                                        <h3 className="text-base font-semibold text-slate-900">{circle?.title as string ?? "Circle"}</h3>
                                                    </div>
                                                    {circleId && (
                                                        <Link
                                                            href={`/circles/${circleId}`}
                                                            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                        >
                                                            <ArrowRight className="w-4 h-4" />
                                                        </Link>
                                                    )}
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
                    </div>

                    <aside className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-lg">
                                    {initials(user.name)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{user.name}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Reputation Score
                                    </p>
                                    <span className="text-lg font-extrabold text-slate-900">{user.reputationScore}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div className={`h-2 rounded-full transition-all ${score.bar}`} style={{ width: `${user.reputationScore}%` }} />
                                </div>
                                <p className="text-xs text-slate-500 mt-1.5 mb-3">{score.label}</p>

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

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <Inbox className="w-4 h-4 text-amber-600" /> Incoming Pitches
                            </h3>
                            {pitches.length === 0 ? (
                                <p className="text-sm text-slate-400">No pitch requests yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {pitches.map((pitch: Record<string, unknown>) => {
                                        const creator = pitch.User as { name: string; email: string } | null;
                                        return (
                                            <div key={pitch.id as string} className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                                                <p className="text-sm font-semibold text-slate-900">{pitch.title as string}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">By {creator?.name ?? "a member"}</p>
                                                <form className="mt-2 flex gap-2">
                                                    <button
                                                        formAction={async () => { "use server"; await acceptPitch(pitch.id as string, user.id); }}
                                                        className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        formAction={async () => { "use server"; await declinePitch(pitch.id as string); }}
                                                        className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                                                    >
                                                        Decline
                                                    </button>
                                                </form>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">My Draft Circles</h3>
                            {drafts.length === 0 ? (
                                <p className="text-sm text-slate-400">
                                    No drafts yet. Start one from{" "}
                                    <Link href="/pitch" className="text-indigo-600 hover:underline">Pitch</Link>.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {drafts.map((draft: Record<string, unknown>) => (
                                        <div key={draft.id as string} className="rounded-xl border border-slate-200 p-3">
                                            <p className="text-sm font-semibold text-slate-800">{draft.title as string}</p>
                                            <p className="text-xs text-slate-500">
                                                Updated · {new Date(draft.updatedAt as string).toLocaleDateString()}
                                            </p>
                                            <Link
                                                href={`/circles/${draft.id as string}`}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 mt-2"
                                            >
                                                Open Draft <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Application Inbox</h3>
                            {pending.length === 0 && waitlisted.length === 0 ? (
                                <p className="text-sm text-slate-400">No pending or waitlisted applications.</p>
                            ) : (
                                <div className="space-y-4">
                                    {pending.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending / Rejected</p>
                                            {pending.map((app: Record<string, unknown>) => {
                                                const circle = app.Circle as Record<string, unknown> | null;
                                                const status = app.status as string;
                                                return (
                                                    <div key={app.id as string} className="rounded-xl border border-slate-200 p-3">
                                                        <p className="text-sm font-semibold text-slate-800">{circle?.title as string ?? "Circle"}</p>
                                                        <div className="mt-1 flex items-center justify-between text-xs">
                                                            <span className="text-slate-500">Applied · {new Date(app.createdAt as string).toLocaleDateString()}</span>
                                                            <span className={`font-bold px-2 py-0.5 rounded-full ${status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                                                                {status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {waitlisted.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Waitlist</p>
                                            {waitlisted.map((app: Record<string, unknown>) => {
                                                const circle = app.Circle as Record<string, unknown> | null;
                                                return (
                                                    <div key={app.id as string} className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                                                        <p className="text-sm font-semibold text-slate-800">{circle?.title as string ?? "Circle"}</p>
                                                        <div className="mt-1 flex items-center justify-between text-xs">
                                                            <span className="text-slate-500">Waitlisted · {new Date(app.createdAt as string).toLocaleDateString()}</span>
                                                            <span className="font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                                                WAITLIST
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
