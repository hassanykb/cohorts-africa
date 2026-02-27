"use client";

import Link from "next/link";
import { Globe2 } from "lucide-react";
import { getDefaultDashboardPath } from "@/lib/roles";

type Props = {
    role?: string;
    className?: string;
};

export default function BrandLogo({ role, className = "" }: Props) {
    const href = role === "MENTOR" || role === "MENTEE" || role === "BOTH"
        ? getDefaultDashboardPath(role)
        : "/";

    return (
        <Link href={href} className={`font-bold text-xl flex items-center gap-2 ${className}`}>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <Globe2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-900">Cohorts Network</span>
        </Link>
    );
}
