"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Trash2 } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-24 pb-16 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl font-black mb-4">Privacy Policy</h1>
                    <p className="text-zinc-500 mb-8">Last updated: January 9, 2026</p>

                    {/* Key Highlights */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-12">
                        {[
                            { icon: Eye, title: "We don't read your emails", desc: "We only access metadata" },
                            { icon: Lock, title: "We don't store content", desc: "Your data stays on your device" },
                            { icon: Trash2, title: "We don't sell data", desc: "Unlike some competitors" },
                            { icon: Shield, title: "OAuth-only access", desc: "No password storage" },
                        ].map((item, i) => (
                            <div key={i} className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                <item.icon className="w-5 h-5 text-emerald-400 mb-2" />
                                <p className="font-bold text-white text-sm">{item.title}</p>
                                <p className="text-zinc-500 text-xs">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="prose prose-invert prose-zinc max-w-none space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-emerald-400 mb-4">What We Collect</h2>
                            <ul className="text-zinc-400 space-y-2 list-disc list-inside">
                                <li>Email metadata (sender, subject, date) - for sorting and display</li>
                                <li>OAuth access tokens - for email provider authentication</li>
                                <li>Usage statistics - anonymized, for improving the service</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-emerald-400 mb-4">What We DON'T Collect</h2>
                            <ul className="text-zinc-400 space-y-2 list-disc list-inside">
                                <li>Email body content - we never read your emails</li>
                                <li>Attachments - we don't access or store them</li>
                                <li>Your email password - we use OAuth only</li>
                                <li>Personal data beyond your email address and name</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-emerald-400 mb-4">Data Storage</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                Most data processing happens locally on your device. We store minimal data
                                on our servers:
                            </p>
                            <ul className="text-zinc-400 space-y-2 list-disc list-inside mt-4">
                                <li>Account information (email, name, profile picture from OAuth)</li>
                                <li>Subscription status and billing information</li>
                                <li>User preferences and settings</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-emerald-400 mb-4">Third-Party Services</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                We use the following third-party services:
                            </p>
                            <ul className="text-zinc-400 space-y-2 list-disc list-inside mt-4">
                                <li>Google OAuth - for Gmail authentication</li>
                                <li>Microsoft OAuth - for Outlook authentication</li>
                                <li>Stripe/Paddle - for payment processing (if applicable)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-emerald-400 mb-4">Your Rights</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                You have the right to:
                            </p>
                            <ul className="text-zinc-400 space-y-2 list-disc list-inside mt-4">
                                <li>Access your data at any time</li>
                                <li>Request deletion of your account and all associated data</li>
                                <li>Revoke OAuth access through your email provider settings</li>
                                <li>Export your data upon request</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-emerald-400 mb-4">Data Retention</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                We retain your data only as long as necessary to provide the Service.
                                When you delete your account, we delete all associated data within 30 days.
                                Some anonymized, aggregated data may be retained for analytics.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-emerald-400 mb-4">Contact Us</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                Privacy questions? Reach out to{" "}
                                <a href="mailto:privacy@swipeemail.com" className="text-emerald-400 hover:underline">
                                    privacy@swipeemail.com
                                </a>
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
