import Link from "next/link";
import { Search, Clock, Users, ArrowRight, MapPin, Filter } from "lucide-react";
import { createServerClient } from "@/lib/supabase-server";

async function getCircles() {
    const supabase = createServerClient();
    const { data } = await supabase
        .from("Circle")
        .select("*")
        .in("status", ["OPEN", "ACTIVE", "PROPOSED"])
        .order("createdAt", { ascending: false });
    return data ?? [];
}

export default async function Explore() {
    const circles = await getCircles();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/" className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">CA</span>
                            Cohorts.Africa
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard/mentee" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">My Dashboard</Link>
                            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-sm border-2 border-white shadow-sm">ME</div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Explore Circles</h1>
                    <p className="text-slate-600 mb-6">Find your next cohort, or pitch your own to an executive.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-slate-400" />
                            <input type="text" className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder-slate-400" placeholder="Search by topic, mentor, or role..." />
                        </div>
                        <button className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 gap-2 shadow-sm">
                            <Filter className="w-4 h-4" /> Filters
                        </button>
                        <Link href="/pitch" className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                            Pitch a Circle
                        </Link>
                    </div>
                </div>

                {circles.length === 0 ? (
                    <div className="text-center py-24">
                        <p className="text-5xl mb-4">🌱</p>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">No circles yet</h2>
                        <p className="text-slate-500 mb-6">Be the first — pitch a circle to an executive mentor.</p>
                        <Link href="/pitch" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700">
                            Pitch a Circle
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {circles.map((circle: Record<string, unknown>) => (
                            <div key={circle.id as string} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden group p-6">
                                <div className="mb-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${circle.status === "PROPOSED" ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-800"
                                            }`}>
                                            {circle.status === "PROPOSED" ? "Mentee Pitch" : circle.status as string}
                                        </span>
                                        <span className="text-sm text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {circle.status === "ACTIVE" ? "In Progress" : "Open"}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                        {circle.title as string}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">{circle.description as string}</p>
                                </div>
                                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Users className="w-4 h-4" />
                                        <span>{(circle.maxCapacity as number)} spots max</span>
                                    </div>
                                    <Link href={`/circles/apply`} className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
