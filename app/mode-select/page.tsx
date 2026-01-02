"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, LayoutDashboard, ArrowRight } from "lucide-react";

export default function ModeSelectPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-zinc-100 font-sans selection:bg-emerald-500/30">
            <div className="max-w-4xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                        Choose Your Weapon
                    </h1>
                    <p className="text-xl text-zinc-400">
                        How do you want to clean your inbox today?
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Option 1: THE STACK */}
                    <Link href="/swipe" className="group relative block">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="h-[400px] rounded-3xl bg-zinc-900 border border-zinc-800 p-8 flex flex-col items-center justify-between hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-all cursor-pointer overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="mt-8 relative">
                                <div className="w-32 h-40 bg-zinc-800 rounded-xl rotate-[-6deg] absolute top-0 left-0 border border-zinc-700 shadow-xl group-hover:rotate-[-12deg] transition-transform duration-500" />
                                <div className="w-32 h-40 bg-zinc-700 rounded-xl rotate-[6deg] absolute top-0 left-0 border border-zinc-600 shadow-xl group-hover:rotate-[12deg] transition-transform duration-500" />
                                <div className="w-32 h-40 bg-emerald-500 rounded-xl relative z-10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Zap className="w-12 h-12 text-black fill-black" />
                                </div>
                            </div>

                            <div className="text-center mt-8">
                                <h2 className="text-2xl font-bold text-white mb-2">The Stack</h2>
                                <p className="text-zinc-400 text-sm px-8">
                                    Granular review. Swipe through your recent emails one by one. Gamified cleanup.
                                </p>
                                <div className="mt-6 flex items-center justify-center gap-2 text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    ENTER GAME MODE <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Option 2: COMMAND CENTER */}
                    <Link href="/dashboard" className="group relative block">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="h-[400px] rounded-3xl bg-zinc-900 border border-zinc-800 p-8 flex flex-col items-center justify-between hover:border-cyan-500/50 hover:bg-zinc-800/50 transition-all cursor-pointer overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="mt-12 w-full max-w-[200px] relative">
                                {/* Minimap UI */}
                                <div className="bg-zinc-800 rounded-lg p-2 gap-2 grid grid-cols-2 opacity-50 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105">
                                    <div className="h-16 bg-zinc-700 rounded w-full" />
                                    <div className="h-16 bg-zinc-700 rounded w-full" />
                                    <div className="h-16 bg-zinc-700 rounded w-full col-span-2" />
                                </div>
                                <div className="absolute -right-4 -bottom-4 bg-cyan-500 text-black p-3 rounded-xl shadow-lg z-20 group-hover:rotate-12 transition-transform duration-300">
                                    <LayoutDashboard className="w-8 h-8" />
                                </div>
                            </div>

                            <div className="text-center mt-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Command Center</h2>
                                <p className="text-zinc-400 text-sm px-8">
                                    Bulk operations. Group by Sender or Domain. Nuke thousands of emails in seconds.
                                </p>
                                <div className="mt-6 flex items-center justify-center gap-2 text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    OPEN DASHBOARD <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/profile" className="text-zinc-500 hover:text-zinc-300 text-sm underline underline-offset-4 transition-colors">
                        Manage Account & Connections
                    </Link>
                </div>
            </div>
        </div>
    );
}
