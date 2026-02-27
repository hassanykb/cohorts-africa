"use client";

import { useState } from "react";
import { Search, Clock, Users, ArrowRight, X } from "lucide-react";
import Link from "next/link";

interface Circle {
    id: string;
    title: string;
    description: string;
    status: string;
    maxCapacity: number;
    durationWeeks?: number | null;
    createdAt: string;
    User: { name: string } | null;
}

function initials(name?: string | null) {
    if (!name) return "ME";
    return name.split(" ").filter(Boolean).map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function ExploreClient({ circles: initialCircles }: { circles: Circle[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);

    const filteredCircles = initialCircles.filter((circle) => {
        const matchesSearch =
            circle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            circle.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (circle.User?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter ? circle.status === statusFilter : true;

        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Explore Circles</h1>
                <p className="text-slate-600 mb-6">Find your next cohort, or pitch your own to an executive.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder-slate-400 text-slate-900"
                            placeholder="Search by topic, mentor, or role..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter || ""}
                            onChange={(e) => setStatusFilter(e.target.value || null)}
                            className="inline-flex items-center justify-center px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="OPEN">Open</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PROPOSED">Proposed</option>
                        </select>
                        <Link href="/pitch" className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm whitespace-nowrap">
                            Pitch a Circle
                        </Link>
                    </div>
                </div>
            </div>

            {filteredCircles.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="text-5xl mb-4 text-slate-300">🔍</p>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">No circles found</h2>
                    <p className="text-slate-500 mb-6">Try adjusting your search or filters.</p>
                    <button
                        onClick={() => { setSearchQuery(""); setStatusFilter(null); }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-full font-semibold hover:bg-slate-200 transition-colors"
                    >
                        Clear all filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCircles.map((circle) => {
                        const mentor = circle.User as { name: string } | null;
                        const isOpen = circle.status === "OPEN";
                        const isActive = circle.status === "ACTIVE";
                        const isProposed = circle.status === "PROPOSED";
                        const allowApplication = isOpen || isActive;
                        const ctaHref = allowApplication ? `/circles/apply?circleId=${circle.id}` : null;
                        const ctaLabel = isOpen ? "Apply" : isActive ? "Join Waitlist" : "Awaiting Approval";

                        return (
                            <div key={circle.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden group">
                                <div className={`h-1.5 w-full ${isProposed ? "bg-amber-400" : circle.status === "ACTIVE" ? "bg-emerald-500" : "bg-indigo-500"}`} />
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="mb-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isProposed ? "bg-amber-100 text-amber-800"
                                                : circle.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800"
                                                    : "bg-indigo-100 text-indigo-800"
                                                }`}>
                                                {isProposed ? "Mentee Pitch" : circle.status}
                                            </span>
                                            <span className="text-sm text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {circle.status === "ACTIVE" ? "Waitlist Open" : "Open"}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                                            {circle.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2">{circle.description}</p>
                                        {mentor && (
                                            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                                                <span className="w-4 h-4 rounded-full bg-indigo-100 inline-flex items-center justify-center text-indigo-600 text-xs font-bold">
                                                    {initials(mentor.name)}
                                                </span>
                                                {mentor.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Users className="w-4 h-4" />
                                            <span>{circle.maxCapacity} spots max</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCircle(circle)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                                            >
                                                View Details
                                            </button>
                                            {ctaHref ? (
                                                <Link
                                                    href={ctaHref}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-indigo-600 text-white hover:bg-indigo-700"
                                                >
                                                    {ctaLabel} <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600">
                                                    {ctaLabel}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedCircle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button
                        type="button"
                        onClick={() => setSelectedCircle(null)}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
                        aria-label="Close details"
                    />
                    <div className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
                        <button
                            type="button"
                            onClick={() => setSelectedCircle(null)}
                            className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            aria-label="Close modal"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="pr-8">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${selectedCircle.status === "PROPOSED"
                                ? "bg-amber-100 text-amber-800"
                                : selectedCircle.status === "ACTIVE"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-indigo-100 text-indigo-800"
                                }`}>
                                {selectedCircle.status === "PROPOSED" ? "Mentee Pitch" : selectedCircle.status}
                            </span>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedCircle.title}</h2>
                            <p className="text-sm text-slate-600 leading-relaxed mb-4">{selectedCircle.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs mb-5">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <p className="text-slate-400">Mentor</p>
                                <p className="font-semibold text-slate-800">{selectedCircle.User?.name ?? "Pending assignment"}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <p className="text-slate-400">Capacity</p>
                                <p className="font-semibold text-slate-800">{selectedCircle.maxCapacity} participants</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <p className="text-slate-400">Duration</p>
                                <p className="font-semibold text-slate-800">{selectedCircle.durationWeeks ?? 4} weeks</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <p className="text-slate-400">Created</p>
                                <p className="font-semibold text-slate-800">{new Date(selectedCircle.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {(selectedCircle.status === "OPEN" || selectedCircle.status === "ACTIVE") ? (
                            <Link
                                href={`/circles/apply?circleId=${selectedCircle.id}`}
                                onClick={() => setSelectedCircle(null)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                            >
                                {selectedCircle.status === "OPEN" ? "Apply to Circle" : "Join Waitlist"} <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                This circle is still awaiting mentor approval and is not open for applications yet.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
