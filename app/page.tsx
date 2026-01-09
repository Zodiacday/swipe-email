"use client";

/**
 * Obsidian Mint Redesigned Landing Page
 * Focus: High-end, minimal, professional
 */

import { motion } from "framer-motion";
import Link from "next/link";
import {
    Shield,
    Zap,
    Sparkles,
    Target,
    ArrowRight,
} from "lucide-react";
import { Particles, Meteors } from "@/components/ui";
import { HeroDemo } from "@/components/HeroDemo/HeroDemo";
import { useSession } from "next-auth/react";

export default function Home() {
    const { data: session } = useSession();

    // Determine where CTA should go
    const ctaHref = session ? "/mode-select" : "/login";
    const ctaLabel = session ? "Go to App" : "Start Experience";

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden relative font-sans selection:bg-emerald-500/30">
            {/* Ambient background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <Particles quantity={40} className="pointer-events-none opacity-30" color="#10b981" />
            <Meteors number={10} className="pointer-events-none opacity-20" />

            {/* Hero Section - padding-top accounts for fixed navbar */}
            <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-24 px-4 sm:px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-20">
                    {/* Left Content */}
                    <div className="flex-1 text-center lg:text-left z-10 w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6"
                        >
                            <Sparkles className="w-3 h-3" />
                            The New Era of Email Control
                        </motion.div>

                        <motion.h1
                            className="text-6xl sm:text-7xl lg:text-9xl font-black mb-6 tracking-tighter leading-[0.85] italic uppercase"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            INBOX.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 not-italic">REMASTERED.</span>
                        </motion.h1>

                        <motion.p
                            className="text-base sm:text-lg lg:text-xl text-zinc-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            Clean your inbox with satisfying gestures. No complex AI, no magic—just pure, high-performance email management.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Link
                                href={ctaHref}
                                className="w-full sm:w-auto px-10 py-5 bg-emerald-500 text-zinc-950 font-black tracking-widest text-sm rounded-full hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.2)] group active:scale-95"
                            >
                                {ctaLabel}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="#demo"
                                className="w-full sm:w-auto px-10 py-5 border border-zinc-800 text-white font-black tracking-widest text-sm rounded-full hover:bg-zinc-900 transition-all flex items-center justify-center active:scale-95"
                            >
                                WATCH DEMO
                            </Link>
                        </motion.div>
                    </div>

                    {/* Right Demo Content */}
                    <div id="demo" className="flex-1 relative z-10 w-full mt-8 lg:mt-0 flex justify-center lg:justify-end">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[450px]"
                        >
                            <HeroDemo />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-6 border-t border-zinc-900 bg-zinc-950/30">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: "Privacy First",
                                desc: "We never read your email content. Metadata stays on your device.",
                            },
                            {
                                icon: Zap,
                                title: "Effortless Flow",
                                desc: "Clean thousands of emails in minutes, not hours.",
                            },
                            {
                                icon: Target,
                                title: "Smart Detection",
                                desc: "Automatically identifies newsletters, social updates, and promo spam.",
                            },
                        ].map((f, i) => (
                            <div key={i} className="p-10 rounded-3xl glass border-zinc-800/50 hover:border-emerald-500/20 transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mb-8 group-hover:bg-emerald-500/10 transition-colors">
                                    <f.icon className="w-7 h-7 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                                </div>
                                <h3 className="text-2xl font-black tracking-tight mb-4">{f.title}</h3>
                                <p className="text-zinc-400 text-base leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-6 border-t border-zinc-900">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
                            Simple Pricing. <span className="text-emerald-500">No BS.</span>
                        </h2>
                        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                            Other tools charge $10/mo and sell your data. We don't.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        {/* Free Tier */}
                        <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 relative">
                            <div className="mb-6">
                                <h3 className="text-2xl font-black mb-2">Free</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black">$0</span>
                                    <span className="text-zinc-500">/forever</span>
                                </div>
                            </div>
                            <p className="text-zinc-400 mb-8">Perfect for casual inbox cleaners</p>
                            <ul className="space-y-4 mb-8">
                                {[
                                    "50 swipes per day",
                                    "1 email account",
                                    "Basic email categories",
                                    "Gmail support",
                                ].map((f, i) => (
                                    <li key={i} className="flex items-center gap-3 text-zinc-300">
                                        <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                                            <span className="text-emerald-400 text-xs">✓</span>
                                        </div>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/login"
                                className="block w-full py-4 text-center bg-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-700 transition-colors"
                            >
                                Get Started Free
                            </Link>
                        </div>

                        {/* Pro Tier */}
                        <div className="p-8 rounded-3xl bg-zinc-950 border-2 border-emerald-500/50 relative overflow-hidden">
                            {/* Popular Badge */}
                            <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-full">
                                Most Popular
                            </div>
                            <div className="mb-6">
                                <h3 className="text-2xl font-black text-emerald-400 mb-2">Pro</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-white">$5.99</span>
                                    <span className="text-zinc-500">/month</span>
                                </div>
                                <p className="text-emerald-400/80 text-sm mt-2">or $39/year (save 45%)</p>
                            </div>
                            <p className="text-zinc-400 mb-8">For inbox power users</p>
                            <ul className="space-y-4 mb-8">
                                {[
                                    "Unlimited swipes",
                                    "All email providers",
                                    "Autopilot rules",
                                    "Priority support",
                                    "Bulk operations",
                                ].map((f, i) => (
                                    <li key={i} className="flex items-center gap-3 text-zinc-300">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <span className="text-emerald-400 text-xs">✓</span>
                                        </div>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/login"
                                className="block w-full py-4 text-center bg-emerald-500 text-zinc-950 font-bold rounded-2xl hover:bg-emerald-400 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                            >
                                Upgrade to Pro
                            </Link>
                        </div>
                    </div>

                    {/* Competitor Callouts */}
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-start gap-3">
                            <span className="text-red-400 text-lg">⚠️</span>
                            <p className="text-zinc-400">
                                <span className="text-red-400 font-bold">Unlike Unroll.me</span>, we don't sell your inbox to advertisers. Your data stays yours.
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
                            <span className="text-emerald-400 text-lg">💸</span>
                            <p className="text-zinc-400">
                                <span className="text-emerald-400 font-bold">Clean Email charges $9.99/mo.</span> We're $5.99. Same result, half the price.
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3">
                            <span className="text-blue-400 text-lg">🎯</span>
                            <p className="text-zinc-400">
                                <span className="text-blue-400 font-bold">No confusing tiers like SaneBox.</span> Just Free or Pro. That's it.
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex items-start gap-3">
                            <span className="text-purple-400 text-lg">♾️</span>
                            <p className="text-zinc-400">
                                <span className="text-purple-400 font-bold">Mailstrom charges extra per account.</span> We don't. Unlimited accounts in Pro.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6 relative">
                <div className="max-w-3xl mx-auto text-center glass p-16 md:p-24 rounded-[3rem] border-zinc-800/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[0.9]">READY TO RECLAIM<br />YOUR TIME?</h2>
                    <p className="text-zinc-400 mb-12 text-xl font-medium">Join thousands of users who have mastered their inbox.</p>
                    <Link
                        href={ctaHref}
                        className="inline-flex items-center gap-2 px-12 py-6 bg-emerald-500 text-zinc-950 text-base rounded-full font-black tracking-widest uppercase hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                    >
                        {ctaLabel}
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-zinc-900 text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <img src="/logo.png" alt="Swipe Logo" className="w-8 h-8 object-contain" />
                    <span className="font-heading font-bold">Swipe</span>
                </div>
                <p className="text-zinc-500 text-sm">© 2026 Swipe Inc. All rights reserved.</p>
            </footer>
        </div>
    );
}
