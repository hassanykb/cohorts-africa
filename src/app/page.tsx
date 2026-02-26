import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users, Trophy, ShieldCheck, Globe2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <Globe2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Cohorts.Africa
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#mentees" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">For Mentees</Link>
              <Link href="#mentors" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">For Mentors</Link>
              <Link href="#enterprise" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Enterprise</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block">Log in</Link>
              <Link href="/signup" className="text-sm font-medium bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 hover:shadow-md hover:shadow-indigo-300">
                Join the Waitlist
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[800px] bg-gradient-to-b from-indigo-50 to-transparent -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-8">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            Reimagining Mentorship in Africa
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-[1.1]">
            Elevate your career with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">Africa's elite.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop sending cold LinkedIn requests. Join curated, 10-person "Mentorship Circles" led by top executives across the diaspora and the continent.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/explore" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-indigo-200">
              Explore Active Circles
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/pitch" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-800 border border-slate-200 rounded-full font-semibold text-lg hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm">
              Pitch a Custom Circle
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Backed by leaders from <span className="font-semibold text-slate-700">MTN, Paystack, Google,</span> and more.
          </p>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How Cohorts Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We've engineered a platform that scales the time of busy professionals while maximizing peer-to-peer accountability.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">The "Circle" Format</h3>
              <p className="text-slate-600 leading-relaxed">
                1 mentor to 10 mentees. Meet virtually for 4 weeks. Learn from the mentor's expertise and your peers' questions simultaneously.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Gamified Accountability</h3>
              <p className="text-slate-600 leading-relaxed">
                No more ghosting. Miss a session without notice and your Reputation Score drops. High scores unlock priority access to elite diaspora masterclasses.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <Trophy className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Reverse Pitching</h3>
              <p className="text-slate-600 leading-relaxed">
                Don't wait for a mentor. Organize a group of 5+ peers and pitch a specific executive on our platform to lead your custom cohort.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to scale your impact?</h2>
          <p className="text-indigo-200 text-lg mb-10 max-w-2xl mx-auto">
            Whether you are a young professional looking for guidance or an executive looking to give back without burning out.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-900 rounded-full font-semibold text-lg hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl">
              Apply as a Mentee
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-indigo-800/50 text-white border border-indigo-700/50 rounded-full font-semibold text-lg hover:bg-indigo-800 transition-all backdrop-blur-sm">
              Apply as a Mentor
            </button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200 text-center">
        <p className="text-slate-500 font-medium tracking-wide">
          © {new Date().getFullYear()} Cohorts.Africa. Built for the continent.
        </p>
      </footer>
    </div>
  );
}
