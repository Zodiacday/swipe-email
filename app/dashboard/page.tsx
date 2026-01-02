"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Trash2,
    Shield,
    Search,
    Loader2,
    RefreshCw,
    ArrowLeft,
    X,
    ChevronDown,
    ChevronRight,
    Mail,
    ArrowUpDown,
    Filter,
    Star,
    ShieldOff
} from "lucide-react";
import Link from "next/link";
import { SkeletonRow } from "@/components/Skeleton";
import { useEmailContext } from "@/contexts/EmailContext";
import { useToast } from "@/contexts/ToastContext";
import { setLastMode } from "@/lib/userPreferences";

// --- Framer Motion Config ---
const bounceConfig = { type: "spring" as const, stiffness: 300, damping: 20, mass: 0.8 };

const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.03, type: "spring" as const, stiffness: 300, damping: 30 }
    })
};

export default function DashboardPage() {
    // --- Context ---
    const {
        aggregates, isLoading, isRefreshing, error, fetchEmails,
        trashSender, undoLastAction, canUndo, blockSender, markPersonal
    } = useEmailContext();
    const { showToast } = useToast();

    // --- Local State ---
    const [selectedView, setSelectedView] = useState<"senders" | "domains">("senders");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [processing, setProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("all");
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [sortField, setSortField] = useState<"count" | "score" | "newest">("count");
    const [scoreFilter, setScoreFilter] = useState<"all" | "high" | "danger">("all");

    const { senders, stats } = aggregates;

    // Track mode for preferences
    useEffect(() => {
        setLastMode("dashboard");
    }, []);

    // --- Filtered & Sorted Senders ---
    const filteredSenders = useMemo(() => {
        let result = [...senders];

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.email.toLowerCase().includes(q) ||
                s.domain.toLowerCase().includes(q)
            );
        }

        // Time filter
        if (timeRange !== "all") {
            const cutoff = Date.now() - (timeRange === "7d" ? 7 : 30) * 24 * 60 * 60 * 1000;
            result = result.filter(s => s.lastActive > cutoff);
        }

        // Score filter
        if (scoreFilter === "high") {
            result = result.filter(s => s.score > 50);
        } else if (scoreFilter === "danger") {
            result = result.filter(s => s.score > 80);
        }

        // Sorting
        result.sort((a, b) => {
            if (sortField === "count") return b.count - a.count;
            if (sortField === "score") return b.score - a.score;
            if (sortField === "newest") return b.lastActive - a.lastActive;
            return 0;
        });

        return result;
    }, [senders, searchQuery, timeRange, scoreFilter, sortField]);

    // --- Domain Grouping ---
    const domainGroups = useMemo(() => {
        const groups: Record<string, { domain: string; senders: typeof senders; totalCount: number }> = {};

        filteredSenders.forEach(s => {
            if (!groups[s.domain]) {
                groups[s.domain] = { domain: s.domain, senders: [], totalCount: 0 };
            }
            groups[s.domain].senders.push(s);
            groups[s.domain].totalCount += s.count;
        });

        return Object.values(groups).sort((a, b) => b.totalCount - a.totalCount);
    }, [filteredSenders]);

    // --- Actions ---
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedIds.size === filteredSenders.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filteredSenders.map(s => s.id)));
    };

    const handleTrashSelected = async () => {
        if (selectedIds.size === 0) return;
        setProcessing(true);

        const sendersToDelete = filteredSenders.filter(s => selectedIds.has(s.id));
        const totalCount = sendersToDelete.reduce((acc, s) => acc + s.count, 0);

        try {
            for (const sender of sendersToDelete) {
                await trashSender(sender.email);
            }

            setSelectedIds(new Set());
            showToast(`Trashed ${totalCount} emails from ${sendersToDelete.length} senders ✓`, {
                type: "success",
                undoAction: canUndo ? async () => {
                    await undoLastAction();
                    showToast("Restored ✓", { type: "info" });
                } : undefined
            });
        } catch (err) {
            console.error("Trash failed", err);
            showToast("Failed to trash emails", { type: "error" });
        } finally {
            setProcessing(false);
        }
    };

    // --- Loading State (Skeleton) ---
    if (isLoading && senders.length === 0) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
                {/* Skeleton Header */}
                <header className="h-16 px-6 bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-zinc-800 rounded animate-pulse" />
                        <div className="w-32 h-5 bg-zinc-800 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-4 bg-zinc-800 rounded animate-pulse" />
                        <div className="w-20 h-4 bg-zinc-800 rounded animate-pulse" />
                    </div>
                </header>

                {/* Skeleton Controls */}
                <div className="h-14 px-6 bg-zinc-900/50 border-b border-zinc-800/50 flex items-center justify-between">
                    <div className="w-48 h-8 bg-zinc-800 rounded-full animate-pulse" />
                    <div className="flex items-center gap-4">
                        <div className="w-32 h-8 bg-zinc-800 rounded-lg animate-pulse" />
                        <div className="w-64 h-9 bg-zinc-800 rounded-lg animate-pulse" />
                    </div>
                </div>

                {/* Skeleton Table */}
                <main className="max-w-7xl mx-auto p-8">
                    <div className="border border-zinc-800 rounded-2xl bg-zinc-900/20">
                        <div className="h-12 bg-zinc-900 rounded-t-2xl border-b border-zinc-800" />
                        <div className="divide-y divide-zinc-800/50">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <SkeletonRow key={i} />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // --- Error State ---
    if (error && senders.length === 0) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="text-5xl mb-2">😕</div>
                <h1 className="text-2xl font-bold text-zinc-100">Something went wrong</h1>
                <p className="text-zinc-500 max-w-md">{error}</p>
                <button
                    onClick={() => fetchEmails()}
                    className="mt-4 px-6 py-3 bg-cyan-500 text-zinc-900 font-bold rounded-full flex items-center gap-2 hover:bg-cyan-400 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-32">

            {/* --- Sticky Header Row 1: Branding & Stats --- */}
            <header className="h-16 px-6 bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800/50 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-5 h-5 text-cyan-400" />
                    <span className="font-mono text-cyan-400 font-bold tracking-wider uppercase text-base">
                        COMMAND CENTER
                    </span>
                    {isRefreshing && <RefreshCw className="w-4 h-4 text-zinc-600 animate-spin" />}
                </div>
                <div className="flex items-center gap-6 font-mono text-xs text-zinc-500">
                    <div>
                        <span className="text-zinc-300 font-bold">{stats?.totalEmails.toLocaleString() || 0}</span> EMAILS
                    </div>
                    <div className="w-px h-4 bg-zinc-800" />
                    <div>
                        <span className="text-cyan-400 font-bold">{stats?.uniqueSenders.toLocaleString() || 0}</span> SENDERS
                    </div>
                    <Link href="/mode-select" className="text-zinc-500 hover:text-zinc-300 transition-colors ml-4">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
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
                    {/* View Toggle */}
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

                    {/* Sort Selector */}
                    <div className="flex items-center gap-1 bg-zinc-800/50 rounded-lg p-1 border border-zinc-700/50">
                        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 ml-1.5" />
                        <select
                            value={sortField}
                            onChange={(e) => setSortField(e.target.value as any)}
                            className="bg-transparent text-xs font-bold text-zinc-400 focus:outline-none cursor-pointer pr-2"
                        >
                            <option value="count">Volume</option>
                            <option value="score">Nuisance</option>
                            <option value="newest">Recent</option>
                        </select>
                    </div>

                    {/* Score Filter */}
                    <div className="flex items-center gap-1 bg-zinc-800/50 rounded-lg p-1 border border-zinc-700/50">
                        <Filter className="w-3.5 h-3.5 text-zinc-500 ml-1.5" />
                        <button
                            onClick={() => setScoreFilter(scoreFilter === "all" ? "high" : scoreFilter === "high" ? "danger" : "all")}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${scoreFilter !== "all" ? "bg-cyan-500/10 text-cyan-400" : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            {scoreFilter === "all" ? "All Scores" : scoreFilter === "high" ? "High Score (>50)" : "Danger (>80)"}
                        </button>
                    </div>

                    {/* Time Filter */}
                    <div className="flex items-center gap-1 bg-zinc-800/50 rounded-lg p-1 border border-zinc-700/50">
                        {(["7d", "30d", "all"] as const).map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${timeRange === range ? "bg-cyan-500/10 text-cyan-400" : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                            >
                                {range === "all" ? "All Time" : range}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search senders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-9 bg-zinc-800/50 border border-zinc-700 rounded-lg pl-9 pr-9 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-sans"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Main Content: Data Table --- */}
            <main className="max-w-7xl mx-auto p-8">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 h-12 items-center bg-zinc-900 border border-zinc-800 rounded-t-2xl text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <div className="col-span-1 flex justify-center">
                        <input
                            type="checkbox"
                            checked={selectedIds.size === filteredSenders.length && filteredSenders.length > 0}
                            onChange={toggleAll}
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800/50 text-cyan-500 focus:ring-cyan-500/20 cursor-pointer"
                        />
                    </div>
                    <div className="col-span-5 pl-2">Sender Identity</div>
                    <div className="col-span-4">Volume Impact</div>
                    <div className="col-span-2 text-center">Actions</div>
                </div>

                {/* Table Body */}
                <div className="border border-t-0 border-zinc-800 rounded-b-2xl bg-zinc-900/20 backdrop-blur-sm max-h-[calc(100vh-320px)] overflow-y-auto">
                    {selectedView === "senders" ? (
                        <div className="divide-y divide-zinc-800/50">
                            {filteredSenders.map((sender, i) => (
                                <React.Fragment key={sender.id}>
                                    <motion.div
                                        key={sender.id}
                                        custom={i}
                                        variants={rowVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className={`
                                        grid grid-cols-12 gap-4 px-6 h-[84px] items-center group transition-colors duration-200
                                        ${sender.count > 100 ? "border-l-4 border-l-red-500 bg-red-500/5" : "border-l-2 border-l-transparent"}
                                        ${selectedIds.has(sender.id) ? "bg-cyan-500/5 !border-l-cyan-500" : "hover:bg-zinc-800/30"}
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
                                            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-base shrink-0 border border-zinc-700">
                                                {sender.name[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-semibold text-zinc-100 truncate">{sender.name}</div>
                                                    {sender.category === "Personal" && (
                                                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-tighter">
                                                            Personal
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-zinc-500 truncate">{sender.email}</div>
                                            </div>
                                        </div>

                                        {/* Volume Bar */}
                                        <div className="col-span-4 flex items-center gap-4">
                                            <div className={`font-mono font-bold w-14 text-right text-lg ${sender.count > 100 ? "text-red-400 text-glow-red" :
                                                sender.count > 20 ? "text-cyan-400 text-glow-cyan" : "text-zinc-300"
                                                }`}>
                                                {sender.count}
                                            </div>
                                            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min((sender.count / 50) * 100, 100)}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className={`h-full rounded-full ${sender.count > 100 ? "bg-red-500 premium-pulse-red" :
                                                        sender.count > 20 ? "bg-cyan-500" : "bg-zinc-600"
                                                        }`}
                                                />
                                            </div>
                                            <div className={`text-xs font-mono w-12 text-right ${sender.count > 100 ? "text-red-400 font-bold text-glow-red" : "text-zinc-600"
                                                }`}>
                                                {sender.count > 100 ? "DANGER" : sender.count > 20 ? "HIGH" : "LOW"}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-2 flex justify-center gap-2">
                                            {/* Expand Toggle */}
                                            <button
                                                onClick={() => setExpandedRow(expandedRow === sender.id ? null : sender.id)}
                                                className={`p-2 rounded-lg border transition-colors ${expandedRow === sender.id
                                                    ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                                                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                                                    }`}
                                                title="View sample subjects"
                                            >
                                                {expandedRow === sender.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    markPersonal(sender.email);
                                                    showToast(`Marked ${sender.name} as Personal ✓`, { type: "info" });
                                                }}
                                                className={`p-2 rounded-lg border transition-colors ${sender.category === "Personal"
                                                    ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                                                    }`}
                                                title="Mark as Personal"
                                            >
                                                <Star className={`w-4 h-4 ${sender.category === "Personal" ? "fill-amber-500" : ""}`} />
                                            </button>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    await trashSender(sender.email);
                                                    showToast(`Trashed ${sender.count} emails from ${sender.name} ✓`, { type: "success" });
                                                }}
                                                className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                                                title="Trash all from sender"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (confirm(`Block ${sender.name} and trash all emails?`)) {
                                                        await blockSender(sender.email);
                                                        showToast(`Blocked ${sender.name} ✓`, { type: "error" });
                                                    }
                                                }}
                                                className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                                title="Block sender"
                                            >
                                                <ShieldOff className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>

                                    {/* Expanded Row - Sample Subjects */}
                                    <AnimatePresence>
                                        {expandedRow === sender.id && sender.sampleSubjects?.length > 0 && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="bg-zinc-900/50 border-l-4 border-l-cyan-500/30 overflow-hidden"
                                            >
                                                <div className="px-8 py-4">
                                                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <Mail className="w-3 h-3" />
                                                        Sample Subjects
                                                    </p>
                                                    <ul className="space-y-2">
                                                        {sender.sampleSubjects.map((subject, idx) => (
                                                            <li key={idx} className="text-sm text-zinc-400 flex items-start gap-2">
                                                                <span className="text-cyan-500/50">•</span>
                                                                <span className="truncate">{subject}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            ))}

                            {filteredSenders.length === 0 && (
                                <div className="p-12 text-center text-zinc-500">
                                    {searchQuery ? "No senders match your search." : "No emails found."}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Domain View */
                        <div className="divide-y divide-zinc-800/50">
                            {domainGroups.map((group, i) => (
                                <motion.div
                                    key={group.domain}
                                    custom={i}
                                    variants={rowVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="px-6 py-4"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                                <span className="text-cyan-400 font-bold text-sm">{group.senders.length}</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-zinc-100">@{group.domain}</div>
                                                <div className="text-xs text-zinc-500">{group.senders.length} senders</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`font-mono font-bold text-lg ${group.totalCount > 100 ? "text-red-400" : "text-cyan-400"
                                                }`}>
                                                {group.totalCount} emails
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    for (const sender of group.senders) {
                                                        await trashSender(sender.email);
                                                    }
                                                    showToast(`Trashed all emails from @${group.domain} ✓`, { type: "success" });
                                                }}
                                                className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-bold"
                                            >
                                                Nuke Domain
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {domainGroups.length === 0 && (
                                <div className="p-12 text-center text-zinc-500">
                                    No domains found.
                                </div>
                            )}
                        </div>
                    )}
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
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-4xl h-20 bg-zinc-900/95 backdrop-blur-xl border-2 border-red-500/50 rounded-3xl px-8 flex items-center justify-between z-50 shadow-2xl shadow-red-900/20"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-zinc-100">
                                    {selectedIds.size} sender{selectedIds.size > 1 ? "s" : ""} selected
                                </div>
                                <div className="text-sm text-zinc-500">
                                    ~{filteredSenders.filter(s => selectedIds.has(s.id)).reduce((acc, s) => acc + s.count, 0)} emails
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedIds(new Set())}
                                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTrashSelected}
                                disabled={processing}
                                className="px-8 py-3 rounded-xl bg-red-500 text-white font-bold flex items-center gap-2 hover:bg-red-400 transition-colors disabled:opacity-50"
                            >
                                {processing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Trash2 className="w-5 h-5" />
                                )}
                                TRASH ALL
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
