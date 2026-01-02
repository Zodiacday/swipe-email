"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Trash2,
    Shield,
    Users,
    Globe,
    Calendar,
    Search,
    AlertTriangle,
    Loader2,
    CheckCircle
} from "lucide-react";
import Link from "next/link";
import { AggregatedSender, DashboardStats } from "@/lib/engines/aggregation";

// --- Framer Motion Config ---
const springConfig = { type: "spring", stiffness: 300, damping: 30 };
const bounceConfig = { type: "spring", stiffness: 300, damping: 20, mass: 0.8 };

const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.05, ...springConfig }
    })
};

export default function DashboardPage() {
    // --- State ---
    const [selectedView, setSelectedView] = useState<"senders" | "domains" | "aging">("senders");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [senders, setSenders] = useState<AggregatedSender[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [showToast, setShowToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/gmail/aggregates?limit=500");
                const data = await res.json();
                if (data.senders) setSenders(data.senders);
                if (data.stats) setStats(data.stats);
            } catch (err) {
                console.error("Failed to load dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- Actions ---
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedIds.size === senders.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(senders.map(s => s.id)));
    };

    const handleTrashSelected = async () => {
        if (selectedIds.size === 0) return;
        setProcessing(true);

        const idsToDelete = Array.from(selectedIds);
        const sendersToDelete = senders.filter(s => selectedIds.has(s.id));
        const count = sendersToDelete.reduce((acc, s) => acc + s.count, 0);

        try {
            // Simulate API calls for each sender
            for (const sender of sendersToDelete) {
                await fetch("/api/gmail/action", {
                    method: "POST",
                    body: JSON.stringify({
                        action: "TRASH_SENDER",
                        payload: { email: sender.email }
                    })
                });
            }

            // Optimistic Update
            setSenders(prev => prev.filter(s => !selectedIds.has(s.id)));
            setSelectedIds(new Set());
            setShowToast({ message: `Trashed ${count} emails from ${sendersToDelete.length} senders`, type: "success" });
            setTimeout(() => setShowToast(null), 3000);

        } catch (err) {
            console.error("Nuke failed", err);
            setShowToast({ message: "Failed to trash emails", type: "error" });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                <div className="text-zinc-500 font-mono text-sm tracking-widest uppercase animate-pulse">Scanning Inbox...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-32">

            {/* --- Sticky Header Row 1: Branding & Stats --- */}
            <header className="h-16 px-6 bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800/50 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-cyan-400" />
                    <span className="font-mono text-cyan-400 font-bold tracking-wider uppercase text-base">
                        COMMAND CENTER
                    </span>
                </div>
                <div className="flex items-center gap-6 font-mono text-xs text-zinc-500">
                    <div>
                        <span className="text-zinc-300 font-bold">{stats?.totalEmails.toLocaleString() || 0}</span> EMAILS
                    </div>
                    <div className="w-px h-4 bg-zinc-800" />
                    <div>
                        <span className="text-cyan-400 font-bold">{stats?.uniqueSenders.toLocaleString() || 0}</span> SENDERS
                    </div>
                </div>
            </header>

            {/* --- Sticky Header Row 2: Controls --- */}
            <div className="h-14 px-6 bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800/50 flex items-center justify-between sticky top-16 z-40">
                {/* Mode Toggle */}
                <div className="flex items-center gap-1 bg-zinc-800 rounded-full p-1 relative">
                    <Link href="/swipe" className="relative z-10 px-6 py-1.5 rounded-full text-sm font-medium text-zinc-400 hover:text-zinc-300 transition-colors">
                        Swipe
                    </Link>
                    <div className="relative z-10 px-6 py-1.5 rounded-full text-sm font-medium text-zinc-900 bg-cyan-500 shadow-sm">
                        Dashboard
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-zinc-800/50 rounded-lg p-1 border border-zinc-700/50">
                        <button
                            onClick={() => setSelectedView("senders")}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-colors ${selectedView === "senders" ? "bg-cyan-500/10 text-cyan-400" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                            Senders
                        </button>
                        <button
                            onClick={() => setSelectedView("domains")}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-colors ${selectedView === "domains" ? "bg-cyan-500/10 text-cyan-400" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                            Domains
                        </button>
                    </div>

                    <div className="relative w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full h-9 bg-zinc-800/50 border border-zinc-700 rounded-lg pl-9 pr-4 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-sans"
                        />
                    </div>
                </div>
            </div>

            {/* --- Main Content: Data Table --- */}
            <main className="max-w-7xl mx-auto p-6">
                <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/20 backdrop-blur-sm">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 h-12 items-center bg-zinc-900/80 border-b border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-widest sticky top-[120px] z-30 backdrop-blur-md">
                        <div className="col-span-1 flex justify-center">
                            <input
                                type="checkbox"
                                checked={selectedIds.size === senders.length && senders.length > 0}
                                onChange={toggleAll}
                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800/50 text-cyan-500 focus:ring-cyan-500/20 cursor-pointer"
                            />
                        </div>
                        <div className="col-span-5 pl-2">Sender Identity</div>
                        <div className="col-span-4">Volume Impact</div>
                        <div className="col-span-2 text-center">Actions</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-zinc-800/50">
                        {senders.map((sender, i) => (
                            <motion.div
                                key={sender.id}
                                custom={i}
                                variants={rowVariants}
                                initial="hidden"
                                animate="visible"
                                className={`
                                    grid grid-cols-12 gap-4 px-6 h-[72px] items-center group transition-colors duration-200
                                    ${selectedIds.has(sender.id) ? "bg-cyan-500/5 border-l-2 border-l-cyan-500" : "hover:bg-zinc-800/30 border-l-2 border-l-transparent hover:border-l-emerald-500"}
                                `}
                            >
                                {/* Checkbox */}
                                <div className="col-span-1 flex justify-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(sender.id)}
                                        onChange={() => toggleSelection(sender.id)}
                                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800/50 text-cyan-500 focus:ring-cyan-500/20 cursor-pointer"
                                    />
                                </div>

                                {/* Identity */}
                                <div className="col-span-5 flex items-center gap-4 min-w-0 pl-2">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-sm shrink-0 border border-zinc-700">
                                        {sender.name[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-semibold text-zinc-100 truncate">{sender.name}</div>
                                        <div className="text-sm text-zinc-500 truncate">{sender.email}</div>
                                    </div>
                                </div>

                                {/* Volume Bar */}
                                <div className="col-span-4 flex items-center gap-4">
                                    <div className="font-mono text-zinc-300 font-bold w-12 text-right">{sender.count}</div>
                                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((sender.count / 50) * 100, 100)}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full rounded-full ${sender.count > 100 ? "bg-red-500" :
                                                sender.count > 20 ? "bg-cyan-500" : "bg-zinc-600"
                                                }`}
                                        />
                                    </div>
                                    <div className="text-xs font-mono text-zinc-600 w-16 text-right">
                                        {sender.count > 10 ? "HIGH" : "LOW"}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="col-span-2 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:border-red-500 hover:bg-red-500/10 hover:text-red-500 transition-all hover:scale-105"
                                        title="Delete All from Sender"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:border-orange-500 hover:bg-orange-500/10 hover:text-orange-500 transition-all hover:scale-105"
                                        title="Block Sender"
                                    >
                                        <Shield className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            {/* --- Floating Bulk Action Bar --- */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 200, opacity: 0 }}
                        transition={bounceConfig}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-4xl h-20 bg-zinc-900/90 backdrop-blur-xl border-2 border-red-500/50 rounded-3xl px-8 flex items-center justify-between z-50 shadow-2xl shadow-red-900/20"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <div className="text-zinc-100 font-bold text-lg leading-none">
                                    {selectedIds.size} Senders Selected
                                </div>
                                <div className="text-red-400/80 text-xs font-mono mt-1">
                                    APPROX. {(selectedIds.size * 12.4).toFixed(0)} EMAILS WILL BE DELETED
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedIds(new Set())}
                                className="px-6 py-3 rounded-xl text-zinc-400 hover:text-zinc-200 font-medium transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTrashSelected}
                                disabled={processing}
                                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg shadow-red-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        NUKING...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        TRASH ALL
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Toast Notification --- */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-zinc-800 border-l-4 border-l-emerald-500 rounded shadow-2xl flex items-center gap-4"
                    >
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span className="text-zinc-200 font-medium">{showToast.message}</span>
                        {showToast.type === "success" && (
                            <button className="text-xs font-bold text-emerald-500 hover:underline uppercase tracking-wide ml-4">
                                UNDO
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
