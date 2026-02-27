"use client";

import Link from "next/link";
import { Globe2, ArrowLeft, Users, Clock, MapPin } from "lucide-react";
import { useState, useTransition } from "react";
import { submitApplication } from "@/lib/actions";

const WORD_LIMIT = 150;
function countWords(t: string) { return t.trim().split(/\s+/).filter(Boolean).length; }

// In production, circleId would come from URL params
const CIRCLE_ID = "demo-circle-id";

export default function ApplyClient({ userId }: { userId: string }) {
    const [intent, setIntent] = useState("");
    const [committed, setCommitted] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isPending, startTransition] = useTransition();
    const wordCount = countWords(intent);
    const isOver = wordCount > WORD_LIMIT;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        startTransition(async () => {
            await submitApplication(CIRCLE_ID, userId, intent);
            setSubmitted(true);
        });
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✅</div>
                    <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Application Submitted!</h1>
                    <p className="text-slate-500 mb-6">Your application is now <strong>PENDING</strong> review. You'll be notified by email when a decision is made.</p>
                    <Link href="/dashboard/mentee" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700">
                        Go to My Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
                    <Link href="/" className="font-bold text-xl flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center"><Globe2 className="w-5 h-5 text-white" /></div>
                        Cohorts Network
                    </Link>
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm shadow-sm">
                        {userId.slice(0, 2).toUpperCase()}
                    </div>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                <Link href="/explore" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Explore
                </Link>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-1">Transitioning from Audit to Tech Product Management</h2>
                    <p className="text-sm font-semibold text-slate-700">David Osei</p>
                    <p className="text-sm text-slate-500">VP of Product, FinTech Africa</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> London, UK</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 3 spots left</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 4 weeks</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                    <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Apply to this Circle</h1>
                    <p className="text-slate-500 text-sm mb-6">Answer the mentor's question thoughtfully — this is your only chance to make a first impression.</p>

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
                            {isPending ? "Submitting..." : "Submit Application"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
