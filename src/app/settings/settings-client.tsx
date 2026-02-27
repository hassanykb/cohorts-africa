"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Save, UserCheck, BookOpen, Layers } from "lucide-react";
import { updateProfile } from "@/lib/profile-actions";

type Role = "MENTOR" | "MENTEE" | "BOTH";

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    bio: string | null;
    linkedinUrl: string | null;
    reputationScore: number;
};

const ROLE_OPTIONS: { value: Role; label: string; desc: string; icon: React.ReactNode }[] = [
    {
        value: "MENTEE",
        label: "Mentee",
        desc: "I want to join circles and learn from mentors.",
        icon: <BookOpen className="w-5 h-5" />,
    },
    {
        value: "MENTOR",
        label: "Mentor",
        desc: "I want to guide circles and share my expertise.",
        icon: <UserCheck className="w-5 h-5" />,
    },
    {
        value: "BOTH",
        label: "Both",
        desc: "I mentor others while still learning from peers.",
        icon: <Layers className="w-5 h-5" />,
    },
];

export default function SettingsClient({ user }: { user: User }) {
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio ?? "");
    const [linkedinUrl, setLinkedinUrl] = useState(user.linkedinUrl ?? "");
    const [role, setRole] = useState<Role>((user.role as Role) ?? "MENTEE");
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSaved(false);
        startTransition(async () => {
            try {
                await updateProfile(user.id, { name, bio, linkedinUrl, role });
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } catch (err: any) {
                setError(err.message || "Failed to save. Please try again.");
            }
        });
    }

    return (
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
            <Link
                href="/profile"
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Profile
            </Link>

            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Settings</h1>
            <p className="text-slate-500 text-sm mb-8">Update your profile info and platform role.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile info */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                    <h2 className="font-bold text-slate-800">Profile Info</h2>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Display Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            type="text"
                            required
                            className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                        <input
                            value={user.email}
                            disabled
                            type="email"
                            className="block w-full px-4 py-3 border border-slate-100 rounded-xl text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-400 mt-1">Email is managed by your sign-in provider.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            LinkedIn URL <span className="font-normal text-slate-400">(optional)</span>
                        </label>
                        <input
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            type="url"
                            placeholder="https://linkedin.com/in/yourname"
                            className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 bg-white text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Bio <span className="font-normal text-slate-400">(optional)</span>
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            maxLength={300}
                            placeholder="Tell mentors and mentees a bit about yourself..."
                            className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 resize-none bg-white text-slate-900"
                        />
                        <p className="text-xs text-slate-400 mt-1 text-right">{bio.length}/300</p>
                    </div>
                </div>

                {/* Role selector */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div>
                        <h2 className="font-bold text-slate-800">Platform Role</h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            You can be a mentee, a mentor, or both — your choice.
                        </p>
                    </div>

                    <div className="grid gap-3">
                        {ROLE_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setRole(opt.value)}
                                className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${role === opt.value
                                    ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                                    : "border-slate-200 hover:border-indigo-300 bg-white"
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${role === opt.value ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                                    }`}>
                                    {opt.icon}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                                        {opt.label}
                                        {role === opt.value && (
                                            <span className="text-xs font-normal text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full">
                                                Selected
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {role === "BOTH" && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                            ✦ As a <strong>Both</strong> member, you&apos;ll have access to both the Mentor Dashboard and Mentee Dashboard from your profile menu.
                        </div>
                    )}
                </div>

                {error && (
                    <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                        ⚠️ {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                    <Save className="w-4 h-4" />
                    {isPending ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
                </button>
            </form>
        </main>
    );
}
