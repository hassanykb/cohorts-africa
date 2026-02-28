"use client";

import Link from "next/link";
import Image from "next/image";

type Props = {
    role?: string;
    className?: string;
    variant?: "full" | "icon";
};

export default function BrandLogo({ role, className = "", variant = "full" }: Props) {
    const href = role === "MENTOR" || role === "MENTEE" || role === "BOTH"
        ? "/explore"
        : "/";

    return (
        <Link href={href} className={`flex items-center gap-2 ${className}`}>
            {variant === "icon" ? (
                <div className="relative w-8 h-8">
                    <Image
                        src="/favicon.png"
                        alt="Cohorts Network Icon"
                        fill
                        className="object-contain"
                    />
                </div>
            ) : (
                <div className="relative w-40 h-10">
                    <Image
                        src="/logo.png"
                        alt="Cohorts Network"
                        fill
                        className="object-contain object-left"
                    />
                </div>
            )}
        </Link>
    );
}
