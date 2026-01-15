"use client";

/**
 * Obsidian Mint Landing Page - Streamlined Version
 * 9 sections, optimized for conversion
 * Order: Hero → Stats+Trust → How → Modes → Pricing → Testimonials → FAQ → CTA → Footer
 */

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Zap, LayoutDashboard, Target } from "lucide-react";
import { Particles, Meteors } from "@/components/ui";
import { HeroDemo } from "@/components/HeroDemo/HeroDemo";
import { useSession } from "next-auth/react";
import { LandingPageSchemas } from "@/components/seo/JsonLd";

export default function Home() {
    const { data: session } = useSession();
    const [isYearly, setIsYearly] = useState(false);

    const ctaHref = session ? "/mode-select" : "/login";
    const ctaLabel = session ? "Go to App" : "Start Free";

    return (
        <>
            {/* JSON-LD Structured Data for SEO */}
            <LandingPageSchemas />

            <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden relative font-sans selection:bg-emerald-500/30">
                {/* Ambient background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
                </div>
                <Particles quantity={40} className="pointer-events-none opacity-30" color="#10b981" />
                <Meteors number={10} className="pointer-events-none opacity-20" />

                {/* ═══════════════════════════════════════════════════════════════
                SECTION 1: HERO
            ═══════════════════════════════════════════════════════════════ */}
                <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-20 px-4 sm:px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-20">
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
                                The privacy-first inbox cleaner that's actually fun to use.
                            </motion.p>

                            <motion.div
                                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Link
                                    href={ctaHref}
                                    className="w-full sm:w-auto px-10 py-5 bg-emerald-500 text-zinc-950 font-black tracking-widest text-sm rounded-full hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.2)] group active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                                >
                                    {ctaLabel}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="#pricing"
                                    className="w-full sm:w-auto px-10 py-5 border border-zinc-800 text-white font-black tracking-widest text-sm rounded-full hover:bg-zinc-900 transition-all flex items-center justify-center active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                >
                                    SEE PRICING
                                </Link>
                            </motion.div>
                        </div>

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

                {/* ═══════════════════════════════════════════════════════════════
                SECTION 2: STATS + TRUST BADGES (merged)
            ═══════════════════════════════════════════════════════════════ */}
                <section className="py-12 px-6 border-t border-zinc-900">
                    <div className="max-w-5xl mx-auto">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8">
                            {[
                                { value: "1.2M+", label: "Emails Cleaned", icon: "📧" },
                                { value: "12K+", label: "Happy Users", icon: "👥" },
                                { value: "50K+", label: "Hours Saved", icon: "⏱️" },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="text-center p-4"
                                >
                                    <div className="text-2xl md:text-4xl font-black tracking-tighter text-white mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium flex items-center justify-center gap-2">
                                        <span>{stat.icon}</span>
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20">
                                <span className="text-sm">🔒</span>
                                <span className="text-[10px] font-bold text-emerald-400 tracking-wide">No Data Sold</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/20">
                                <span className="text-sm">🛡️</span>
                                <span className="text-[10px] font-bold text-blue-400 tracking-wide">Metadata Only</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/5 border border-purple-500/20">
                                <span className="text-sm">🇪🇺</span>
                                <span className="text-[10px] font-bold text-purple-400 tracking-wide">GDPR</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/20">
                                <span className="text-sm">⚡</span>
                                <span className="text-[10px] font-bold text-amber-400 tracking-wide">OAuth 2.0</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                SECTION 3: HOW IT WORKS
            ═══════════════════════════════════════════════════════════════ */}
                <section className="py-16 px-6 border-t border-zinc-900 bg-zinc-950/50">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-3">
                                3 Steps to <span className="text-emerald-500">Freedom</span>
                            </h2>
                            <p className="text-zinc-500">From cluttered to clean in under 2 minutes</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 relative">
                            <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0" />

                            {[
                                { step: "01", title: "Connect", desc: "Link your email in 30 seconds. We never see your password.", icon: "🔗" },
                                { step: "02", title: "Swipe or Nuke", desc: "Tinder-like swipes for fun, or bulk nuke for speed.", icon: "⚡" },
                                { step: "03", title: "Enjoy Peace", desc: "Watch your inbox shrink. Feel the dopamine.", icon: "🧘" },
                            ].map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="relative text-center p-6"
                                >
                                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-zinc-900 border-2 border-emerald-500/30 flex items-center justify-center relative z-10">
                                        <span className="text-xl">{step.icon}</span>
                                    </div>
                                    <div className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-1">Step {step.step}</div>
                                    <h3 className="text-xl font-black tracking-tight mb-2">{step.title}</h3>
                                    <p className="text-zinc-400 text-sm">{step.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                SECTION 4: TWO MODES
            ═══════════════════════════════════════════════════════════════ */}
                <section className="py-16 px-6 border-t border-zinc-900">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-3">
                                Two Ways to <span className="text-emerald-500">Dominate</span>
                            </h2>
                            <p className="text-zinc-500">Gamified swipes for fun, or bulk nukes for power users.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Swipe Mode */}
                            <motion.div
                                whileHover={{ y: -4 }}
                                className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                                    <Zap className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-black mb-2">The Swipe</h3>
                                <p className="text-zinc-400 text-sm mb-4">Tinder for your inbox. Swipe left to trash, right to keep.</p>
                                <div className="bg-zinc-900 rounded-xl p-3 flex items-center justify-center gap-6">
                                    <div className="text-center">
                                        <div className="text-xl text-red-400">←</div>
                                        <div className="text-[9px] text-zinc-500">TRASH</div>
                                    </div>
                                    <div className="w-10 h-12 rounded-lg bg-zinc-800 border border-zinc-700" />
                                    <div className="text-center">
                                        <div className="text-xl text-emerald-400">→</div>
                                        <div className="text-[9px] text-zinc-500">KEEP</div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Dashboard */}
                            <motion.div
                                whileHover={{ y: -4 }}
                                className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                                    <LayoutDashboard className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-black mb-2">Dashboard</h3>
                                <p className="text-zinc-400 text-sm mb-4">Manage all senders in one place. Bulk actions made easy.</p>
                                <div className="bg-zinc-900 rounded-xl p-3 space-y-1.5">
                                    {[
                                        { name: "spam@newsletter.co", count: 127, hot: true },
                                        { name: "promo@deals.io", count: 56, hot: false },
                                    ].map((s, i) => (
                                        <div key={i} className="flex justify-between text-xs">
                                            <span className="text-zinc-400 truncate">{s.name}</span>
                                            <span className={s.hot ? "text-red-400" : "text-zinc-500"}>{s.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                SECTION 5: PRICING (moved up!)
            ═══════════════════════════════════════════════════════════════ */}
                <section id="pricing" className="py-20 px-6 border-t border-zinc-900 bg-zinc-950/50">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-3">
                                Simple Pricing. <span className="text-emerald-500">No BS.</span>
                            </h2>
                            <p className="text-zinc-500">Other tools charge $10/mo and sell your data. We don't.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
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
                                        "Basic categories",
                                        "Email support",
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
                                <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-full">
                                    Most Popular
                                </div>
                                <div className="mb-6">
                                    <h3 className="text-2xl font-black text-emerald-400 mb-2">Pro</h3>

                                    {/* Billing Toggle */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <button
                                            onClick={() => setIsYearly(false)}
                                            className={`text-sm font-bold ${!isYearly ? 'text-white' : 'text-zinc-500'}`}
                                        >
                                            Monthly
                                        </button>
                                        <button
                                            onClick={() => setIsYearly(!isYearly)}
                                            className={`w-12 h-6 rounded-full relative transition-colors ${isYearly ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                                        >
                                            <div
                                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isYearly ? 'left-7' : 'left-1'}`}
                                            />
                                        </button>
                                        <button
                                            onClick={() => setIsYearly(true)}
                                            className={`text-sm font-bold ${isYearly ? 'text-white' : 'text-zinc-500'}`}
                                        >
                                            Yearly
                                        </button>
                                        {isYearly && (
                                            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                                                Save 45%
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-white">
                                            {isYearly ? '$39' : '$5.99'}
                                        </span>
                                        <span className="text-zinc-500">
                                            {isYearly ? '/year' : '/month'}
                                        </span>
                                    </div>
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

                            {/* Teams/Agency Tier */}
                            <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 relative">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-black mb-2">Teams</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black">Custom</span>
                                    </div>
                                </div>
                                <p className="text-zinc-400 mb-8">For agencies & larger teams</p>
                                <ul className="space-y-4 mb-8">
                                    {[
                                        "Everything in Pro",
                                        "Shared team inboxes",
                                        "Admin dashboard",
                                        "Priority onboarding",
                                        "Dedicated support",
                                    ].map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-zinc-300">
                                            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                                                <span className="text-emerald-400 text-xs">✓</span>
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <a
                                    href="mailto:hello@swipeemail.com"
                                    className="block w-full py-4 text-center bg-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-700 transition-colors"
                                >
                                    Contact Us
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                SECTION 6: TESTIMONIALS
            ═══════════════════════════════════════════════════════════════ */}
                <section className="py-16 px-6 border-t border-zinc-900">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-3">
                                Loved by <span className="text-emerald-500">Inbox Warriors</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            {[
                                { quote: "The swipe gestures are actually addicting.", name: "Sarah K.", role: "Marketing Director" },
                                { quote: "Cleaned 3 years of spam in 20 minutes.", name: "Marcus T.", role: "Startup Founder" },
                                { quote: "Unlike Unroll.me, they actually respect privacy.", name: "Alex D.", role: "Engineer" },
                            ].map((t, i) => (
                                <div key={i} className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                                    <div className="flex gap-0.5 mb-3 text-emerald-400 text-sm">★★★★★</div>
                                    <p className="text-zinc-300 text-sm mb-4 italic">"{t.quote}"</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{t.name}</p>
                                            <p className="text-zinc-500 text-xs">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                SECTION 7: FAQ (collapsed by default)
            ═══════════════════════════════════════════════════════════════ */}
                <section className="py-16 px-6 border-t border-zinc-900 bg-zinc-950/50">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black tracking-tighter mb-2">
                                Got <span className="text-emerald-500">Questions?</span>
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {[
                                { q: "Do you read my emails?", a: "No. We only access metadata (sender, subject). Never email content." },
                                { q: "Is my data sold?", a: "Never. We don't sell your data. Our revenue comes from Pro subscriptions." },
                                { q: "Can I cancel anytime?", a: "Yes. Cancel in 2 clicks. No retention tricks." },
                                { q: "What permissions do you need?", a: "gmail.readonly and gmail.modify (to trash emails). We can't delete permanently." },
                            ].map((faq, i) => (
                                <details key={i} className="group p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 cursor-pointer">
                                    <summary className="flex items-center justify-between font-bold text-white text-sm list-none">
                                        <span>{faq.q}</span>
                                        <span className="text-emerald-500 group-open:rotate-45 transition-transform">+</span>
                                    </summary>
                                    <p className="mt-3 text-zinc-400 text-sm">{faq.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                SECTION 8: FINAL CTA
            ═══════════════════════════════════════════════════════════════ */}
                <section className="py-20 px-6">
                    <div className="max-w-2xl mx-auto text-center glass p-12 md:p-16 rounded-[2rem] border-zinc-800/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 leading-tight">
                            READY TO RECLAIM<br />YOUR TIME?
                        </h2>
                        <p className="text-zinc-400 mb-8">Join thousands who have mastered their inbox.</p>
                        <Link
                            href={ctaHref}
                            className="inline-flex items-center gap-2 px-10 py-5 bg-emerald-500 text-zinc-950 rounded-full font-black tracking-widest uppercase hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                        >
                            {ctaLabel}
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                SECTION 9: FOOTER
            ═══════════════════════════════════════════════════════════════ */}
                <footer className="py-8 px-6 border-t border-zinc-900">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Image src="/logo.png" alt="Swipe" width={24} height={24} className="object-contain" />
                                <span className="font-bold">Swipe</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <Link href="/terms" className="text-zinc-500 hover:text-emerald-400 transition-colors">Terms</Link>
                                <Link href="/privacy" className="text-zinc-500 hover:text-emerald-400 transition-colors">Privacy</Link>
                                <Link href="/feedback" className="text-zinc-500 hover:text-emerald-400 transition-colors">Feedback</Link>
                                <a href="mailto:hello@swipeemail.com" className="text-zinc-500 hover:text-emerald-400 transition-colors">Contact</a>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-zinc-900 text-center">
                            <p className="text-zinc-500 text-xs">© 2026 Swipe Inc. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
