"use client";

import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { createCircle } from "@/lib/actions";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";

type CreateCircleUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
};

const TAGS = [
    "Career Pivot", "FinTech", "Product Management", "Engineering", "Data Science",
    "Entrepreneurship", "Marketing", "Healthcare", "Leadership", "Fundraising",
    "Remote Work", "AI/ML", "Design", "Finance", "Legal", "Public Policy",
    "Social Impact", "Sales", "Project Management", "Agile", "Blockchain",
    "Cybersecurity", "Strategy", "Operations",
];

export default function CreateCircle({ user }: { user: CreateCircleUser }) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [customTag, setCustomTag] = useState("");
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const [pendingAction, setPendingAction] = useState<"publish" | "draft" | null>(null);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 5 ? [...prev, tag] : prev
        );
    };

    const addCustomTag = () => {
        if (!customTag.trim()) return;
        if (selectedTags.length >= 5) return;
        if (!selectedTags.includes(customTag.trim())) {
            setSelectedTags([...selectedTags, customTag.trim()]);
        }
        setCustomTag("");
    };

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setPendingAction("publish");
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            try {
                const id = await createCircle(formData, user.id);
                router.push(`/circles/${id}`);
                router.refresh();
            } catch (err: unknown) {
                setPendingAction(null);
                setError(err instanceof Error ? err.message : "Failed to publish circle.");
            }
        });
    }

    function handleSaveDraft() {
        setError("");
        setPendingAction("draft");
        const formEl = formRef.current;
        if (!formEl) {
            setPendingAction(null);
            setError("Draft form is not ready. Please try again.");
            return;
        }
        const formData = new FormData(formEl);
        startTransition(async () => {
            try {
                await createCircle(formData, user.id, { asDraft: true });
                router.push("/dashboard/mentor");
                router.refresh();
            } catch (err: unknown) {
                setPendingAction(null);
                setError(err instanceof Error ? err.message : "Failed to save draft.");
            }
        });
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <AppNavbar user={user} active="dashboard" />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                {/* Back */}
                <Link href="/dashboard/mentor" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Create a new Circle</h1>
                <p className="text-slate-500 mb-8">Define the topic, cadence, and capacity for your upcoming cohort.</p>

                <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Circle Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                            name="title"
                            type="text"
                            required
                            placeholder='e.g. "Transitioning from Audit to Product Management"'
                            className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 bg-white text-slate-900"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            What will mentees learn? <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            rows={4}
                            required
                            placeholder="Describe the core skills, frameworks, or career outcomes from this circle..."
                            className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 resize-none bg-white text-slate-900"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Focus Areas <span className="text-slate-400 font-normal">(pick up to 5)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {/* Show selected tags first (including custom ones) */}
                            {selectedTags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-600 text-white border border-indigo-600 shadow-sm flex items-center gap-1"
                                >
                                    {tag}
                                    <span className="opacity-60">×</span>
                                </button>
                            ))}

                            {/* Show unselected suggested tags */}
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
                                placeholder="Add custom focus area..."
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTag(); } }}
                            />
                            <button
                                type="button"
                                onClick={addCustomTag}
                                className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Capacity & Duration */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Max Mentees <span className="text-rose-500">*</span>
                            </label>
                            <select
                                name="capacity"
                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                {[5, 8, 10, 12, 15].map((n) => (
                                    <option key={n} value={n}>{n} mentees</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Duration <span className="text-rose-500">*</span>
                            </label>
                            <select className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                                {[2, 4, 6, 8].map((w) => (
                                    <option key={w} value={w}>{w} weeks</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Application prompt */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Application Prompt
                        </label>
                        <input
                            type="text"
                            defaultValue="In 150 words, describe your career goal and what you hope to get from this circle."
                            className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
                            <Info className="w-3 h-3" /> Mentees must answer this before applying — no lazy sign-ups.
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="pt-2 flex gap-3">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm shadow-indigo-200"
                        >
                            {isPending && pendingAction === "publish" ? "Publishing..." : "Publish Circle"}
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={isPending}
                            className="px-6 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                        >
                            {isPending && pendingAction === "draft" ? "Saving..." : "Save Draft"}
                        </button>
                    </div>
                    {error && (
                        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                            ⚠️ {error}
                        </p>
                    )}
                </form>
            </main>
        </div>
    );
}
