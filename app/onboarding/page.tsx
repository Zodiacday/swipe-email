/**
 * Onboarding Flow - Obsidian Mint Edition
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail,
    Inbox,
    Zap,
    Shield,
    Check,
    Trash2,
    MailX,
    Ban,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { PermissionGuard, PermissionStatus } from "@/lib/security/PermissionGuard";
import { DemoSwipeCard } from "@/components/DemoSwipeCard";

type OnboardingStage =
    | "welcome"
    | "problem"
    | "promise"
    | "safety"
    | "connect"
    | "tutorial"
    | "first_cleanup";

export default function OnboardingPage() {
    const { data: session } = useSession();
    const [stage, setStage] = useState<OnboardingStage>("welcome");
    const [tutorialStep, setTutorialStep] = useState(0);
    const router = useRouter();

    useEffect(() => {
        if (session) {
            // User is authenticated, skip ahead to tutorial if they aren't deep in the flow
            // This handles the specialized callback redirect from the OAuth provider
            if (stage === "welcome" || stage === "connect" || stage === "safety" || stage === "problem" || stage === "promise") {
                setStage("tutorial");
            }
        }
    }, [session, stage]);

    const nextStage = () => {
        const stages: OnboardingStage[] = [
            "welcome",
            "problem",
            "promise",
            "safety",
            "connect",
            "tutorial",
            "first_cleanup",
        ];
        const currentIndex = stages.indexOf(stage);
        if (currentIndex < stages.length - 1) {
            setStage(stages[currentIndex + 1]);
        } else {
            router.push("/mode-select");
        }
    };

    const skipToSwipe = () => {
        router.push("/mode-select");
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] overflow-hidden font-body pt-[var(--navbar-height)]">
            {/* Skip button - repositioned to avoid navbar */}
            <button
                onClick={skipToSwipe}
                className="fixed top-24 right-6 z-40 px-4 py-2 text-xs font-medium uppercase tracking-widest text-zinc-500 hover:text-emerald-400 transition-colors bg-zinc-950/80 backdrop-blur-sm rounded-full border border-zinc-800"
            >
                Skip
            </button>

            <AnimatePresence mode="wait">
                {stage === "welcome" && (
                    <WelcomeStage key="welcome" onNext={nextStage} />
                )}
                {stage === "problem" && (
                    <ProblemStage key="problem" onNext={nextStage} />
                )}
                {stage === "promise" && (
                    <PromiseStage key="promise" onNext={nextStage} />
                )}
                {stage === "safety" && <SafetyStage key="safety" onNext={nextStage} />}
                {stage === "connect" && (
                    <ConnectStage key="connect" onNext={nextStage} />
                )}
                {stage === "tutorial" && (
                    <TutorialStage
                        key="tutorial"
                        step={tutorialStep}
                        onStepComplete={() => setTutorialStep((s) => s + 1)}
                        onNext={nextStage}
                    />
                )}
                {stage === "first_cleanup" && (
                    <FirstCleanupStage key="first_cleanup" onNext={nextStage} />
                )}
            </AnimatePresence>

            {/* Progress indicator - repositioned with background */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-zinc-950/80 backdrop-blur-sm rounded-full border border-zinc-800">
                {["welcome", "problem", "promise", "safety", "connect", "tutorial", "first_cleanup"].map(
                    (s, i) => (
                        <div
                            key={s}
                            className={`h-1.5 rounded-full transition-all duration-500 ${s === stage
                                ? "w-6 bg-emerald-500"
                                : "w-1.5 bg-zinc-700"
                                }`}
                        />
                    )
                )}
            </div>
        </div>
    );
}


// Stage 1: Welcome - The Feeling
function WelcomeStage({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-6 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="max-w-2xl">
                {/* Animated inbox transformation */}
                <motion.div
                    className="mb-10 relative w-32 h-32 mx-auto"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                >
                    {/* Cluttered state */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                    >
                        <div className="relative">
                            <Inbox className="w-24 h-24 text-zinc-700" />
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-black text-xs">
                                99+
                            </div>
                        </div>
                    </motion.div>

                    {/* Clean state with whoosh */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 1.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 2, duration: 0.5, type: "spring" }}
                    >
                        <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                            <Check className="w-12 h-12 text-zinc-950" />
                        </div>
                    </motion.div>
                </motion.div>

                <motion.h1
                    className="text-5xl md:text-6xl font-heading font-black mb-6 tracking-tighter"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.5 }}
                >
                    That feeling?
                </motion.h1>

                <motion.p
                    className="text-2xl text-emerald-400 font-bold mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3 }}
                >
                    You can have it in 2 minutes.
                </motion.p>

                <motion.p
                    className="text-lg text-zinc-500 mb-12 max-w-lg mx-auto leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.5 }}
                >
                    Not someday. Right now.
                </motion.p>

                <motion.button
                    onClick={onNext}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 4 }}
                    className="px-10 py-5 bg-emerald-500 text-zinc-950 text-xl font-black tracking-tight rounded-full hover:bg-emerald-400 transition-all flex items-center gap-3 mx-auto shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                    Show Me How
                    <ArrowRight className="w-6 h-6" />
                </motion.button>
            </div>
        </motion.div>
    );
}

// Stage 2: The Problem - Stats Hook
function ProblemStage({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-6 text-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="max-w-2xl">
                {/* Stats counter animation */}
                <motion.div
                    className="grid grid-cols-3 gap-6 mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-black text-red-400">47</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest">Avg. Newsletters</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-black text-amber-400">23</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest">Promo Emails</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-black text-zinc-400">15h</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest">Wasted/Month</div>
                    </div>
                </motion.div>

                <motion.h2
                    className="text-4xl md:text-5xl font-heading font-black mb-6 tracking-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    The average user?
                </motion.h2>

                <motion.p
                    className="text-xl text-zinc-400 mb-8 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <span className="text-white font-bold">47 emails cleared in first session.</span>
                    <br />Under 2 minutes.
                </motion.p>

                <motion.button
                    onClick={onNext}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="px-10 py-5 bg-white text-zinc-950 text-lg font-black rounded-full hover:bg-zinc-200 transition-all flex items-center gap-3 mx-auto shadow-xl active:scale-95"
                >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                </motion.button>
            </div>
        </motion.div>
    );
}

// Stage 3: The Promise
function PromiseStage({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-6 text-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="max-w-4xl">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-10 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <Zap className="w-10 h-10 text-black fill-current" />
                </div>

                <h2 className="text-5xl font-heading font-black mb-12 tracking-tight">
                    Clean with <span className="text-emerald-500">Gestures.</span>
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {[
                        { icon: Trash2, text: "Delete", color: "text-red-500", bg: "bg-red-500/5" },
                        { icon: MailX, text: "Unsub", color: "text-blue-500", bg: "bg-blue-500/5" },
                        { icon: Ban, text: "Block", color: "text-orange-500", bg: "bg-orange-500/5" },
                        { icon: Check, text: "Keep", color: "text-emerald-500", bg: "bg-emerald-500/5" },
                    ].map((action, i) => (
                        <div key={i} className={`p-6 rounded-3xl border border-zinc-900 ${action.bg}`}>
                            <action.icon className={`w-8 h-8 ${action.color} mx-auto mb-3`} />
                            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">{action.text}</p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onNext}
                    className="px-12 py-5 bg-emerald-500 text-black text-xl font-bold rounded-full hover:bg-emerald-400 transition-all"
                >
                    Experience The UI
                </button>
            </div>
        </motion.div>
    );
}

// Stage 4: Safety & Trust
function SafetyStage({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <div className="max-w-3xl w-full">
                <div className="text-center mb-16">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-5xl font-heading font-black mb-4">Privacy by Design.</h2>
                    <p className="text-zinc-500 text-lg">We process metadata, never your secrets.</p>
                </div>

                <div className="space-y-4 mb-16">
                    {[
                        { title: "Zero-Read Policy", desc: "Swipe never interacts with the body of your emails. Only headers." },
                        { title: "End-to-End Control", desc: "Every action is stored locally and synced via secure OAuth tokens." },
                        { title: "Immediate Undo", desc: "Change your mind? Swipe back or click undo within 30 seconds." },
                    ].map((item, i) => (
                        <div key={i} className="p-6 rounded-[32px] bg-zinc-950 border border-zinc-900 flex items-start gap-4">
                            <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Check className="w-3 h-3 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onNext}
                    className="w-full py-5 bg-white text-black text-xl font-bold rounded-full hover:bg-zinc-200 transition-all"
                >
                    I Authorize Access
                </button>
            </div>
        </motion.div>
    );
}

// Stage 5: Connect
function ConnectStage({ onNext }: { onNext: () => void }) {
    const { data: session } = useSession();
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectError, setConnectError] = useState<string | null>(null);

    const handleConnect = async () => {
        setIsConnecting(true);
        setConnectError(null);
        try {
            // Trigger real authentication flow
            // The callbackUrl ensures they return here to complete the tutorial
            await signIn("google", { callbackUrl: "/onboarding" });
        } catch (error) {
            console.error("Sign in failed:", error);
            setConnectError("Failed to connect. Please try again.");
            setIsConnecting(false);
        }
    };

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="max-w-md w-full">
                <h2 className="text-4xl font-heading font-black mb-8">Establish Connection.</h2>

                <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[32px] mb-8 shadow-xl">
                    {!session ? (
                        <>
                            <div className="flex justify-center gap-6 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer border border-blue-500/20 active:scale-95">
                                    <div className="text-2xl font-black text-blue-500">G</div>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer border border-sky-500/20 active:scale-95">
                                    <div className="text-2xl font-black text-sky-500">O</div>
                                </div>
                            </div>
                            <p className="text-zinc-500 text-sm mb-6">Connect your primary provider to begin indexing your inbox metadata.</p>
                            {connectError && (
                                <p className="text-red-400 text-sm mb-4">{connectError}</p>
                            )}
                            <button
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50"
                            >
                                {isConnecting ? "Connecting..." : "OAuth Secure Login"}
                            </button>
                        </>
                    ) : (
                        <div className="text-left space-y-6">
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                                <Check className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm font-bold text-emerald-500">Authentication Successful</span>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Connected Account</p>
                                <p className="text-sm text-zinc-300">{session.user?.email}</p>
                            </div>

                            <button
                                onClick={onNext}
                                className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all"
                            >
                                Initialize Swipe Engine
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-[10px] text-zinc-600 uppercase font-medium tracking-[0.2em]">
                    🔒 Your data never leaves your device.
                </p>
            </div>
        </motion.div>
    );
}

// Stage 6: Tutorial - Interactive Demo Swipe
function TutorialStage({
    step,
    onStepComplete,
    onNext,
}: {
    step: number;
    onStepComplete: () => void;
    onNext: () => void;
}) {
    const [demoComplete, setDemoComplete] = useState(false);

    const handleDemoComplete = () => {
        setDemoComplete(true);
    };

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="max-w-lg">
                <div className="mb-6 text-xs font-black uppercase tracking-[0.3em] text-emerald-500">
                    Try it yourself
                </div>

                <h2 className="text-4xl md:text-5xl font-heading font-black mb-4 tracking-tighter">
                    Practice Swiping
                </h2>

                <p className="text-zinc-500 mb-12">
                    Swipe left to trash, right to keep
                </p>

                {/* Demo swipe card */}
                <div className="flex justify-center mb-16">
                    <DemoSwipeCard onComplete={handleDemoComplete} />
                </div>

                {/* Continue button - only shows after completing demo */}
                <motion.button
                    onClick={onNext}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: demoComplete ? 1 : 0.3 }}
                    disabled={!demoComplete}
                    className={`
                        px-12 py-5 font-bold rounded-full uppercase tracking-widest text-sm transition-all
                        ${demoComplete
                            ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 cursor-pointer"
                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        }
                    `}
                >
                    {demoComplete ? "I'm Ready!" : "Complete the demo"}
                </motion.button>
            </div>
        </motion.div>
    );
}

// Stage 7: First Cleanup
function FirstCleanupStage({ onNext }: { onNext: () => void }) {
    const [scanProgress, setScanProgress] = useState(0);
    const [emailCount, setEmailCount] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setScanProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsComplete(true);
                    return 100;
                }
                const increment = Math.random() * 5;
                const next = prev + increment;
                setEmailCount(Math.floor(next * 24.51)); // Target ~2451
                return next;
            });
        }, 150);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="max-w-2xl w-full">
                <AnimatePresence mode="wait">
                    {!isComplete ? (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="space-y-12"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full font-bold uppercase tracking-widest text-xs animate-pulse">
                                Indexing Inbox Metadata...
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-7xl font-heading font-black tracking-tighter tabular-nums text-white">
                                    {emailCount.toLocaleString()}
                                </h2>
                                <p className="text-zinc-500 font-medium uppercase tracking-[0.2em] text-xs">Emails Indexed</p>
                            </div>

                            <div className="max-w-md mx-auto h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    className="h-full bg-emerald-500 glow-emerald"
                                    animate={{ width: `${scanProgress}%` }}
                                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-12"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black rounded-full font-bold uppercase tracking-widest text-xs">
                                Initialization Complete
                            </div>
                            <h2 className="text-7xl font-heading font-black tracking-tighter text-white uppercase italic">
                                Targets <span className="text-emerald-500">Acquired.</span>
                            </h2>
                            <p className="text-xl text-zinc-500 max-w-lg mx-auto leading-relaxed">
                                We found <span className="text-white font-black">{emailCount.toLocaleString()}</span> items of baggage.
                                It&apos;s time to clear the slate.
                            </p>

                            <button
                                onClick={onNext}
                                className="group relative px-16 py-6 bg-emerald-500 text-black text-2xl font-black rounded-full hover:bg-emerald-400 transition-all shadow-[0_0_50px_rgba(16,185,129,0.3)]"
                            >
                                <span className="relative z-10">PURGE INBOX</span>
                                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:animate-ping pointer-events-none" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
