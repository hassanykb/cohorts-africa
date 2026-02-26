"use client";

import Link from "next/link";
import {
    Globe2, ShieldCheck, BookOpen, Clock, CheckCircle,
    AlertCircle, ArrowRight, PlusCircle, Trophy,
} from "lucide-react";

const MOCK_ACTIVE = [
    {
        id: 1,
        title: "Transitioning from Audit to Tech PM",
        mentor: "David Osei · VP Product, FinTech Africa",
        nextSession: "Thu, 27 Feb · 6:00 PM GMT",
        progress: 2,
        totalWeeks: 4,
    },
];

const MOCK_APPLICATIONS = [
    {
        id: 2,
        title: "Scaling Backend Systems for Millions of Users",
        mentor: "Amina Lawal · Engineering Manager",
        status: "PENDING",
        appliedAt: "2 days ago",
    },
    {
        id: 3,
        title: "Navigating Corporate Finance",
        mentor: "Kwame Asante · CFO, PanAfrican Bank",
        status: "REJECTED",
        appliedAt: "5 days ago",
    },
];

const MOCK_ALUMNI = [
    {
        id: 4,
        title: "LinkedIn Profile Masterclass",
        mentor: "Serena Adu",
        completedAt: "Jan 2026",
    },
];

const reputationScore = 85;

export default function MenteeDashboard() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Nav */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                                <Globe2 className="w-5 h-5 text-white" />
                            </div>
                            Cohorts.Africa
                        </Link>
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <Link href="/dashboard/mentee" className="text-indigo-600">My Dashboard</Link>
                            <Link href="/explore" className="text-slate-600 hover:text-indigo-600 transition-colors">Explore Circles</Link>
                            <Link href="/pitch" className="text-slate-600 hover:text-indigo-600 transition-colors">Pitch a Circle</Link>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Reputation Score badge */}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${reputationScore >= 80
                                    ? "bg-emerald-100 text-emerald-700"
                                    : reputationScore >= 60
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-rose-100 text-rose-700"
                                }`}>
                                <ShieldCheck className="w-4 h-4" />
                                {reputationScore} pts
                            </div>
                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm border-2 border-white shadow-sm">
                                KM
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome + Reputation meter */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Welcome, Kwame 👋</h1>
                        <p className="text-slate-500 mt-1">Your active circles and applications at a glance.</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 min-w-[200px]">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                <Trophy className="w-3.5 h-3.5 text-amber-500" /> Reputation Score
                            </p>
                            <span className="text-lg font-extrabold text-slate-900">{reputationScore}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all ${reputationScore >= 80 ? "bg-emerald-500" : reputationScore >= 60 ? "bg-amber-500" : "bg-rose-500"
                                    }`}
                                style={{ width: `${reputationScore}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5">
                            {reputationScore >= 80
                                ? "Excellent standing — elite circles unlocked!"
                                : reputationScore >= 60
                                    ? "Good standing — keep attending sessions."
                                    : "Low score — missed sessions restrict elite access."}
                        </p>
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
                            {MOCK_ACTIVE.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400 text-sm">
                                    You're not in any circles yet. <Link href="/explore" className="text-indigo-600 font-medium hover:underline">Explore now →</Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {MOCK_ACTIVE.map((circle) => (
                                        <div key={circle.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mb-2">
                                                        ACTIVE
                                                    </span>
                                                    <h3 className="text-base font-semibold text-slate-900">{circle.title}</h3>
                                                    <p className="text-sm text-slate-500">{circle.mentor}</p>
                                                </div>
                                                <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="mt-3">
                                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                    <span>Week {circle.progress} of {circle.totalWeeks}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {circle.nextSession}</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                    <div
                                                        className="h-1.5 rounded-full bg-indigo-500 transition-all"
                                                        style={{ width: `${(circle.progress / circle.totalWeeks) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* My Applications */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">My Applications</h2>
                            <div className="space-y-3">
                                {MOCK_APPLICATIONS.map((app) => (
                                    <div key={app.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${app.status === "PENDING" ? "bg-amber-100" : "bg-rose-100"
                                                }`}>
                                                {app.status === "PENDING"
                                                    ? <Clock className="w-4 h-4 text-amber-600" />
                                                    : <AlertCircle className="w-4 h-4 text-rose-600" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{app.title}</p>
                                                <p className="text-xs text-slate-500">{app.mentor} · Applied {app.appliedAt}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${app.status === "PENDING"
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-rose-100 text-rose-700"
                                            }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">
                        {/* Quick actions */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <Link href="/explore" className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors group">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                                        <BookOpen className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">Browse Open Circles</span>
                                </Link>
                                <Link href="/pitch" className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 transition-colors group">
                                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                                        <PlusCircle className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-amber-700">Pitch a Custom Circle</span>
                                </Link>
                            </div>
                        </div>

                        {/* Completed Circles Alumni */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Your Alumni Circles</h3>
                            {MOCK_ALUMNI.map((a) => (
                                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{a.title}</p>
                                        <p className="text-xs text-slate-400">with {a.mentor} · {a.completedAt}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
