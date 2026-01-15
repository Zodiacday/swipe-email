"use client";

/**
 * Feedback Page - Premium Minimal Redesign
 * Ultra-spacious, clean, Linear/Raycast-inspired
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare,
    Lightbulb,
    Bug,
    Heart,
    Send,
    Check,
    ArrowLeft,
    Sparkles
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type FeedbackType = "general" | "feature" | "bug" | "love";

const FEEDBACK_TYPES = [
    { id: "general" as FeedbackType, label: "General", icon: MessageSquare, colors: "bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-600", activeColors: "bg-zinc-700 text-white border-zinc-500 ring-2 ring-zinc-500/30" },
    { id: "feature" as FeedbackType, label: "Feature", icon: Lightbulb, colors: "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:border-amber-500/50", activeColors: "bg-amber-500/20 text-amber-300 border-amber-500 ring-2 ring-amber-500/30" },
    { id: "bug" as FeedbackType, label: "Bug", icon: Bug, colors: "bg-red-500/10 text-red-400 border-red-500/30 hover:border-red-500/50", activeColors: "bg-red-500/20 text-red-300 border-red-500 ring-2 ring-red-500/30" },
    { id: "love" as FeedbackType, label: "Love", icon: Heart, colors: "bg-pink-500/10 text-pink-400 border-pink-500/30 hover:border-pink-500/50", activeColors: "bg-pink-500/20 text-pink-300 border-pink-500 ring-2 ring-pink-500/30" },
];

export default function FeedbackPage() {
    const { data: session } = useSession();
    const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !selectedType) return;

        setIsSubmitting(true);
        try {
            setSubmitError(null);
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: selectedType,
                    message: message.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit feedback");
            }

            setIsSubmitted(true);
        } catch (error: any) {
            console.error("Feedback error:", error);
            setSubmitError(error.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setSelectedType(null);
        setMessage("");
        setIsSubmitted(false);
        setSubmitError(null);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            {/* Subtle background glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-[150px]" />
            </div>

            <div className="relative z-10 max-w-xl mx-auto px-6 pt-32 pb-20">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm mb-16"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>

                <AnimatePresence mode="wait">
                    {isSubmitted ? (
                        /* Success State */
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.1 }}
                                className="w-20 h-20 mx-auto mb-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center"
                            >
                                <Check className="w-10 h-10 text-emerald-400" />
                            </motion.div>

                            <h1 className="text-3xl font-semibold tracking-tight mb-4">
                                Thank you
                            </h1>
                            <p className="text-zinc-500 mb-12 max-w-sm mx-auto leading-relaxed">
                                Your feedback helps us build a better product. We read every message.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={handleReset}
                                    className="px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                                >
                                    Send more feedback
                                </button>
                                <Link
                                    href="/mode-select"
                                    className="px-5 py-2.5 bg-emerald-500 text-zinc-950 text-sm font-semibold rounded-full hover:bg-emerald-400 transition-colors inline-flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Back to app
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        /* Form State */
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Heading */}
                            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-center mb-16">
                                Tell us what you{" "}
                                <span className="text-emerald-400">think</span>
                            </h1>

                            {/* Feedback Type Pills */}
                            <div className="flex flex-wrap justify-center gap-3 mb-12">
                                {FEEDBACK_TYPES.map((type) => {
                                    const Icon = type.icon;
                                    const isActive = selectedType === type.id;
                                    return (
                                        <motion.button
                                            key={type.id}
                                            onClick={() => setSelectedType(prev => prev === type.id ? null : type.id)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-all inline-flex items-center gap-2 ${isActive ? type.activeColors : type.colors
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {type.label}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Message Form */}
                            <form onSubmit={handleSubmit}>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Share your thoughts, ideas, or report issues here..."
                                    rows={6}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all text-[15px] leading-relaxed"
                                />

                                {/* Sending as (if logged in) */}
                                {session?.user?.email && (
                                    <p className="text-zinc-600 text-sm mt-4 text-center">
                                        Sending as {session.user.email}
                                    </p>
                                )}

                                {/* Error Display */}
                                {submitError && (
                                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                                        {submitError}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="mt-10 flex justify-center">
                                    <motion.button
                                        type="submit"
                                        disabled={!selectedType || !message.trim() || isSubmitting}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`px-8 py-3.5 rounded-full text-sm font-semibold transition-all inline-flex items-center gap-2 ${selectedType && message.trim()
                                            ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full"
                                            />
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Send Feedback
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </form>

                            {/* Footer */}
                            <p className="text-center text-zinc-600 text-sm mt-16">
                                Or email us at{" "}
                                <a href="mailto:hello@swipeemail.com" className="text-emerald-500 hover:underline">
                                    hello@swipeemail.com
                                </a>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
