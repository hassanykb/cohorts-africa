"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Info, PlusCircle, UserCheck, UserPlus, UserX, Users, Calendar, MessageSquare, Plus, FileText, ExternalLink, Video, Clock, MapPin, Search, Filter, ArrowRight, Share2, Globe } from "lucide-react";
import { useState, useTransition, useOptimistic } from "react";
import { submitPitch, savePitchDraft, followMentor, unfollowMentor, searchUsers, type MentorWithFollow } from "@/lib/actions";
import AppNavbar from "@/components/AppNavbar";
import { useRouter } from "next/navigation";

type PitchUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
};

const TAGS = [
    "Career Pivot", "FinTech", "Product Management", "Engineering",
    "Data Science", "Entrepreneurship", "Marketing", "HealthTech",
    "Leadership", "Fundraising", "Remote Work", "AI/ML", "Design",
    "Finance", "Legal", "Public Policy", "Social Impact", "Sales",
    "Project Management", "Agile", "Blockchain", "Cybersecurity",
];

const MENTOR_TAGS: Record<string, string[]> = {
    "mentor-sangu": ["Healthcare", "Entrepreneurship", "VC"],
    "mentor-david": ["Product Management", "FinTech"],
    "mentor-amina": ["Engineering", "Leadership"],
    "mentor-serena": ["Marketing", "Career Pivot"],
};

export default function PitchClient({
    user,
    mentors,
}: {
    user: PitchUser;
    mentors: MentorWithFollow[];
}) {
    const router = useRouter();
    const userId = user.id;
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const [customTag, setCustomTag] = useState("");
    const [peerQuery, setPeerQuery] = useState("");
    const [peerSuggestions, setPeerSuggestions] = useState<{ id: string; name: string; email: string }[]>([]);
    const [invitedPeers, setInvitedPeers] = useState<{ id?: string; name?: string; email: string }[]>([]);
    const [pendingAction, setPendingAction] = useState<"submit" | "draft" | null>(null);

    // Optimistic follow state so the UI feels instant
    const [optimisticMentors, updateOptimistic] = useOptimistic(
        mentors,
        (state: MentorWithFollow[], { id, follow }: { id: string; follow: boolean }) =>
            state.map((m) => (m.id === id ? { ...m, isFollowing: follow } : m))
    );

    const toggleTag = (tag: string) =>
        setSelectedTags((p) =>
            p.includes(tag) ? p.filter((t) => t !== tag) : p.length < 5 ? [...p, tag] : p
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

    const addCustomTag = () => {
        if (!customTag.trim()) return;
        if (selectedTags.length >= 5) {
            setError("You can only select up to 5 focus areas.");
            return;
        }
        if (!selectedTags.includes(customTag.trim())) {
            setSelectedTags([...selectedTags, customTag.trim()]);
        }
        setCustomTag("");
    };

    const handlePeerSearch = async (val: string) => {
        setPeerQuery(val);
        if (val.length < 2) {
            setPeerSuggestions([]);
            return;
        }
        const results = await searchUsers(val);
        setPeerSuggestions(results.filter(u => u.id !== userId && !invitedPeers.find(p => p.email === u.email)));
    };

    const addPeer = (peer: { id?: string; name?: string; email: string }) => {
        if (!invitedPeers.find(p => p.email === peer.email)) {
            setInvitedPeers([...invitedPeers, peer]);
        }
        setPeerQuery("");
        setPeerSuggestions([]);
    };

    const removePeer = (email: string) => {
        setInvitedPeers(invitedPeers.filter(p => p.email !== email));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!selectedMentorId) { setError("Please select a mentor you follow."); return; }
        setPendingAction("submit");
        startTransition(async () => {
            try {
                await submitPitch({ creatorId: userId, mentorId: selectedMentorId, title, description, tags: selectedTags });
                setSubmitted(true);
            } catch (err: unknown) {
                setPendingAction(null);
                setError(err instanceof Error ? err.message : "Something went wrong.");
            }
        });
    }

    function handleSaveDraft() {
        setError("");
        setPendingAction("draft");
        startTransition(async () => {
            try {
                await savePitchDraft({
                    creatorId: userId,
                    mentorId: selectedMentorId,
                    title,
                    description,
                });
                router.push("/dashboard/mentee");
                router.refresh();
            } catch (err: unknown) {
                setPendingAction(null);
                setError(err instanceof Error ? err.message : "Failed to save draft.");
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
            <AppNavbar user={user} />

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
                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 bg-white text-slate-900"
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
                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 resize-none bg-white text-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Focus Areas <span className="text-slate-400 font-normal">(up to 5)</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {/* Selected Tags first as badges */}
                                {selectedTags.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-600 text-white border border-indigo-600 shadow-sm flex items-center gap-1"
                                    >
                                        {tag}
                                        <span className="opacity-60 text-base leading-none">×</span>
                                    </button>
                                ))}

                                {/* Unselected Suggested Tags */}
                                {TAGS.filter(tag => !selectedTags.includes(tag)).map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200 hover:border-indigo-400"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2 mt-3">
                                <input
                                    type="text"
                                    value={customTag}
                                    onChange={(e) => setCustomTag(e.target.value)}
                                    placeholder="Add custom... (e.g. AI Safety)"
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTag(); } }}
                                />
                                <button
                                    type="button"
                                    onClick={addCustomTag}
                                    className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200"
                                >
                                    Add
                                </button>
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
                                knows you&apos;re genuinely interested in their guidance.
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

                        {/* Selected Peers */}
                        {invitedPeers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {invitedPeers.map((peer) => (
                                    <div key={peer.email} className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-100">
                                        <span>{peer.name || peer.email}</span>
                                        <button type="button" onClick={() => removePeer(peer.email)} className="hover:text-rose-500">×</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="relative">
                            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={peerQuery}
                                onChange={(e) => handlePeerSearch(e.target.value)}
                                placeholder="Search by name or enter email..."
                                className="block w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && peerQuery.includes("@")) {
                                        e.preventDefault();
                                        addPeer({ email: peerQuery });
                                    }
                                }}
                            />

                            {/* Suggestions Dropdown */}
                            {peerSuggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                                    {peerSuggestions.map((u) => (
                                        <button
                                            key={u.id}
                                            type="button"
                                            onClick={() => addPeer(u)}
                                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center justify-between group"
                                        >
                                            <div>
                                                <p className="font-semibold text-slate-900">{u.name}</p>
                                                <p className="text-xs text-slate-500">{u.email}</p>
                                            </div>
                                            <PlusCircle className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Info className="w-3 h-3" /> People you invite will receive an email to join this circle.
                        </p>
                    </div>

                    {error && (
                        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                            ⚠️ {error}
                        </p>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={isPending}
                            className="px-6 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md text-base"
                        >
                            {isPending && pendingAction === "draft" ? "Saving..." : "Save Draft"}
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedMentorId || !title || !description || isPending}
                            className="flex-1 py-4 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md text-base"
                        >
                            {isPending && pendingAction === "submit" ? "Sending..." : "🎯 Send Pitch to Mentor"}
                        </button>
                    </div>

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
