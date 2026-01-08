"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Clock, Check, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationSettings() {
    const {
        supported,
        permission,
        settings,
        isLoading,
        requestPermission,
        enableDigest,
        disableDigest,
    } = useNotifications();

    const [selectedTime, setSelectedTime] = useState(settings.dailyDigestTime);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!supported) {
        return (
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <div className="flex items-center gap-3 text-zinc-500">
                    <BellOff className="w-5 h-5" />
                    <span className="text-sm">Notifications not supported in this browser</span>
                </div>
            </div>
        );
    }

    const handleEnable = async () => {
        const success = await enableDigest(selectedTime);
        if (success) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };

    return (
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings.enabled ? "bg-emerald-500/20" : "bg-zinc-800"
                        }`}>
                        <Bell className={`w-5 h-5 ${settings.enabled ? "text-emerald-400" : "text-zinc-500"}`} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Daily Digest</h3>
                        <p className="text-xs text-zinc-500">Get reminded to clean your inbox</p>
                    </div>
                </div>

                {/* Toggle */}
                <button
                    onClick={() => settings.enabled ? disableDigest() : handleEnable()}
                    disabled={isLoading}
                    className={`
                        relative w-14 h-8 rounded-full transition-colors
                        ${settings.enabled ? "bg-emerald-500" : "bg-zinc-700"}
                        ${isLoading ? "opacity-50" : ""}
                    `}
                >
                    <motion.div
                        animate={{ x: settings.enabled ? 24 : 4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                    />
                </button>
            </div>

            {/* Time picker */}
            <AnimatePresence>
                {(settings.enabled || permission === "default") && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex items-center gap-4 pt-4 border-t border-zinc-800">
                            <Clock className="w-4 h-4 text-zinc-500" />
                            <span className="text-sm text-zinc-400">Remind me at</span>
                            <input
                                type="time"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />

                            {!settings.enabled && permission === "default" && (
                                <button
                                    onClick={handleEnable}
                                    disabled={isLoading}
                                    className="ml-auto px-4 py-2 bg-emerald-500 text-zinc-950 text-sm font-bold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50"
                                >
                                    Enable
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Permission denied message */}
            {permission === "denied" && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">
                        Notifications are blocked. Please enable them in your browser settings.
                    </p>
                </div>
            )}

            {/* Success toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm"
                    >
                        <Check className="w-4 h-4" />
                        Daily digest enabled! You'll be reminded at {selectedTime}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * Notification prompt card for onboarding or mode-select
 */
export function NotificationPrompt({ onDismiss }: { onDismiss?: () => void }) {
    const { permission, enableDigest, isLoading } = useNotifications();
    const [dismissed, setDismissed] = useState(false);

    if (dismissed || permission !== "default") return null;

    const handleEnable = async () => {
        await enableDigest();
        setDismissed(true);
        onDismiss?.();
    };

    const handleDismiss = () => {
        setDismissed(true);
        onDismiss?.();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl"
        >
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white mb-1">Never miss a cleanup!</h4>
                    <p className="text-sm text-zinc-400 mb-3">
                        Get a daily reminder to keep your inbox at zero.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleEnable}
                            disabled={isLoading}
                            className="px-4 py-2 bg-emerald-500 text-zinc-950 text-sm font-bold rounded-full hover:bg-emerald-400 transition-colors disabled:opacity-50"
                        >
                            Enable Reminders
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="px-4 py-2 text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
                        >
                            Maybe later
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    className="p-1 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
