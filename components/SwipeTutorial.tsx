"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Trash2, Shield } from "lucide-react";

interface SwipeTutorialProps {
    isOpen: boolean;
    onDismiss: () => void;
}

/**
 * Swipe Tutorial Overlay
 * Part of the "Obsidian Emerald" UI Unification
 */
export function SwipeTutorial({ isOpen, onDismiss }: SwipeTutorialProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] glass flex items-center justify-center p-6 text-center"
                >
                    <div className="max-w-md w-full relative">
                        {/* Title Section */}
                        <div className="mb-12">
                            <h1 className="text-4xl font-black tracking-tight text-white mb-4">MASTER THE SWIPE</h1>
                            <p className="text-zinc-400 font-medium">Clear your inbox with lightning speed.</p>
                        </div>

                        {/* Gesture Grid */}
                        <div className="grid grid-cols-2 gap-8 mb-12">
                            {/* Left: Trash */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                                    <ArrowLeft className="w-8 h-8 text-red-400" />
                                </div>
                                <div>
                                    <div className="font-black tracking-tight text-red-400 uppercase text-[10px] mb-1">Swipe Left</div>
                                    <div className="text-sm font-bold text-white uppercase tracking-widest">TRASH</div>
                                </div>
                            </motion.div>

                            {/* Right: Keep */}
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                    <ArrowRight className="w-8 h-8 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="font-black tracking-tight text-emerald-400 uppercase text-[10px] mb-1">Swipe Right</div>
                                    <div className="text-sm font-bold text-white uppercase tracking-widest">KEEP</div>
                                </div>
                            </motion.div>

                            {/* Up: Unsubscribe */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                                    <ArrowUp className="w-8 h-8 text-orange-400" />
                                </div>
                                <div>
                                    <div className="font-black tracking-tight text-orange-400 uppercase text-[10px] mb-1">Swipe Up</div>
                                    <div className="text-sm font-bold text-white uppercase tracking-widest">UNSUB</div>
                                </div>
                            </motion.div>

                            {/* Down: Skip */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-zinc-500/20 flex items-center justify-center border border-zinc-500/30">
                                    <ArrowDown className="w-8 h-8 text-zinc-400" />
                                </div>
                                <div>
                                    <div className="font-black tracking-tight text-zinc-400 uppercase text-[10px] mb-1">Swipe Down</div>
                                    <div className="text-sm font-bold text-white uppercase tracking-widest">SKIP IT</div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Bulk Action Tip */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 mb-12 flex items-start gap-4 text-left"
                        >
                            <Zap className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[10px] font-black tracking-widest text-emerald-400 uppercase mb-2">Elite Tip</div>
                                <p className="text-sm text-zinc-300 leading-relaxed">
                                    Cleaning a huge stack? We'll automatically detect multiple emails from the same sender and offer to <span className="text-white font-bold">Nuke them all</span> at once.
                                </p>
                            </div>
                        </motion.div>

                        {/* CTA */}
                        <button
                            onClick={onDismiss}
                            className="w-full py-5 bg-emerald-500 text-zinc-950 font-black tracking-widest uppercase text-sm rounded-full hover:bg-emerald-400 transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
                        >
                            LET'S CLEAN ✓
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
