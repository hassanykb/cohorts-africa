"use client";

import Link from "next/link";
import { Globe2 } from "lucide-react";

type Props = {
    role?: string;
    className?: string;
};

export default function BrandLogo({ role, className = "" }: Props) {
    let href = "/"; // Default href for missing or unhandled roles
    if (role === "MENTOR") href = "/dashboard/mentor";
    else if (role === "MENTEE") href = "/dashboard/mentee";
    else if (role === "BOTH") href = "/dashboard/mentee"; // Default to mentee for both, or we could add a smarter check

    return (
        <Link href={href} className={`font-bold text-xl flex items-center gap-2 ${className}`}>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <Globe2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-900">Cohorts.Africa</span>
        </Link>
    );
}
