/**
 * Profile Page - Obsidian Mint Edition
 */

"use client";

import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { LogOut, Mail, Calendar, Trash2, Shield, User, Clock, Settings, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEmailContext } from "@/contexts/EmailContext";

export default function ProfilePage() {
    const { data: session } = useSession();
    const { aggregates } = useEmailContext();

    // Calculate real stats
    const emailsCleared = aggregates.stats.totalEmails;
    const timeSaved = Math.round(emailsCleared * 0.1); // Estimate: 6 seconds per email = 0.1 min

    const user = {
        name: session?.user?.name || "User",
        email: session?.user?.email || "loading...",
        image: session?.user?.image,
        joinedDate: "January 2026", // Placeholder - could get from session/db
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] pt-20 pb-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass border-zinc-800 p-8 rounded-[2rem] mb-6"
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
                            <h1 className="text-2xl font-heading font-black mb-1">{user.name}</h1>
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
                    <div className="glass border-zinc-800 p-5 rounded-2xl text-center">
                        <Trash2 className="w-5 h-5 text-red-400 mx-auto mb-2" />
                        <div className="text-2xl font-heading font-black mb-1">{emailsCleared.toLocaleString()}</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Emails Processed</div>
                    </div>
                    <div className="glass border-zinc-800 p-5 rounded-2xl text-center">
                        <Clock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                        <div className="text-2xl font-heading font-black mb-1">{timeSaved}</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Minutes Saved</div>
                    </div>
                </motion.div>

                {/* Settings Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass border-zinc-800 rounded-[2rem] overflow-hidden mb-6"
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
                                <div className="font-bold text-white">{item.label}</div>
                                <div className="text-xs text-zinc-500">{item.desc}</div>
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
                    className="w-full p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </motion.button>
            </div>
        </div>
    );
}

