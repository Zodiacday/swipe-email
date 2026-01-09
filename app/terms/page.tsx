"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
                    <h1 className="text-4xl font-black mb-8">Terms of Service</h1>
                    <p className="text-zinc-500 mb-8">Last updated: January 9, 2026</p>

                    <div className="prose prose-invert prose-zinc max-w-none space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-emerald-400 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                By accessing or using Swipe ("Service"), you agree to be bound by these Terms of Service.
                                If you do not agree to these terms, please do not use our Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-emerald-400 mb-4">2. Description of Service</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                Swipe is an email management tool that helps users clean and organize their inbox
                                through gesture-based interactions. We provide access to email metadata for the purpose
                                of email management and organization.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-emerald-400 mb-4">3. Privacy & Data</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                We take your privacy seriously. We do not read, store, or sell your email content.
                                We only access email metadata (sender, subject, date) necessary for the Service to function.
                                See our <Link href="/privacy" className="text-emerald-400 hover:underline">Privacy Policy</Link> for details.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-emerald-400 mb-4">4. User Responsibilities</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                You are responsible for maintaining the security of your account and email credentials.
                                You agree not to misuse the Service or attempt to access it through unauthorized means.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-emerald-400 mb-4">5. Subscription & Billing</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                Swipe offers free and paid subscription tiers. Paid subscriptions are billed on a
                                monthly or yearly basis. You may cancel your subscription at any time. Refunds are
                                handled on a case-by-case basis.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-emerald-400 mb-4">6. Limitation of Liability</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                Swipe is provided "as is" without warranties of any kind. We are not liable for any
                                damages arising from the use or inability to use the Service, including any data loss
                                or unauthorized access to your email account.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-emerald-400 mb-4">7. Changes to Terms</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                We may update these Terms from time to time. We will notify users of significant changes
                                via email or in-app notification. Continued use of the Service after changes constitutes
                                acceptance of the new terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-emerald-400 mb-4">8. Contact</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                Questions about these Terms? Contact us at{" "}
                                <a href="mailto:hello@swipeemail.com" className="text-emerald-400 hover:underline">
                                    hello@swipeemail.com
                                </a>
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
