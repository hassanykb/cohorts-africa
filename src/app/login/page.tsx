"use client";

import { signIn } from "next-auth/react";
import { Globe2, Linkedin } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                            <Globe2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-2xl text-slate-900">Cohorts.Africa</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome back</h1>
                    <p className="text-slate-500">Sign in to continue your journey</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-4">
                    {/* LinkedIn */}
                    <button
                        onClick={() => signIn("linkedin", { callbackUrl: "/explore" })}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#0077B5] text-white rounded-xl font-semibold hover:bg-[#005f94] transition-colors shadow-sm"
                    >
                        <Linkedin className="w-5 h-5" />
                        Continue with LinkedIn
                    </button>

                    {/* Google */}
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/explore" })}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-slate-700 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        {/* Google icon inline SVG */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-white text-slate-400">Mentors must use LinkedIn</span>
                        </div>
                    </div>

                    <p className="text-xs text-center text-slate-400 mt-4">
                        By signing in, you agree to our{" "}
                        <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a>{" "}
                        and{" "}
                        <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
