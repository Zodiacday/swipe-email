"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Cloud, Loader2 } from "lucide-react";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";

export function OfflineIndicator() {
    const { initialized, pendingCount, isOnline, isSyncing } = useOfflineQueue();

    // Don't render until initialized
    if (!initialized) return null;

    // Online with no pending actions = nothing to show
    if (isOnline && pendingCount === 0 && !isSyncing) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
            >
                {!isOnline ? (
                    // Offline state
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-full text-sm font-medium">
                        <WifiOff className="w-4 h-4" />
                        <span>Offline — actions saved locally</span>
                    </div>
                ) : isSyncing ? (
                    // Syncing state
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full text-sm font-medium">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Syncing {pendingCount} actions...</span>
                    </div>
                ) : pendingCount > 0 ? (
                    // Pending actions (online but not syncing yet)
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-full text-sm font-medium">
                        <Cloud className="w-4 h-4" />
                        <span>{pendingCount} pending sync</span>
                    </div>
                ) : null}
            </motion.div>
        </AnimatePresence>
    );
}
