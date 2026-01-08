"use client";

import { motion } from "framer-motion";
import { Trophy, RefreshCw, LayoutDashboard, Star } from "lucide-react";
import Link from "next/link";
import { Particles } from "./ui/particles";
import { useEffect, useState } from "react";

interface InboxZeroProps {
    stats: {
        trashed: number;
        kept: number;
        reviewed: number;
    };
    onRefresh: () => void;
}

export function InboxZero({ stats, onRefresh }: InboxZeroProps) {
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    const confettiColors = ["#10b981", "#34d399", "#059669", "#ffffff"];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <Particles quantity={60} className="pointer-events-none opacity-40" color="#10b981" />

            {/* Confetti Animation */}
            {showConfetti && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-sm"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: "-20px",
                                background: confettiColors[i % confettiColors.length],
                            }}
                            initial={{ y: 0, rotate: 0, opacity: 1 }}
                            animate={{
                                y: 1000,
                                rotate: Math.random() * 720,
                                opacity: [1, 1, 0],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                delay: i * 0.1,
                                ease: "easeIn",
                            }}
                        />
                    ))}
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 max-w-lg w-full p-8 text-center"
            >
                {/* Trophy Icon */}
                <motion.div
                    className="w-24 h-24 mx-auto mb-8 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                    initial={{ rotate: -20, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                >
                    <Trophy size={48} className="text-zinc-950 fill-current" />
                </motion.div>

                <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white mb-4 uppercase italic leading-none">
                    INBOX.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 not-italic">ZERO.</span>
                </h1>

                <p className="text-xl text-zinc-400 font-medium mb-12">
                    You're a legend. Time to touch grass.
                </p>

                {/* Session Stats */}
                <div className="grid grid-cols-2 gap-4 mb-12">
                    <div className="glass p-6 rounded-3xl border-zinc-800/50">
                        <div className="text-4xl font-black text-rose-500 mb-1">{stats.trashed}</div>
                        <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500">Emails Nuked ✗</div>
                    </div>
                    <div className="glass p-6 rounded-3xl border-zinc-800/50">
                        <div className="text-4xl font-black text-emerald-500 mb-1">{stats.kept}</div>
                        <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500">Emails Kept ✓</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={onRefresh}
                        className="flex-1 py-5 bg-emerald-500 text-zinc-950 font-black tracking-widest uppercase text-sm rounded-full hover:bg-emerald-400 transition-all active:scale-95 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Refresh Inbox
                    </button>
                    <Link
                        href="/dashboard"
                        className="flex-1 py-5 bg-zinc-900 border border-zinc-800 text-zinc-100 font-black tracking-widest uppercase text-sm rounded-full hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <LayoutDashboard className="w-5 h-5 text-emerald-500" />
                        Command Center
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
