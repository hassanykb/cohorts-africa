"use client";

import Link from "next/link";
import { Globe2, ArrowLeft, Search, UserPlus, Info } from "lucide-react";
import { useState, useTransition } from "react";
import { submitPitch } from "@/lib/actions";

const MOCK_MENTORS = [
    { id: "1", name: "Sangu Delle", role: "CEO, CarePoint · Author · Investor", location: "Accra, Ghana", tags: ["Healthcare", "Entrepreneurship", "VC"] },
    { id: "2", name: "David Osei", role: "VP of Product, FinTech Africa", location: "London, UK", tags: ["Product Management", "FinTech"] },
    { id: "3", name: "Amina Lawal", role: "Engineering Manager, GlobalTech", location: "Lagos, Nigeria", tags: ["Backend", "Engineering"] },
];

const TAGS = ["Career Pivot", "FinTech", "Product Management", "Engineering", "Data Science", "Entrepreneurship", "Marketing", "HealthTech", "Leadership", "Fundraising", "Remote Work"];

export default function PitchClient({ userId }: { userId: string }) {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isPending, startTransition] = useTransition();

    const toggleTag = (tag: string) => setSelectedTags(p => p.includes(tag) ? p.filter(t => t !== tag) : p.length < 3 ? [...p, tag] : p);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        startTransition(async () => {
            await submitPitch({ creatorId: userId, title, description, tags: selectedTags });
            setSubmitted(true);
        });
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🎯</div>
                    <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Pitch Sent!</h1>
                    <p className="text-slate-500 mb-6">Your pitched circle is now live. Once a mentor accepts it, applications will open.</p>
                    <Link href="/explore" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700">See it on Explore →</Link>
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
                        Cohorts.Africa
                    </Link>
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm shadow-sm">
                        {userId.slice(0, 2).toUpperCase()}
                    </div>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                <Link href="/dashboard/mentee" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
                <div className="mb-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 mb-3">🔥 Mentee-Initiated Circle</span>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Pitch a Custom Circle</h1>
                    <p className="text-slate-500">Organize a group and invite a specific mentor to lead your cohort.</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800 flex gap-3">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                    <p>A group of <strong>5 or more mentees</strong> is most compelling to mentors!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1 */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
                        <h2 className="font-bold text-slate-800">1. Define your Circle</h2>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Circle Title <span className="text-rose-500">*</span></label>
                            <input required value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder='e.g. "Breaking into HealthTech in West Africa"' className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Why does your group need this? <span className="text-rose-500">*</span></label>
                            <textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="What problem is your group facing?" className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 resize-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Focus Areas <span className="text-slate-400 font-normal">(up to 3)</span></label>
                            <div className="flex flex-wrap gap-2">
                                {TAGS.map(tag => (
                                    <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${selectedTags.includes(tag) ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-400"}`}>{tag}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                        <h2 className="font-bold text-slate-800">2. Choose a Mentor</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Search mentors..." className="block w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400" />
                        </div>
                        <div className="space-y-2">
                            {MOCK_MENTORS.map(m => (
                                <button key={m.id} type="button" onClick={() => setSelectedMentor(m.id)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedMentor === m.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm">{m.name}</p>
                                            <p className="text-xs text-slate-500">{m.role} · {m.location}</p>
                                            <div className="flex gap-1 mt-1.5">{m.tags.map(t => <span key={t} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{t}</span>)}</div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ml-3 flex items-center justify-center ${selectedMentor === m.id ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}`}>
                                            {selectedMentor === m.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                        <h2 className="font-bold text-slate-800">3. Invite Peers</h2>
                        <div className="relative">
                            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="friend@email.com, another@email.com..." className="block w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400" />
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1"><Info className="w-3 h-3" /> Separate emails with commas. Aim for at least 4 others.</p>
                    </div>

                    <button type="submit" disabled={!selectedMentor || !title || !description || isPending}
                        className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md">
                        {isPending ? "Sending Pitch..." : "🎯 Send Pitch to Mentor"}
                    </button>
                </form>
            </main>
        </div>
    );
}
