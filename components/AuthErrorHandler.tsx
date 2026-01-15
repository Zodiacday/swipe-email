"use client";

/**
 * Auth Error Handler
 * Detects session errors and prompts user to re-login
 */

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, LogIn, X } from "lucide-react";

export function AuthErrorHandler() {
    const { data: session } = useSession();
    const [showError, setShowError] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if session has a refresh token error
        if (session?.error === "RefreshAccessTokenError" && !dismissed) {
            setShowError(true);
        }
    }, [session, dismissed]);

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    const handleDismiss = () => {
        setDismissed(true);
        setShowError(false);
    };

    return (
        <AnimatePresence>
            {showError && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-full mx-4"
                >
                    <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-4 shadow-2xl">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white mb-1">Session Expired</h3>
                                <p className="text-sm text-zinc-400 mb-4">
                                    Your login session has expired. Please sign in again to continue using Swipe.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSignOut}
                                        className="px-4 py-2 bg-emerald-500 text-zinc-950 font-bold text-sm rounded-lg flex items-center gap-2 hover:bg-emerald-400 transition-colors"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Sign In Again
                                    </button>
                                    <button
                                        onClick={handleDismiss}
                                        className="px-4 py-2 bg-zinc-800 text-zinc-300 font-bold text-sm rounded-lg hover:bg-zinc-700 transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
