/**
 * Profile Page - Obsidian Mint Edition
 */

"use client";

import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { LogOut, Mail, Calendar, Trash2, Shield, User, Clock, Settings, ChevronRight, X, Heart, ShieldOff } from "lucide-react";
import Link from "next/link";
import { useEmailContext } from "@/contexts/EmailContext";
import { useState } from "react";

export default function ProfilePage() {
    const { data: session } = useSession();
    const { aggregates, blockedSenders, personalSenders } = useEmailContext();
    const [showBlocked, setShowBlocked] = useState(false);
    const [showPersonal, setShowPersonal] = useState(false);

    // Calculate real stats
    const emailsCleared = aggregates.stats.totalEmails;
    const timeSaved = Math.round(emailsCleared * 0.1); // Estimate: 6 seconds per email = 0.1 min

    const user = {
        name: session?.user?.name || "User",
        email: session?.user?.email || "loading...",
        image: session?.user?.image,
        joinedDate: "January 2026", // Placeholder - could get from session/db
    };

    // Convert Sets to arrays for display
    const blockedList = [...blockedSenders];
    const personalList = [...personalSenders];

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-20 pb-12 px-4 selection:bg-emerald-500/30">
            <div className="max-w-2xl mx-auto">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-3xl p-8 mb-6"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden">
                            {user.image ? (
                                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-emerald-500" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-black tracking-tight mb-1">{user.name}</h1>
                            <p className="text-zinc-500 text-sm flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {user.email}
                            </p>
                            <p className="text-zinc-600 text-xs mt-1 flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                Joined {user.joinedDate}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid (2 items, no streak) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 gap-4 mb-6"
                >
                    <div className="glass p-5 rounded-3xl text-center">
                        <Trash2 className="w-5 h-5 text-red-400 mx-auto mb-2" />
                        <div className="text-2xl font-black tracking-tight mb-1">{emailsCleared.toLocaleString()}</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Emails Processed</div>
                    </div>
                    <div className="glass p-5 rounded-3xl text-center">
                        <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                        <div className="text-2xl font-black tracking-tight mb-1">{timeSaved}</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Minutes Saved</div>
                    </div>
                </motion.div>

                {/* Blocked Senders */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="glass rounded-3xl mb-4 overflow-hidden"
                >
                    <button
                        onClick={() => setShowBlocked(!showBlocked)}
                        className="w-full flex items-center gap-4 p-5 hover:bg-white/2 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <ShieldOff className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="flex-1 text-left">
                            <div className="font-black tracking-tight text-zinc-100">Blocked Senders</div>
                            <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">{blockedList.length} sender{blockedList.length !== 1 ? "s" : ""} blocked</div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-zinc-500 transition-transform ${showBlocked ? "rotate-90" : ""}`} />
                    </button>
                    {showBlocked && blockedList.length > 0 && (
                        <div className="border-t border-zinc-800 p-4 space-y-2 max-h-48 overflow-y-auto">
                            {blockedList.map((email) => (
                                <div key={email} className="flex items-center justify-between p-2 bg-zinc-900/50 rounded-lg text-sm">
                                    <span className="text-zinc-300 truncate">{email}</span>
                                    <span className="text-[10px] text-zinc-600">Filter active</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {showBlocked && blockedList.length === 0 && (
                        <div className="border-t border-zinc-800 p-6 text-center text-zinc-500 text-sm">
                            No blocked senders yet
                        </div>
                    )}
                </motion.div>

                {/* Personal Senders */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="glass rounded-3xl mb-6 overflow-hidden"
                >
                    <button
                        onClick={() => setShowPersonal(!showPersonal)}
                        className="w-full flex items-center gap-4 p-5 hover:bg-white/2 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1 text-left">
                            <div className="font-black tracking-tight text-zinc-100">Personal Senders</div>
                            <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">{personalList.length} sender{personalList.length !== 1 ? "s" : ""} marked as personal</div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-zinc-500 transition-transform ${showPersonal ? "rotate-90" : ""}`} />
                    </button>
                    {showPersonal && personalList.length > 0 && (
                        <div className="border-t border-zinc-800 p-4 space-y-2 max-h-48 overflow-y-auto">
                            {personalList.map((email) => (
                                <div key={email} className="flex items-center justify-between p-2 bg-zinc-900/50 rounded-lg text-sm">
                                    <span className="text-zinc-300 truncate">{email}</span>
                                    <span className="text-[10px] text-emerald-500">Protected</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {showPersonal && personalList.length === 0 && (
                        <div className="border-t border-zinc-800 p-6 text-center text-zinc-500 text-sm">
                            No personal senders marked yet
                        </div>
                    )}
                </motion.div>

                {/* Settings Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-3xl overflow-hidden mb-6"
                >
                    {[
                        { icon: Mail, label: "Connected Accounts", href: "/providers", desc: "Manage your email providers" },
                        { icon: Settings, label: "Automation Rules", href: "/automation", desc: "Configure auto-cleanup" },
                        { icon: Shield, label: "Privacy Settings", href: "#", desc: "Control your data" },
                    ].map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            className="flex items-center gap-4 p-5 border-b border-zinc-900 last:border-0 hover:bg-white/2 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-emerald-500/30 transition-colors">
                                <item.icon className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                            </div>
                            <div className="flex-1">
                                <div className="font-black tracking-tight text-zinc-100">{item.label}</div>
                                <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">{item.desc}</div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                        </Link>
                    ))}
                </motion.div>

                {/* Logout Button */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full p-4 rounded-3xl border border-red-500/20 bg-red-500/5 text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </motion.button>
            </div>
        </div>
    );
}

