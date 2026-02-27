"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Save, UserCheck } from "lucide-react";
import { updateProfile } from "@/lib/profile-actions";

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    bio: string | null;
    linkedinUrl: string | null;
    avatarUrl: string | null;
    reputationScore: number;
};

export default function SettingsClient({ user }: { user: User }) {
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio ?? "");
    const [linkedinUrl, setLinkedinUrl] = useState(user.linkedinUrl ?? "");
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSaved(false);
        startTransition(async () => {
            try {
                await updateProfile(user.id, { name, bio, linkedinUrl, avatarUrl });
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
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
            <p className="text-slate-500 text-sm mb-8">Update your profile info.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-indigo-600" />
                        Profile Picture
                    </h2>
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-2xl overflow-hidden border-2 border-indigo-50">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                user.name.slice(0, 2).toUpperCase()
                            )}
                        </div>
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="Paste image URL here..."
                                className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAvatarUrl("")}
                                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
                                >
                                    Remove Photo
                                </button>
                                <span className="text-xs text-slate-300">|</span>
                                <p className="text-xs text-slate-500">Synced from {user.email.includes("gmail") ? "Google" : "LinkedIn"}</p>
                            </div>
                        </div>
                    </div>
                </div>

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

                {/* Role mode */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div>
                        <h2 className="font-bold text-slate-800">Platform Mode</h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Every account has both mentee and mentor capabilities.
                        </p>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-700">
                        You can pitch as a <strong>Mentee</strong> or publish as a <strong>Mentor</strong> from the pitch flow.
                    </div>
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
