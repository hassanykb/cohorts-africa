"use client";

import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, Settings, User2, ChevronDown } from "lucide-react";

type Props = {
    name: string;
    email: string;
    initials: string;
    role: string;
    avatarUrl?: string | null;
};

export default function ProfileMenu({ name, email, initials, role, avatarUrl }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1.5 group"
                aria-label="Open profile menu"
            >
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-sm group-hover:ring-2 group-hover:ring-indigo-400 group-hover:ring-offset-1 transition-all overflow-hidden">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        initials
                    )}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Profile header */}
                    <div className="px-4 py-4 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0 overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-sm truncate">{name}</p>
                            <p className="text-xs text-slate-500 truncate">{email}</p>
                            <span className="inline-flex items-center mt-0.5 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                                {role}
                            </span>
                        </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5">
                        <Link
                            href="/profile"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <User2 className="w-4 h-4 text-slate-400" />
                            View Profile
                        </Link>
                        <Link
                            href="/settings"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Settings className="w-4 h-4 text-slate-400" />
                            Settings
                        </Link>
                        <Link
                            href="/dashboard/mentee"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                            <ChevronDown className="w-4 h-4 -rotate-90" />
                            Dashboard
                        </Link>
                        <Link
                            href="/dashboard/mentor"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                            <ChevronDown className="w-4 h-4 -rotate-90" />
                            Mentor View
                        </Link>
                    </div>

                    <div className="border-t border-slate-100 py-1.5">
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
