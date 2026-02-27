"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
    Globe2, Video, BookOpen, MessageSquare, Plus, ExternalLink,
    Clock, CheckCircle2, ArrowLeft, Trash2, Send, Calendar,
    FileText, Link2, Youtube,
} from "lucide-react";
import {
    addSession, addResource, postDiscussion, markSessionComplete,
} from "@/lib/circle-room-actions";

type Session = {
    id: string; title: string; scheduledAt: string;
    videoCallUrl: string | null; notes: string | null; status: string;
};
type Resource = {
    id: string; title: string; url: string; type: string;
    User: { name: string } | null; createdAt: string;
};
type Post = {
    id: string; content: string; createdAt: string;
    User: { name: string } | null;
};
type Circle = {
    id: string; title: string; description: string; status: string;
    User: { name: string; email: string } | null;
};
type AppUser = { id: string; name: string; email: string; role: string };

const RESOURCE_TYPES = [
    { value: "LINK", label: "Link", icon: <Link2 className="w-3.5 h-3.5" /> },
    { value: "DOC", label: "Doc", icon: <FileText className="w-3.5 h-3.5" /> },
    { value: "VIDEO", label: "Video", icon: <Youtube className="w-3.5 h-3.5" /> },
];

function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function CircleRoomClient({
    circle, sessions: initSessions, resources: initResources, posts: initPosts,
    currentUser, isMentor,
}: {
    circle: Circle;
    sessions: Session[];
    resources: Resource[];
    posts: Post[];
    currentUser: AppUser;
    isMentor: boolean;
}) {
    const [tab, setTab] = useState<"sessions" | "resources" | "discussion">("sessions");
    const [sessions, setSessions] = useState(initSessions);
    const [resources, setResources] = useState(initResources);
    const [posts, setPosts] = useState(initPosts);
    const [isPending, startTransition] = useTransition();

    // Session form
    const [showSessionForm, setShowSessionForm] = useState(false);
    const [sessionTitle, setSessionTitle] = useState("");
    const [sessionDate, setSessionDate] = useState("");
    const [sessionUrl, setSessionUrl] = useState("");

    // Resource form
    const [showResourceForm, setShowResourceForm] = useState(false);
    const [resTitle, setResTitle] = useState("");
    const [resUrl, setResUrl] = useState("");
    const [resType, setResType] = useState("LINK");

    // Discussion
    const [newPost, setNewPost] = useState("");

    function handleAddSession(e: React.FormEvent) {
        e.preventDefault();
        startTransition(async () => {
            await addSession(circle.id, { title: sessionTitle, scheduledAt: sessionDate, videoCallUrl: sessionUrl });
            setSessions((prev) => [...prev, {
                id: crypto.randomUUID(), title: sessionTitle,
                scheduledAt: sessionDate, videoCallUrl: sessionUrl || null,
                notes: null, status: "UPCOMING",
            }]);
            setSessionTitle(""); setSessionDate(""); setSessionUrl("");
            setShowSessionForm(false);
        });
    }

    function handleAddResource(e: React.FormEvent) {
        e.preventDefault();
        startTransition(async () => {
            await addResource(circle.id, currentUser.id, { title: resTitle, url: resUrl, type: resType });
            setResources((prev) => [{
                id: crypto.randomUUID(), title: resTitle, url: resUrl, type: resType,
                User: { name: currentUser.name }, createdAt: new Date().toISOString(),
            }, ...prev]);
            setResTitle(""); setResUrl(""); setResType("LINK");
            setShowResourceForm(false);
        });
    }

    function handlePost(e: React.FormEvent) {
        e.preventDefault();
        if (!newPost.trim()) return;
        startTransition(async () => {
            await postDiscussion(circle.id, currentUser.id, newPost);
            setPosts((prev) => [{
                id: crypto.randomUUID(), content: newPost,
                User: { name: currentUser.name }, createdAt: new Date().toISOString(),
            }, ...prev]);
            setNewPost("");
        });
    }

    function handleComplete(session: Session) {
        const notes = prompt("Add session notes (optional):", "") ?? "";
        startTransition(async () => {
            await markSessionComplete(session.id, circle.id, notes);
            setSessions((prev) => prev.map((s) => s.id === session.id ? { ...s, status: "COMPLETED", notes } : s));
        });
    }

    const upcoming = sessions.filter((s) => s.status === "UPCOMING");
    const completed = sessions.filter((s) => s.status === "COMPLETED");

    const TABS = [
        { key: "sessions", label: "Sessions", icon: <Calendar className="w-4 h-4" /> },
        { key: "resources", label: "Resources", icon: <BookOpen className="w-4 h-4" /> },
        { key: "discussion", label: "Discussion", icon: <MessageSquare className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Nav */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
                    <Link href="/" className="font-bold text-xl flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center"><Globe2 className="w-5 h-5 text-white" /></div>
                        Cohorts Network
                    </Link>
                    <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                        {initials(currentUser.name)}
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <Link href="/explore" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-5">
                    <ArrowLeft className="w-4 h-4" /> Back to Explore
                </Link>

                {/* Circle header */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mb-2 ${circle.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-800"
                                }`}>
                                {circle.status}
                            </span>
                            <h1 className="text-2xl font-extrabold text-slate-900">{circle.title}</h1>
                            {circle.User && (
                                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-indigo-100 inline-flex items-center justify-center text-indigo-600 text-xs font-bold">
                                        {initials(circle.User.name)}
                                    </span>
                                    Mentored by <strong>{circle.User.name}</strong>
                                </p>
                            )}
                            <p className="text-sm text-slate-600 mt-2 max-w-xl">{circle.description}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                                {sessions.length} session{sessions.length !== 1 ? "s" : ""} scheduled
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-xl overflow-hidden shadow-sm">
                    {TABS.map(({ key, label, icon }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key as typeof tab)}
                            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 flex-1 justify-center ${tab === key
                                ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            {icon} {label}
                        </button>
                    ))}
                </div>

                {/* ─── SESSIONS TAB ─────────────────────────────────────── */}
                {tab === "sessions" && (
                    <div className="space-y-5">
                        {isMentor && (
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowSessionForm(!showSessionForm)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Schedule Session
                                </button>
                            </div>
                        )}

                        {showSessionForm && isMentor && (
                            <form onSubmit={handleAddSession} className="bg-white rounded-2xl border border-indigo-200 p-5 space-y-4 shadow-sm">
                                <h3 className="font-bold text-slate-800">New Session</h3>
                                <input required value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} placeholder="Session title" className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                <input required type="datetime-local" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                <input type="url" value={sessionUrl} onChange={(e) => setSessionUrl(e.target.value)} placeholder="Video call link (Google Meet, Zoom...)" className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                <div className="flex gap-2">
                                    <a href="https://meet.google.com/new" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                                        <Globe2 className="w-3 h-3 text-emerald-500" /> Create Google Meet
                                    </a>
                                    <a href="https://zoom.us/start/videohost" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                                        <Video className="w-3 h-3 text-indigo-500" /> Create Zoom
                                    </a>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button type="button" onClick={() => setShowSessionForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Cancel</button>
                                    <button type="submit" disabled={isPending} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50">Add Session</button>
                                </div>
                            </form>
                        )}

                        {upcoming.length === 0 && completed.length === 0 && (
                            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400 text-sm">
                                {isMentor ? "Schedule your first session above." : "No sessions scheduled yet. Check back soon."}
                            </div>
                        )}

                        {upcoming.length > 0 && (
                            <div className="space-y-3">
                                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Upcoming</h2>
                                {upcoming.map((s) => (
                                    <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start justify-between gap-4 flex-wrap">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                                                <h3 className="font-semibold text-slate-900">{s.title}</h3>
                                            </div>
                                            <p className="text-sm text-slate-500 flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(s.scheduledAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {s.videoCallUrl && (
                                                <a href={s.videoCallUrl} target="_blank" rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors">
                                                    <Video className="w-3.5 h-3.5" /> Join Call
                                                </a>
                                            )}
                                            {isMentor && (
                                                <button onClick={() => handleComplete(s)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {completed.length > 0 && (
                            <div className="space-y-3">
                                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Past Sessions</h2>
                                {completed.map((s) => (
                                    <div key={s.id} className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <h3 className="font-semibold text-slate-700">{s.title}</h3>
                                        </div>
                                        <p className="text-xs text-slate-400">{new Date(s.scheduledAt).toLocaleDateString()}</p>
                                        {s.notes && <p className="text-sm text-slate-600 mt-2 bg-white rounded-xl p-3 border border-slate-100">{s.notes}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── RESOURCES TAB ────────────────────────────────────── */}
                {tab === "resources" && (
                    <div className="space-y-5">
                        <div className="flex justify-end">
                            <button onClick={() => setShowResourceForm(!showResourceForm)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                                <Plus className="w-4 h-4" /> Add Resource
                            </button>
                        </div>

                        {showResourceForm && (
                            <form onSubmit={handleAddResource} className="bg-white rounded-2xl border border-indigo-200 p-5 space-y-4 shadow-sm">
                                <h3 className="font-bold text-slate-800">New Resource</h3>
                                <div className="flex gap-2">
                                    {RESOURCE_TYPES.map((t) => (
                                        <button key={t.value} type="button" onClick={() => setResType(t.value)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${resType === t.value ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600"}`}>
                                            {t.icon} {t.label}
                                        </button>
                                    ))}
                                </div>
                                <input required value={resTitle} onChange={(e) => setResTitle(e.target.value)} placeholder="Resource title" className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                <input required type="url" value={resUrl} onChange={(e) => setResUrl(e.target.value)} placeholder="https://..." className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                <div className="flex gap-2 justify-end">
                                    <button type="button" onClick={() => setShowResourceForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Cancel</button>
                                    <button type="submit" disabled={isPending} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50">Add</button>
                                </div>
                            </form>
                        )}

                        {resources.length === 0 && (
                            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400 text-sm">
                                No resources yet. {isMentor ? "Share links, docs, and videos with your mentees." : "The mentor hasn&apos;t shared resources yet."}
                            </div>
                        )}

                        <div className="space-y-3">
                            {resources.map((r) => {
                                const typeIcon = r.type === "VIDEO" ? <Youtube className="w-4 h-4 text-rose-500" /> : r.type === "DOC" ? <FileText className="w-4 h-4 text-blue-500" /> : <Link2 className="w-4 h-4 text-indigo-500" />;
                                return (
                                    <div key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">{typeIcon}</div>
                                            <div className="min-w-0">
                                                <a href={r.url} target="_blank" rel="noreferrer"
                                                    className="text-sm font-semibold text-slate-900 hover:text-indigo-600 flex items-center gap-1 truncate">
                                                    {r.title} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                </a>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    Added by {r.User?.name ?? "unknown"} · {timeAgo(r.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        {(isMentor || r.User?.name === currentUser.name) && (
                                            <button className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors flex-shrink-0">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ─── DISCUSSION TAB ───────────────────────────────────── */}
                {tab === "discussion" && (
                    <div className="space-y-5">
                        <form onSubmit={handlePost} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                                    {initials(currentUser.name)}
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={newPost}
                                        onChange={(e) => setNewPost(e.target.value)}
                                        rows={2}
                                        placeholder="Ask a question, share an insight, or start a thread..."
                                        className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 resize-none"
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button type="submit" disabled={!newPost.trim() || isPending}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-colors">
                                            <Send className="w-3.5 h-3.5" /> Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {posts.length === 0 && (
                            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400 text-sm">
                                No discussion yet. Be the first to post!
                            </div>
                        )}

                        <div className="space-y-4">
                            {posts.map((p) => (
                                <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                            {initials(p.User?.name ?? "??")}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-800">{p.User?.name ?? "Member"}</span>
                                        <span className="text-xs text-slate-400">{timeAgo(p.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">{p.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
