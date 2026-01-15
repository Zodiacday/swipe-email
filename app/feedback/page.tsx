"use client";

/**
 * Feedback Page - Obsidian Mint Edition
 * Collects user feedback, feature requests, and bug reports
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
    {
        id: "general" as FeedbackType,
        label: "General Feedback",
        icon: MessageSquare,
        color: "zinc",
        description: "Share your thoughts"
    },
    {
        id: "feature" as FeedbackType,
        label: "Feature Request",
        icon: Lightbulb,
        color: "amber",
        description: "What should we build next?"
    },
    {
        id: "bug" as FeedbackType,
        label: "Report a Bug",
        icon: Bug,
        color: "red",
        description: "Something not working?"
    },
    {
        id: "love" as FeedbackType,
        label: "Share the Love",
        icon: Heart,
        color: "pink",
        description: "Tell us what you love!"
    },
];

export default function FeedbackPage() {
    const { data: session } = useSession();
    const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !selectedType) return;

        setIsSubmitting(true);

        // Simulate API call (replace with real endpoint)
        // In production, send to: /api/feedback
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For now, log to console (in production, send to backend/email)
        console.log("Feedback submitted:", {
            type: selectedType,
            message,
            email: session?.user?.email,
            timestamp: new Date().toISOString(),
        });

        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    const handleReset = () => {
        setSelectedType(null);
        setMessage("");
        setIsSubmitted(false);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "amber": return "border-amber-500/30 bg-amber-500/10 text-amber-400";
            case "red": return "border-red-500/30 bg-red-500/10 text-red-400";
            case "pink": return "border-pink-500/30 bg-pink-500/10 text-pink-400";
            default: return "border-zinc-700 bg-zinc-800/50 text-zinc-400";
        }
    };

    const getActiveColor = (type: string) => {
        switch (type) {
            case "amber": return "border-amber-500 bg-amber-500/20 text-amber-300 ring-2 ring-amber-500/30";
            case "red": return "border-red-500 bg-red-500/20 text-red-300 ring-2 ring-red-500/30";
            case "pink": return "border-pink-500 bg-pink-500/20 text-pink-300 ring-2 ring-pink-500/30";
            default: return "border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500/30";
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-24 pb-16 px-6">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-2xl mx-auto relative z-10">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-400 transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>

                <AnimatePresence mode="wait">
                    {isSubmitted ? (
                        /* Success State */
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center py-16"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.1 }}
                                className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
                            >
                                <Check className="w-12 h-12 text-emerald-400" />
                            </motion.div>

                            <h1 className="text-3xl font-black tracking-tighter mb-4">
                                Thank You! 💚
                            </h1>
                            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                                Your feedback means the world to us. We read every message and use it to make Swipe better.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors"
                                >
                                    Send More Feedback
                                </button>
                                <Link
                                    href="/mode-select"
                                    className="px-6 py-3 bg-emerald-500 text-zinc-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Back to App
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
                            {/* Header */}
                            <div className="text-center mb-10">
                                <h1 className="text-4xl font-black tracking-tighter mb-3">
                                    We're All Ears 👂
                                </h1>
                                <p className="text-zinc-400 max-w-md mx-auto">
                                    Help us make Swipe better. Your feedback directly shapes what we build next.
                                </p>
                            </div>

                            {/* Feedback Type Selection */}
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {FEEDBACK_TYPES.map((type) => {
                                    const Icon = type.icon;
                                    const isActive = selectedType === type.id;
                                    return (
                                        <motion.button
                                            key={type.id}
                                            onClick={() => setSelectedType(type.id)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`p-4 rounded-2xl border text-left transition-all ${isActive
                                                    ? getActiveColor(type.color)
                                                    : getTypeColor(type.color)
                                                }`}
                                        >
                                            <Icon className="w-5 h-5 mb-2" />
                                            <div className="font-bold text-sm">{type.label}</div>
                                            <div className="text-xs opacity-60 mt-0.5">{type.description}</div>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Message Form */}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-zinc-400 mb-2">
                                        Your Message
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder={
                                            selectedType === "feature"
                                                ? "I wish Swipe could..."
                                                : selectedType === "bug"
                                                    ? "When I try to... it shows..."
                                                    : selectedType === "love"
                                                        ? "I absolutely love how Swipe..."
                                                        : "Tell us what's on your mind..."
                                        }
                                        rows={6}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>

                                {/* User Info (if logged in) */}
                                {session?.user?.email && (
                                    <div className="mb-6 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">
                                            {session.user.name?.[0] || "?"}
                                        </div>
                                        <div className="text-sm">
                                            <div className="text-zinc-400">Sending as</div>
                                            <div className="text-white font-medium">{session.user.email}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    disabled={!selectedType || !message.trim() || isSubmitting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full py-4 rounded-2xl font-black tracking-widest text-sm uppercase flex items-center justify-center gap-2 transition-all ${selectedType && message.trim()
                                            ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full"
                                        />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send Feedback
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            {/* Footer Note */}
                            <p className="text-center text-zinc-600 text-xs mt-8">
                                We read every message. Seriously.
                                <br />
                                <a href="mailto:hello@swipeemail.com" className="text-emerald-500 hover:underline">
                                    Or email us directly
                                </a>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
