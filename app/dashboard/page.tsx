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
    ShieldOff,
    Check,
    AlertTriangle,
    SlidersHorizontal
} from "lucide-react";
import Link from "next/link";
import { SkeletonRow } from "@/components/Skeleton";
import { StatsWidget } from "@/components/StatsWidget";
import { useEmailContext } from "@/contexts/EmailContext";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmModal } from "@/hooks/useConfirmModal";
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
        trashSender,
        trashMultipleSenders,
        undoLastAction,
        canUndo,
        blockSender,
        nukeDomain,
        markPersonal
    } = useEmailContext();
    const { showToast } = useToast();
    const { confirm: confirmModal } = useConfirmModal();

    // --- Local State ---
    const [selectedView, setSelectedView] = useState<"senders" | "domains">("senders");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [processing, setProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("all");
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [sortField, setSortField] = useState<"count" | "score" | "newest">("count");
    const [scoreFilter, setScoreFilter] = useState<"all" | "high" | "danger">("all");
    const [showMobileFilters, setShowMobileFilters] = useState(false);

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
            await trashMultipleSenders(sendersToDelete.map(s => s.email));

            setSelectedIds(new Set());
            showToast(`Trashed ${totalCount} emails from ${sendersToDelete.length} senders ✓`, {
                type: "success",
                undoAction: async () => {
                    const success = await undoLastAction();
                    if (success) {
                        showToast("Restored ✓", { type: "info" });
                    } else {
                        showToast("Nothing to undo", { type: "error" });
                    }
                }
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
                    <div className="glass rounded-3xl">
                        <div className="h-12 bg-zinc-900 rounded-t-3xl border-b border-zinc-800" />
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
                <h1 className="text-2xl font-black tracking-tight text-zinc-100">Something went wrong</h1>
                <p className="text-zinc-500 max-w-md">{error}</p>
                <button
                    onClick={() => fetchEmails()}
                    className="mt-4 px-6 py-3 bg-emerald-500 text-zinc-900 font-bold rounded-full flex items-center gap-2 hover:bg-emerald-400 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 font-sans pb-32">
            <div className="h-20" /> {/* Navbar Spacer */}

            {/* --- Unified Cyber Header --- */}
            <header className="px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-50 border-b border-emerald-500/20 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                        <LayoutDashboard className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white leading-none">
                            Command <span className="text-emerald-500 not-italic">Center</span>
                        </h1>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mt-1">
                            {stats?.uniqueSenders || 0} SENDERS DETECTED • {stats?.totalEmails.toLocaleString()} TOTAL EMAILS
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden lg:block mr-4">
                        <StatsWidget />
                    </div>
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className={`p-3 bg-zinc-900 border border-zinc-800 rounded-2xl transition-all active:scale-95 ${showMobileFilters ? 'text-emerald-400 border-emerald-500/30' : 'text-zinc-400 hover:text-zinc-200'}`}
                        title="Toggle Filters"
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => fetchEmails()}
                        disabled={isRefreshing}
                        className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all active:scale-95"
                    >
                        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    {canUndo && (
                        <button
                            onClick={undoLastAction}
                            className="px-6 py-3 bg-emerald-500 text-zinc-950 font-black tracking-widest uppercase text-xs rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        >
                            Undo
                        </button>
                    )}
                </div>
            </header>

            {/* --- Action Bar & Filters --- */}
            <div className="px-6 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 bg-zinc-950 p-1 border border-zinc-800 rounded-2xl">
                        <button
                            onClick={() => setSelectedView("senders")}
                            className={`px-6 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${selectedView === "senders" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-400"}`}
                        >
                            Senders
                        </button>
                        <button
                            onClick={() => setSelectedView("domains")}
                            className={`px-6 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${selectedView === "domains" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-400"}`}
                        >
                            Domains
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-[200px] max-w-md relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className={`p-2.5 rounded-xl border transition-all ${showMobileFilters ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                            title="Toggle Filters"
                        >
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {showMobileFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap items-center gap-4 pt-4 mt-4 border-t border-zinc-900">
                                <div className="flex items-center gap-2">
                                    <span className="text-label mr-1">Time:</span>
                                    {(['all', '7d', '30d'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTimeRange(t)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${timeRange === t ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700'}`}
                                        >
                                            {t === 'all' ? 'All' : t}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-label mr-1">Impact:</span>
                                    {(['all', 'high', 'danger'] as const).map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setScoreFilter(s)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${scoreFilter === s ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700'}`}
                                        >
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                {(timeRange !== 'all' || scoreFilter !== 'all') && (
                                    <button
                                        onClick={() => { setTimeRange('all'); setScoreFilter('all'); }}
                                        className="ml-auto text-xs text-zinc-500 hover:text-emerald-400 transition-colors"
                                    >
                                        Reset filters
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


            {/* --- Main Content: Cyber Editorial List --- */}
            <main className="max-w-7xl mx-auto px-6">
                {/* Table Header - High Contrast */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 h-12 items-center bg-black border border-emerald-500/20 rounded-t-3xl text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                    <div className="col-span-1 flex justify-center">
                        <input
                            type="checkbox"
                            checked={selectedIds.size === filteredSenders.length && filteredSenders.length > 0}
                            onChange={toggleAll}
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800/50 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                        />
                    </div>
                    <div className="col-span-5 pl-2">Sender Identity</div>
                    <div className="col-span-4">Volume Impact</div>
                    <div className="col-span-2 text-center">Actions</div>
                </div>

                {/* Mobile Select All */}
                <div className="md:hidden flex items-center justify-between glass rounded-t-3xl px-4 py-3">
                    <label className="flex items-center gap-2 text-sm text-zinc-400">
                        <input
                            type="checkbox"
                            checked={selectedIds.size === filteredSenders.length && filteredSenders.length > 0}
                            onChange={toggleAll}
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800/50 text-emerald-500"
                        />
                        Select all
                    </label>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{filteredSenders.length} senders</span>
                </div>

                {/* Table Body */}
                <div className="glass rounded-b-3xl border-t-0 max-h-[calc(100vh-320px)] overflow-y-auto">
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
                                        flex md:grid md:grid-cols-12 gap-3 md:gap-4 p-4 md:px-6 md:h-[84px] items-center group transition-colors duration-200
                                        ${sender.count > 100 ? "border-l-4 border-l-red-500 bg-red-500/5" : "border-l-2 border-l-transparent"}
                                        ${selectedIds.has(sender.id) ? "bg-emerald-500/5 !border-l-emerald-500" : "hover:bg-zinc-800/30"}
                                    `}
                                    >
                                        {/* Checkbox */}
                                        <div className="md:col-span-1 flex justify-center shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(sender.id)}
                                                onChange={() => toggleSelection(sender.id)}
                                                className="w-5 h-5 md:w-4 md:h-4 rounded border-zinc-700 bg-zinc-800/50 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                                            />
                                        </div>

                                        {/* Identity */}
                                        <div className="md:col-span-5 flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-sm md:text-base shrink-0 border border-zinc-700">
                                                {sender.name[0]}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-black tracking-tight text-zinc-100 truncate text-sm md:text-base">{sender.name}</div>
                                                    {sender.category === "Personal" && (
                                                        <span className="hidden md:inline px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest">
                                                            Personal
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs md:text-sm text-zinc-500 truncate">{sender.email}</div>
                                            </div>
                                        </div>

                                        {/* Volume - Simplified on mobile */}
                                        <div className="md:col-span-4 flex items-center gap-2 md:gap-4 shrink-0">
                                            <div className={`font-mono font-bold text-base md:text-lg ${sender.count > 100 ? "text-red-400" :
                                                sender.count > 20 ? "text-emerald-400" : "text-zinc-300"
                                                }`}>
                                                {sender.count}
                                            </div>
                                            <div className="hidden md:flex flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min((sender.count / 50) * 100, 100)}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className={`h-full rounded-full ${sender.count > 100 ? "bg-red-500 premium-pulse-red" :
                                                        sender.count > 20 ? "bg-emerald-500" : "bg-zinc-600"
                                                        }`}
                                                />
                                            </div>
                                            <div className={`hidden md:block text-xs font-mono w-12 text-right ${sender.count > 100 ? "text-red-400 font-bold text-glow-red" : "text-zinc-600"
                                                }`}>
                                                {sender.count > 100 ? "DANGER" : sender.count > 20 ? "HIGH" : "LOW"}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="md:col-span-2 flex justify-center gap-1 md:gap-2 shrink-0">
                                            {/* Expand Toggle - Hidden on mobile */}
                                            <button
                                                onClick={() => setExpandedRow(expandedRow === sender.id ? null : sender.id)}
                                                className={`hidden md:flex p-2 rounded-lg border transition-colors ${expandedRow === sender.id
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
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
                                                    const confirmed = await confirmModal({
                                                        title: "Block Sender?",
                                                        message: `Are you sure you want to block ${sender.name} and trash all existing emails? Future emails from this sender will be automatically trashed.`,
                                                        confirmLabel: "YES, BLOCK THEM",
                                                        variant: "danger"
                                                    });

                                                    if (confirmed) {
                                                        const result = await blockSender(sender.email);
                                                        if (result.success) {
                                                            showToast(`Blocked ${sender.name} - future emails auto-trashed ✓`, {
                                                                type: "success",
                                                                undoAction: async () => {
                                                                    const success = await undoLastAction();
                                                                    if (success) {
                                                                        showToast("Block removed ✓", { type: "info" });
                                                                    }
                                                                }
                                                            });
                                                        } else {
                                                            showToast("Failed to block sender", { type: "error" });
                                                        }
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
                                                className="glass border-l-4 border-l-emerald-500/30 overflow-hidden"
                                            >
                                                <div className="px-8 py-4">
                                                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <Mail className="w-3 h-3" />
                                                        Sample Subjects
                                                    </p>
                                                    <ul className="space-y-2">
                                                        {sender.sampleSubjects.map((subject, idx) => (
                                                            <li key={idx} className="text-sm text-zinc-400 flex items-start gap-2">
                                                                <span className="text-emerald-500/50">•</span>
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
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                <span className="text-emerald-400 font-bold text-sm">{group.senders.length}</span>
                                            </div>
                                            <div>
                                                <div className="font-black tracking-tight text-zinc-100">@{group.domain}</div>
                                                <div className="text-xs text-zinc-500">{group.senders.length} senders</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`font-mono font-bold text-lg ${group.totalCount > 100 ? "text-red-400" : "text-emerald-400"
                                                }`}>
                                                {group.totalCount} emails
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    // Use real nukeDomain that creates Gmail filter
                                                    const result = await nukeDomain(group.domain);

                                                    if (result.requiresConfirmation) {
                                                        // Domain requires confirmation (caution category)
                                                        const confirmed = await confirmModal({
                                                            title: "Nuke Domain?",
                                                            message: `Wait! @${group.domain} might send important updates. Are you sure you want to nuke all current and future emails from this entire domain?`,
                                                            confirmLabel: "NUKE EVERYTHING",
                                                            variant: "danger"
                                                        });

                                                        if (confirmed) {
                                                            const confirmResult = await nukeDomain(group.domain, true);
                                                            if (confirmResult.success) {
                                                                showToast(`Nuked @${group.domain} - blocked future emails ✓`, {
                                                                    type: "success",
                                                                    undoAction: async () => {
                                                                        const success = await undoLastAction();
                                                                        if (success) {
                                                                            showToast("Filter removed ✓", { type: "info" });
                                                                        }
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    } else if (result.success) {
                                                        showToast(`Nuked @${group.domain} - blocked future emails ✓`, {
                                                            type: "success",
                                                            undoAction: async () => {
                                                                const success = await undoLastAction();
                                                                if (success) {
                                                                    showToast("Filter removed ✓", { type: "info" });
                                                                }
                                                            }
                                                        });
                                                    } else {
                                                        showToast(`Cannot nuke @${group.domain}`, { type: "error" });
                                                    }
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
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-4xl h-20 bg-zinc-950 border border-emerald-500/40 rounded-3xl px-8 flex items-center justify-between z-[200] shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <div className="text-lg font-black tracking-tight text-zinc-100">
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

            {/* Mobile Floating Action Button */}
            {
                selectedIds.size > 0 && (
                    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                        <button
                            onClick={handleTrashSelected}
                            disabled={processing}
                            className="flex items-center gap-2 px-6 py-4 bg-red-500 text-white font-bold rounded-full shadow-lg shadow-red-500/30 active:scale-95 transition-transform disabled:opacity-50"
                        >
                            {processing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Trash2 className="w-5 h-5" />
                            )}
                            Trash {selectedIds.size} selected
                        </button>
                    </div>
                )
            }
        </div >
    );
}
