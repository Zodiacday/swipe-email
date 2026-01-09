/**
 * Multi-Provider Settings Page
 * Reference: Page 13 — MULTI-PROVIDER SUPPORT
 * 
 * Connect multiple email accounts:
 * - Gmail
 * - Outlook
 * - Yahoo
 * - iCloud
 * - IMAP
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import {
    Mail,
    Plus,
    Check,
    ChevronRight,
    Shield,
    Trash2,
    RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface EmailAccount {
    id: string;
    provider: "gmail" | "outlook" | "yahoo" | "icloud" | "imap";
    email: string;
    connected: boolean;
    lastSync?: number;
    emailCount?: number;
}

const DEMO_ACCOUNTS: EmailAccount[] = [
    {
        id: "1",
        provider: "gmail",
        email: "demo@gmail.com",
        connected: true,
        lastSync: Date.now() - 1000 * 60 * 5,
        emailCount: 1247,
    },
];

const PROVIDER_INFO = {
    gmail: {
        name: "Gmail",
        color: "from-red-500 to-orange-500",
        icon: "📧",
        authProvider: "google",
    },
    outlook: {
        name: "Outlook",
        color: "from-blue-500 to-cyan-500",
        icon: "📨",
        authProvider: "azure-ad",
    },
    yahoo: {
        name: "Yahoo",
        color: "from-purple-500 to-pink-500",
        icon: "💌",
        authProvider: "yahoo",
    },
    icloud: {
        name: "iCloud",
        color: "from-blue-400 to-blue-600",
        icon: "☁️",
        authProvider: "apple",
    },
    imap: {
        name: "IMAP",
        color: "from-gray-500 to-gray-700",
        icon: "⚙️",
        authProvider: null, // Requires custom credentials flow
    },
};

export default function ProvidersPage() {
    const { data: session } = useSession();
    const [accounts, setAccounts] = useState<EmailAccount[]>(DEMO_ACCOUNTS);
    const [showAddProvider, setShowAddProvider] = useState(false);

    useEffect(() => {
        if (session) {
            // Add real session account to the list
            const realAccount: EmailAccount = {
                id: "real-gmail",
                provider: "gmail",
                email: session.user?.email || "Connected Gmail",
                connected: true,
                lastSync: Date.now(),
                emailCount: 1247, // Placeholder or fetch real count if available
            };
            setAccounts([realAccount]);
        } else {
            setAccounts(DEMO_ACCOUNTS);
        }
    }, [session]);

    const handleConnect = (provider: EmailAccount["provider"]) => {
        const providerInfo = PROVIDER_INFO[provider];
        if (providerInfo.authProvider) {
            // Trigger real OAuth flow
            signIn(providerInfo.authProvider, { callbackUrl: "/providers" });
        } else {
            // Coming soon - show message
            alert(`${providerInfo.name} support is coming soon!`);
        }
        setShowAddProvider(false);
    };

    const handleDisconnect = (id: string) => {
        setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    };

    const handleSync = (id: string) => {
        console.log(`Syncing account ${id}...`);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pt-20 selection:bg-emerald-500/30">
            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                        <Mail className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-2 tracking-tighter italic uppercase">
                        Connected <span className="text-emerald-500 not-italic">Accounts</span>
                    </h2>
                    <p className="text-zinc-500 font-medium">
                        Manage all your email command sources in one place
                    </p>
                </motion.div>

                {/* Connected Accounts */}
                <div className="space-y-4 mb-12">
                    {accounts.map((account, i) => (
                        <motion.div
                            key={account.id}
                            className="p-6 rounded-[32px] bg-zinc-950 border border-zinc-900 hover:border-emerald-500/30 transition-colors shadow-lg"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="flex items-start gap-5">
                                {/* Provider Icon */}
                                <div
                                    className={`w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl shadow-lg`}
                                >
                                    {PROVIDER_INFO[account.provider].icon}
                                </div>

                                {/* Account Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-white">
                                            {PROVIDER_INFO[account.provider].name}
                                        </h3>
                                        {account.connected && (
                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full">
                                                <Check className="w-3 h-3 text-green-400" />
                                                <span className="text-xs text-green-400 font-medium">
                                                    Connected
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 mb-3">{account.email}</p>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span>{account.emailCount?.toLocaleString()} emails</span>
                                        {account.lastSync && (
                                            <span>
                                                Last synced{" "}
                                                {Math.round((Date.now() - account.lastSync) / 60000)}m
                                                ago
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleSync(account.id)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                        title="Sync now"
                                    >
                                        <RefreshCw className="w-4 h-4 text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => handleDisconnect(account.id)}
                                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                                        title="Disconnect"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Add Account Button */}
                <motion.button
                    onClick={() => setShowAddProvider(true)}
                    className="w-full p-8 rounded-3xl border-2 border-dashed border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-3 text-zinc-400 hover:text-emerald-400 group"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                    <span className="font-black tracking-widest uppercase text-sm">Add Email Account</span>
                </motion.button>

                {/* Add Provider Modal */}
                {showAddProvider && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowAddProvider(false)}
                    >
                        <motion.div
                            className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl p-8 max-w-md w-full border border-white/10"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-black text-white mb-6">
                                Choose Provider
                            </h3>

                            <div className="space-y-3">
                                {(
                                    Object.entries(PROVIDER_INFO) as [
                                        keyof typeof PROVIDER_INFO,
                                        (typeof PROVIDER_INFO)[keyof typeof PROVIDER_INFO]
                                    ][]
                                ).map(([key, info]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleConnect(key)}
                                        className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center gap-4"
                                    >
                                        <div
                                            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${info.color} flex items-center justify-center text-xl`}
                                        >
                                            {info.icon}
                                        </div>
                                        <span className="flex-1 text-left font-semibold text-white">
                                            {info.name}
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowAddProvider(false)}
                                className="w-full mt-6 py-3 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Security Notice */}
                <motion.div
                    className="mt-8 p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-blue-300 mb-1">
                                Your data is secure
                            </h4>
                            <p className="text-sm text-blue-200/80">
                                We use OAuth 2.0 for authentication. We never store your
                                password and only access metadata (sender, subject, headers).
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
