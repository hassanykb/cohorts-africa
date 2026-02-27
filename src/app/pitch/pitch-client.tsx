"use client";

import Link from "next/link";
import { Globe2, ArrowLeft, UserPlus, Info, CheckCircle2, UserCheck, UserX } from "lucide-react";
import { useState, useTransition, useOptimistic } from "react";
import { submitPitch, followMentor, unfollowMentor, type MentorWithFollow } from "@/lib/actions";

const TAGS = [
    "Career Pivot", "FinTech", "Product Management", "Engineering",
    "Data Science", "Entrepreneurship", "Marketing", "HealthTech",
    "Leadership", "Fundraising", "Remote Work",
];

const MENTOR_TAGS: Record<string, string[]> = {
    "mentor-sangu": ["Healthcare", "Entrepreneurship", "VC"],
    "mentor-david": ["Product Management", "FinTech"],
    "mentor-amina": ["Engineering", "Leadership"],
    "mentor-serena": ["Marketing", "Career Pivot"],
};

export default function PitchClient({
    userId,
    mentors,
}: {
    userId: string;
    mentors: MentorWithFollow[];
}) {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();

    // Optimistic follow state so the UI feels instant
    const [optimisticMentors, updateOptimistic] = useOptimistic(
        mentors,
        (state: MentorWithFollow[], { id, follow }: { id: string; follow: boolean }) =>
            state.map((m) => (m.id === id ? { ...m, isFollowing: follow } : m))
    );

    const toggleTag = (tag: string) =>
        setSelectedTags((p) =>
            p.includes(tag) ? p.filter((t) => t !== tag) : p.length < 3 ? [...p, tag] : p
        );

    function handleFollowToggle(mentor: MentorWithFollow) {
        startTransition(async () => {
            updateOptimistic({ id: mentor.id, follow: !mentor.isFollowing });
            if (mentor.isFollowing) {
                await unfollowMentor(userId, mentor.id);
                if (selectedMentorId === mentor.id) setSelectedMentorId(null);
            } else {
                await followMentor(userId, mentor.id);
            }
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!selectedMentorId) { setError("Please select a mentor you follow."); return; }
        startTransition(async () => {
            try {
                await submitPitch({ creatorId: userId, mentorId: selectedMentorId, title, description, tags: selectedTags });
                setSubmitted(true);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Something went wrong.");
            }
        });
    }

    const selectedMentor = optimisticMentors.find((m) => m.id === selectedMentorId);
    const followedCount = optimisticMentors.filter((m) => m.isFollowing).length;

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🎯</div>
                    <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Pitch Sent!</h1>
                    <p className="text-slate-500 mb-2">
                        Your circle pitch has been sent to <strong>{selectedMentor?.name}</strong>.
                    </p>
                    <p className="text-slate-400 text-sm mb-6">Once they accept, applications will open to the public.</p>
                    <div className="flex gap-3 justify-center">
                        <Link href="/explore" className="px-5 py-2.5 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 text-sm">See on Explore →</Link>
                        <Link href="/dashboard/mentee" className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-50 text-sm">My Dashboard</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Nav */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
                    <Link href="/" className="font-bold text-xl flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                            <Globe2 className="w-5 h-5 text-white" />
                        </div>
                        Cohorts.Africa
                    </Link>
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm">
                        {userId.slice(0, 2).toUpperCase()}
                    </div>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                <Link href="/dashboard/mentee" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>

                <div className="mb-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 mb-3">
                        🔥 Mentee-Initiated Circle
                    </span>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Pitch a Custom Circle</h1>
                    <p className="text-slate-500">Organize a group and pitch to a mentor you follow.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1 — Define circle */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">1</span>
                            Define your Circle
                        </h2>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Circle Title <span className="text-rose-500">*</span>
                            </label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                type="text"
                                placeholder='e.g. "Breaking into HealthTech Product Roles in West Africa"'
                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Why does your group need this? <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                required
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What problem is your group facing, and why is this mentor the right guide?"
                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Focus Areas <span className="text-slate-400 font-normal">(up to 3)</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {TAGS.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${selectedTags.includes(tag)
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-400"
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Step 2 — Choose a mentor */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">2</span>
                                Choose a Mentor
                            </h2>
                            <span className="text-xs text-slate-400">{followedCount} followed</span>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex gap-2">
                            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                            <p>
                                <strong>Follow a mentor first</strong> to unlock pitching to them. This ensures the mentor
                                knows you're genuinely interested in their guidance.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {optimisticMentors.map((mentor) => {
                                const tags = MENTOR_TAGS[mentor.id] ?? ["Mentorship"];
                                const isSelected = selectedMentorId === mentor.id;
                                const canSelect = mentor.isFollowing;

                                return (
                                    <div
                                        key={mentor.id}
                                        className={`rounded-xl border transition-all ${isSelected
                                                ? "border-indigo-500 bg-indigo-50"
                                                : canSelect
                                                    ? "border-slate-200 hover:border-indigo-300 bg-white"
                                                    : "border-slate-100 bg-slate-50 opacity-80"
                                            }`}
                                    >
                                        <div className="p-4 flex items-start gap-3">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {mentor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-semibold text-slate-900 text-sm">{mentor.name}</p>
                                                    {mentor.isFollowing && (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                                                            <CheckCircle2 className="w-3 h-3" /> Following
                                                        </span>
                                                    )}
                                                </div>
                                                {mentor.linkedinUrl && (
                                                    <a
                                                        href={mentor.linkedinUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs text-indigo-500 hover:underline"
                                                    >
                                                        LinkedIn ↗
                                                    </a>
                                                )}
                                                <div className="flex gap-1 mt-1.5 flex-wrap">
                                                    {tags.map((t) => (
                                                        <span key={t} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {/* Follow / Unfollow */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleFollowToggle(mentor)}
                                                    disabled={isPending}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${mentor.isFollowing
                                                            ? "border-slate-200 text-slate-600 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                                                            : "border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                                                        }`}
                                                >
                                                    {mentor.isFollowing ? (
                                                        <><UserX className="w-3.5 h-3.5" /> Unfollow</>
                                                    ) : (
                                                        <><UserPlus className="w-3.5 h-3.5" /> Follow</>
                                                    )}
                                                </button>

                                                {/* Select to pitch */}
                                                <button
                                                    type="button"
                                                    disabled={!canSelect}
                                                    onClick={() => setSelectedMentorId(isSelected ? null : mentor.id)}
                                                    title={!canSelect ? "Follow this mentor to pitch to them" : ""}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${isSelected
                                                            ? "bg-indigo-600 text-white border-indigo-600"
                                                            : canSelect
                                                                ? "border-slate-200 text-slate-700 bg-white hover:border-indigo-400"
                                                                : "border-slate-100 text-slate-300 bg-white cursor-not-allowed"
                                                        }`}
                                                >
                                                    {isSelected ? (
                                                        <><UserCheck className="w-3.5 h-3.5" /> Selected</>
                                                    ) : (
                                                        "Pitch to"
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {followedCount === 0 && (
                            <p className="text-center text-sm text-slate-400 pt-2">
                                Follow at least one mentor above to unlock pitching.
                            </p>
                        )}
                    </div>

                    {/* Step 3 — Invite peers */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">3</span>
                            Invite Peers
                        </h2>
                        <div className="relative">
                            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="friend@email.com, another@email.com..."
                                className="block w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                            />
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Info className="w-3 h-3" /> Separate emails with commas. Aim for at least 4 others.
                        </p>
                    </div>

                    {error && (
                        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                            ⚠️ {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={!selectedMentorId || !title || !description || isPending}
                        className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md text-base"
                    >
                        {isPending ? "Sending..." : "🎯 Send Pitch to Mentor"}
                    </button>

                    {!selectedMentorId && followedCount > 0 && (
                        <p className="text-center text-xs text-slate-400">
                            Click <strong>Pitch to</strong> on a followed mentor above to select them.
                        </p>
                    )}
                </form>
            </main>
        </div>
    );
}
