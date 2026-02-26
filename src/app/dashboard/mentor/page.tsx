"use client";

import Link from "next/link";
import {
    Users,
    PlusCircle,
    Clock,
    CheckCircle,
    ShieldCheck,
    Globe2,
    ArrowRight,
    BarChart2,
} from "lucide-react";

const MOCK_MY_CIRCLES = [
    {
        id: 1,
        title: "Transitioning from Audit to Tech PM",
        status: "ACTIVE",
        mentees: 8,
        maxCapacity: 10,
        nextSession: "Thu, 27 Feb · 6:00 PM GMT",
    },
    {
        id: 2,
        title: "Navigating Corporate Finance in Accra",
        status: "COMPLETED",
        mentees: 10,
        maxCapacity: 10,
        nextSession: null,
    },
];

const MOCK_PITCH_REQUESTS = [
    {
        id: 3,
        title: "Building Resilient Healthcare Startups",
        groupSize: 7,
        pitchedBy: "Kofi Mensah + 6 others",
        createdAt: "2 days ago",
    },
];

const STATS = [
    { label: "Total Mentees Impacted", value: "18", icon: Users, color: "bg-indigo-100 text-indigo-600" },
    { label: "Sessions Hosted", value: "12", icon: Clock, color: "bg-emerald-100 text-emerald-600" },
    { label: "Circles Completed", value: "1", icon: CheckCircle, color: "bg-amber-100 text-amber-600" },
    { label: "Avg. Cohort Rating", value: "4.9 ★", icon: BarChart2, color: "bg-purple-100 text-purple-600" },
];

export default function MentorDashboard() {
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
                            <Link href="/dashboard/mentor" className="text-indigo-600">My Dashboard</Link>
                            <Link href="/explore" className="text-slate-600 hover:text-indigo-600 transition-colors">Explore Circles</Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span className="font-semibold text-slate-700">Mentor · Verified</span>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-sm border-2 border-white shadow-sm">
                                DO
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900">Welcome back, David 👋</h1>
                    <p className="text-slate-500 mt-1">Here's your mentorship impact overview.</p>
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
                            <Link
                                href="/dashboard/mentor/create"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors"
                            >
                                <PlusCircle className="w-4 h-4" />
                                New Circle
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {MOCK_MY_CIRCLES.map((circle) => (
                                <div key={circle.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${circle.status === "ACTIVE"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : "bg-slate-100 text-slate-500"
                                            }`}>
                                            {circle.status}
                                        </span>
                                        <h3 className="text-base font-semibold text-slate-900 mb-1">{circle.title}</h3>
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5" />
                                                {circle.mentees}/{circle.maxCapacity} mentees
                                            </span>
                                            {circle.nextSession && (
                                                <>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {circle.nextSession}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors ml-4 flex-shrink-0">
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pitch Requests */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Pitch Requests</h2>
                        {MOCK_PITCH_REQUESTS.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-sm">
                                No pitch requests yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {MOCK_PITCH_REQUESTS.map((pitch) => (
                                    <div key={pitch.id} className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mb-3">
                                            Pitch Awaiting Response
                                        </span>
                                        <h3 className="text-base font-semibold text-slate-900 mb-1">{pitch.title}</h3>
                                        <p className="text-sm text-slate-500 mb-4">
                                            Proposed by <span className="font-medium text-slate-700">{pitch.pitchedBy}</span> — {pitch.createdAt}
                                        </p>
                                        <div className="flex gap-2">
                                            <button className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
                                                Accept
                                            </button>
                                            <button className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
