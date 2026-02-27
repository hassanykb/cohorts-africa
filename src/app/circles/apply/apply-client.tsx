"use client";

import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { useState, useTransition } from "react";
import { submitApplication } from "@/lib/actions";
import AppNavbar from "@/components/AppNavbar";
import { getDefaultDashboardPath } from "@/lib/roles";

const WORD_LIMIT = 150;
function countWords(t: string) { return t.trim().split(/\s+/).filter(Boolean).length; }

type ApplyUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
};

type ApplyCircle = {
    id: string;
    title: string;
    description: string;
    status: string;
    maxCapacity: number;
    filled: number;
    waitlistCount: number;
    spotsLeft: number;
    User: { name: string } | { name: string }[] | null;
};

export default function ApplyClient({
    user,
    circleId,
    circle,
}: {
    user: ApplyUser;
    circleId: string;
    circle: ApplyCircle;
}) {
    const [intent, setIntent] = useState("");
    const [committed, setCommitted] = useState(false);
    const [submittedStatus, setSubmittedStatus] = useState<"PENDING" | "WAITLIST" | null>(null);
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const wordCount = countWords(intent);
    const isOver = wordCount > WORD_LIMIT;
    const dashboardPath = getDefaultDashboardPath(user.role);
    const submittingToWaitlist = circle.spotsLeft === 0 || circle.status === "ACTIVE";
    const mentorName = Array.isArray(circle.User)
        ? (circle.User[0]?.name ?? "Mentor")
        : (circle.User?.name ?? "Mentor");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        startTransition(async () => {
            try {
                const result = await submitApplication(circleId, user.id, intent);
                setSubmittedStatus(result.status);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Unable to submit your application.");
            }
        });
    }

    if (submittedStatus) {
        const waitlisted = submittedStatus === "WAITLIST";
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl ${waitlisted ? "bg-amber-100" : "bg-emerald-100"}`}>
                        {waitlisted ? "⏳" : "✅"}
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
                        {waitlisted ? "Added to Waitlist" : "Application Submitted!"}
                    </h1>
                    <p className="text-slate-500 mb-6">
                        {waitlisted
                            ? "This circle is currently full. You are now on the waitlist and will be notified if a spot opens."
                            : "Your application is now PENDING review. You&apos;ll be notified by email when a decision is made."}
                    </p>
                    <Link href={dashboardPath} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700">
                        Go to My Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <AppNavbar user={user} />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                <Link href="/explore" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Explore
                </Link>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-1">{circle.title}</h2>
                    <p className="text-sm font-semibold text-slate-700">{mentorName}</p>
                    <p className="text-sm text-slate-500">{circle.description}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {circle.filled}/{circle.maxCapacity} spots filled
                        </span>
                        <span>{circle.spotsLeft > 0 ? `${circle.spotsLeft} spots left` : "No spots left"}</span>
                        {circle.waitlistCount > 0 && <span>{circle.waitlistCount} on waitlist</span>}
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                    <h1 className="text-2xl font-extrabold text-slate-900 mb-1">
                        {submittingToWaitlist ? "Join the Waitlist" : "Apply to this Circle"}
                    </h1>
                    <p className="text-slate-500 text-sm mb-6">
                        Answer thoughtfully. {submittingToWaitlist ? "This submission will join the waitlist." : "This is your first impression."}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                In 150 words, describe your career goal and what specific outcome you hope to get from this circle. <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                rows={6}
                                value={intent}
                                onChange={(e) => setIntent(e.target.value)}
                                placeholder="Be specific. Generic answers are the fastest way to get rejected..."
                                className={`block w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 resize-none placeholder-slate-400 ${isOver ? "border-rose-300 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"}`}
                            />
                            <div className="flex justify-between mt-1.5">
                                <p className="text-xs text-slate-400">Aim to be concise and specific.</p>
                                <p className={`text-xs font-semibold ${isOver ? "text-rose-500" : "text-slate-400"}`}>{wordCount} / {WORD_LIMIT} words</p>
                            </div>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" required checked={committed} onChange={e => setCommitted(e.target.checked)} className="mt-0.5 w-4 h-4 accent-indigo-600 flex-shrink-0" />
                            <span className="text-sm text-slate-600 leading-snug">
                                I commit to attending every session. Missing a session without 24-hour notice will reduce my Reputation Score.
                            </span>
                        </label>

                        <button type="submit" disabled={wordCount < 20 || isOver || !committed || isPending}
                            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            {isPending ? "Submitting..." : submittingToWaitlist ? "Join Waitlist" : "Submit Application"}
                        </button>
                        {error && (
                            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                                {error}
                            </p>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
}
