"use client";

import { useState } from "react";
import { Search, Clock, Users, ArrowRight, Filter } from "lucide-react";
import Link from "next/link";

interface Circle {
    id: string;
    title: string;
    description: string;
    status: string;
    maxCapacity: number;
    createdAt: string;
    User: { name: string } | null;
}

function initials(name?: string | null) {
    if (!name) return "ME";
    return name.split(" ").filter(Boolean).map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function ExploreClient({ circles: initialCircles }: { circles: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

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
                    {filteredCircles.map((circle: any) => {
                        const mentor = circle.User as { name: string } | null;
                        const isOpen = circle.status === "OPEN";
                        const isProposed = circle.status === "PROPOSED";
                        const ctaHref = isOpen
                            ? `/circles/apply?circleId=${circle.id}`
                            : `/circles/${circle.id}`;

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
                                                {circle.status === "ACTIVE" ? "In Progress" : "Open"}
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
                                        <Link
                                            href={ctaHref}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isOpen
                                                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                                }`}
                                        >
                                            {isOpen ? "Apply" : "Enter Room"} <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
