"use client";

/**
 * Global Error Boundary
 * Shows when an unhandled error occurs
 */

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log error to console (could send to analytics)
        console.error("Global error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-red-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-md w-full text-center"
            >
                {/* Error Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center"
                >
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                </motion.div>

                <h1 className="text-3xl font-black tracking-tighter mb-3">
                    Oops, something broke
                </h1>

                <p className="text-zinc-400 mb-6">
                    Don't worry, your emails are safe. This is on our end.
                </p>

                {/* Error details (dev only) */}
                {process.env.NODE_ENV === "development" && (
                    <div className="mb-6 p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-left">
                        <p className="text-xs font-mono text-red-400 break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs font-mono text-zinc-600 mt-2">
                                Digest: {error.digest}
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-6 py-3 bg-emerald-500 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>

                    <Link
                        href="/"
                        className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                </div>

                {/* Support link */}
                <p className="mt-8 text-xs text-zinc-600">
                    Problem persists?{" "}
                    <a href="mailto:hello@swipeemail.com" className="text-emerald-500 hover:underline">
                        Contact Support
                    </a>
                </p>
            </motion.div>
        </div>
    );
}
