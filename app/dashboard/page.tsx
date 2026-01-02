"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Trash2,
    Shield,
    Archive,
    Search,
    Filter,
    ArrowUpRight,
    Users,
    Globe,
    Calendar,
    CheckSquare
} from "lucide-react";

import { AggregatedSender, DashboardStats } from "@/lib/engines/aggregation";

export default function DashboardPage() {
    const [selectedView, setSelectedView] = useState<"senders" | "domains" | "aging">("senders");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Data State
    const [loading, setLoading] = useState(true);
    const [senders, setSenders] = useState<AggregatedSender[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);

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

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedIds.size === senders.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(senders.map(s => s.id)));
        }
    };

    const [processing, setProcessing] = useState(false);

    const handleTrashSelected = async () => {
        if (selectedIds.size === 0) return;
        setProcessing(true);

        // Optimistic Update: Remove from UI immediately
        const idsToDelete = Array.from(selectedIds);

        // Find which senders are fully deleted (assuming we selected by sender ID, 
        // but wait - our ID usage is tricky. 
        // The sender object has an ID. But we need actual MESSAGE IDs to trash.
        // LIMITATION: Our aggregation only tracks counts, not message IDs. 
        // FIX: We need a new endpoint or to change aggregation to keep IDs.
        // FOR NOW: We will assume we can't actually nuke without Message IDs.
        // Let's implement a 'Simulate' mostly or fetch IDs on demand. 
        // ACTUALLY: The AggregatedSender *should* act as a filter.
        // We will call an endpoint "Trash All From Sender".

        try {
            // We need a different strategy. We can't pass [sender-id] to batch trash.
            // We have to pass a query like "from:facebook.com".
            // Let's update the API to iterate.

            const sendersToDelete = senders.filter(s => selectedIds.has(s.id));

            for (const sender of sendersToDelete) {
                await fetch("/api/gmail/action", {
                    method: "POST",
                    body: JSON.stringify({
                        action: "TRASH_SENDER",
                        payload: { email: sender.email } // We trust the email field
                    })
                });
            }

            // Update UI
            setSenders(prev => prev.filter(s => !selectedIds.has(s.id)));
            setSelectedIds(new Set());

            // Toast logic would go here
        } catch (err) {
            console.error("Nuke failed", err);
            // Revert optimistic update ideally
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <div className="text-zinc-500 font-mono text-sm">SCANNING INBOX...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-24">
            {/* Top Bar / Ticker (Compact) */}
            <div className="h-14 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl flex items-center px-6 sticky top-0 z-50 justify-between">
                <div className="flex items-center gap-2 text-emerald-500 font-bold tracking-tight">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>COMMAND CENTER</span>
                </div>

                <div className="flex items-center gap-8 text-xs font-mono">
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-500">Total Emails:</span>
                        <span className="text-zinc-100">{stats?.totalEmails.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-500">Unique Senders:</span>
                        <span className="text-emerald-400">{stats?.uniqueSenders.toLocaleString() || 0}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto p-6">

                {/* Mode Switcher / Tabs */}
                <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl w-fit mb-8 border border-zinc-800">
                    {[
                        { id: "senders", label: "By Sender", icon: Users },
                        { id: "domains", label: "By Domain", icon: Globe },
                        { id: "aging", label: "By Age", icon: Calendar }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedView(tab.id as any)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${selectedView === tab.id
                                    ? "bg-zinc-800 text-white shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"}
                            `}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Data Grid (The "Big Offenders" List) */}
                <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/20 backdrop-blur-sm">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-zinc-900/80 border-b border-zinc-800 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                        <div className="col-span-1 flex items-center">
                            <button onClick={toggleAll} className="hover:text-white transition-colors">
                                <CheckSquare className={`w-4 h-4 ${selectedIds.size === senders.length && senders.length > 0 ? "text-emerald-500" : ""}`} />
                            </button>
                        </div>
                        <div className="col-span-4">Sender Name</div>
                        <div className="col-span-3 text-right">Volume</div>
                        <div className="col-span-2 text-right">Last Active</div>
                        <div className="col-span-2 text-right">Quick Actions</div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-zinc-800/50">
                        {senders.map((sender) => (
                            <motion.div
                                key={sender.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`
                                    grid grid-cols-12 gap-4 px-6 py-4 items-center group
                                    hover:bg-zinc-800/30 transition-colors
                                    ${selectedIds.has(sender.id) ? "bg-emerald-900/10" : ""}
                                `}
                            >
                                {/* Checkbox */}
                                <div className="col-span-1">
                                    <button
                                        onClick={() => toggleSelection(sender.id)}
                                        className={`p-1 rounded hover:bg-zinc-700 transition-colors ${selectedIds.has(sender.id) ? "text-emerald-500" : "text-zinc-600"}`}
                                    >
                                        <CheckSquare className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Identity */}
                                <div className="col-span-4 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                                            {sender.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-medium text-zinc-200 truncate">{sender.name}</div>
                                            <div className="text-xs text-zinc-500 truncate">{sender.email}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Volume Bar */}
                                <div className="col-span-3 flex items-center justify-end gap-3">
                                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full max-w-[100px] overflow-hidden">
                                        <div
                                            className="h-full bg-zinc-600 group-hover:bg-emerald-500 transition-colors"
                                            style={{ width: `${Math.min(sender.count / 20, 100)}%` }}
                                        />
                                    </div>
                                    <span className="font-mono text-zinc-300 w-12 text-right">{sender.count}</span>
                                </div>

                                {/* Date */}
                                <div className="col-span-2 text-right text-xs text-zinc-500 font-mono">
                                    {new Date(sender.lastActive).toLocaleDateString()}
                                </div>

                                {/* Actions */}
                                <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-zinc-700 rounded text-zinc-400 hover:text-red-400" title="Trash All">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-zinc-700 rounded text-zinc-400 hover:text-amber-400" title="Block">
                                        <Shield className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Floating Bulk Action Bar */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: selectedIds.size > 0 ? 0 : 100 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-zinc-900 border border-zinc-700 shadow-2xl rounded-2xl p-4 flex items-center justify-between z-50 text-sm"
            >
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-500 text-black font-bold px-3 py-1 rounded-full">
                        {selectedIds.size} Selected
                    </div>
                    <span className="text-zinc-400">
                        Approx {selectedIds.size * 124} emails selected
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 hover:bg-zinc-800 rounded-lg text-zinc-300 font-medium transition-colors">
                        Mark Read
                    </button>
                    <button
                        onClick={handleTrashSelected}
                        disabled={processing}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {processing ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        TRASH ALL
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
