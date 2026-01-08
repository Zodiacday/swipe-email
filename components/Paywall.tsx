"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Crown, Clock, Zap, X } from "lucide-react";
import { useFreemium } from "@/hooks/useFreemium";

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade?: () => void;
}

export function PaywallModal({ isOpen, onClose, onUpgrade }: PaywallModalProps) {
    const { timeUntilReset } = useFreemium();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-zinc-950 border border-emerald-500/20 rounded-[32px] p-10 z-50 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Crown icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.1 }}
                            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-xl"
                        >
                            <Crown className="w-10 h-10 text-zinc-950" />
                        </motion.div>

                        <h2 className="text-2xl font-black text-center mb-2">
                            You've Hit Your Limit!
                        </h2>

                        <p className="text-zinc-400 text-center mb-6">
                            You've used all 50 free swipes for today.
                            <br />
                            Upgrade to Pro for unlimited cleanup power.
                        </p>

                        {/* Time until reset */}
                        <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 mb-8">
                            <Clock className="w-4 h-4" />
                            <span>Free swipes reset in {timeUntilReset}</span>
                        </div>

                        {/* Pro benefits */}
                        <div className="space-y-3 mb-8">
                            {[
                                "Unlimited daily swipes",
                                "Priority email processing",
                                "Advanced danger scoring",
                                "Weekly cleanup reports",
                            ].map((benefit, i) => (
                                <motion.div
                                    key={benefit}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                        <Zap className="w-3 h-3 text-emerald-400" />
                                    </div>
                                    <span className="text-zinc-300 text-sm">{benefit}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA buttons */}
                        <div className="space-y-4">
                            <button
                                onClick={onUpgrade}
                                className="w-full py-5 bg-emerald-500 text-zinc-950 font-black rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)] uppercase tracking-widest text-xs"
                            >
                                Upgrade to Pro — $4.99/mo
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full py-3 text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
                            >
                                I'll wait for reset
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/**
 * Usage bar component to show remaining swipes
 */
export function UsageBar() {
    const { remaining, limit, usagePercent, tier, timeUntilReset } = useFreemium();

    // Don't show for Pro users
    if (tier.isPro) return null;

    const isLow = remaining <= 10;
    const isOut = remaining === 0;

    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`
                    flex items-center gap-3 px-4 py-2 rounded-full text-sm backdrop-blur-md
                    ${isOut
                        ? "bg-red-500/20 border border-red-500/30 text-red-400"
                        : isLow
                            ? "bg-amber-500/20 border border-amber-500/30 text-amber-400"
                            : "bg-zinc-900/80 border border-zinc-800 text-zinc-400"
                    }
                `}
            >
                <Zap className="w-4 h-4" />
                {isOut ? (
                    <span>Limit reached • Resets in {timeUntilReset}</span>
                ) : (
                    <>
                        <span className="font-bold">{remaining}</span>
                        <span>/ {limit} swipes left today</span>
                    </>
                )}
            </motion.div>
        </div>
    );
}
