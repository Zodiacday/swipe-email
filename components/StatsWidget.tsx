"use client";

import { useEffect, useState } from "react";
import { Clock, Flame, Zap, MailCheck } from "lucide-react";
import { getAnalytics, getTimeSavedMinutes, SwipeAnalytics } from "@/lib/analytics";
import { motion } from "framer-motion";

export function StatsWidget() {
    const [stats, setStats] = useState<SwipeAnalytics | null>(null);
    const [timeSaved, setTimeSaved] = useState(0);

    useEffect(() => {
        // Initial load
        setStats(getAnalytics());
        setTimeSaved(getTimeSavedMinutes());

        // Listen for updates (optional if we want real-time across tabs)
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "swipe_analytics") {
                setStats(getAnalytics());
                setTimeSaved(getTimeSavedMinutes());
            }
        };

        window.addEventListener("storage", handleStorage);

        // Custom event for same-tab updates
        const handleUpdate = () => {
            setStats(getAnalytics());
            setTimeSaved(getTimeSavedMinutes());
        };
        window.addEventListener("analytics_updated", handleUpdate);

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("analytics_updated", handleUpdate);
        };
    }, []);

    if (!stats) return null;

    const formatTime = (mins: number) => {
        if (mins < 60) return `${mins.toFixed(0)}m`;
        const hours = mins / 60;
        return `${hours.toFixed(1)}h`;
    };

    return (
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
            {/* Time Saved */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
            >
                <Clock className="w-4 h-4 text-emerald-500" />
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500/60 leading-tight">Time Saved</span>
                    <span className="text-sm font-black text-emerald-400 leading-tight font-mono">{formatTime(timeSaved)}</span>
                </div>
            </motion.div>

            {/* Streak */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full"
            >
                <Flame className="w-4 h-4 text-orange-500" />
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-widest text-orange-500/60 leading-tight">Streak</span>
                    <span className="text-sm font-black text-orange-400 leading-tight font-mono">{stats.weeklyStreak} Days</span>
                </div>
            </motion.div>

            {/* Total Nuked */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full"
            >
                <Zap className="w-4 h-4 text-zinc-500" />
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 leading-tight">Nuked</span>
                    <span className="text-sm font-black text-zinc-300 leading-tight font-mono">{stats.totalEmailsTrashed}</span>
                </div>
            </motion.div>
        </div>
    );
}
