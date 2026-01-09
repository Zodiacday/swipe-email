/**
 * Global Navbar - Obsidian Mint Edition
 * Persistent navigation across all pages
 * Fully responsive for desktop and mobile
 */

"use client";

import { Menu, X, LogIn, Zap, User, LogOut, LayoutDashboard, Settings, Shield } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { StreakBadge } from "@/components/StreakBadge";
const NAV_LINKS = [
    { href: "/swipe", label: "Swipe", icon: Zap, tooltip: "The Game" },
    { href: "/dashboard", label: "Command Center", icon: LayoutDashboard, tooltip: "Bulk Nuke" },
    { href: "/providers", label: "Connections", icon: Settings, tooltip: "Inbox Source" },
];

function OozeTooltip({ text, children, active = true }: { text: string, children: React.ReactNode, active?: boolean }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {children}
            <AnimatePresence>
                {hovered && active && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 10, filter: "blur(10px)" }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            filter: "blur(0px)",
                            transition: { type: "spring", stiffness: 400, damping: 15, mass: 0.6 }
                        }}
                        exit={{ opacity: 0, scale: 0.8, y: 10, filter: "blur(5px)", transition: { duration: 0.2 } }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-[110] pointer-events-none"
                    >
                        <div className="bg-emerald-500 text-zinc-950 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap shadow-[0_0_20px_rgba(16,185,129,0.4)] relative">
                            {text}
                            {/* Liquid Tip */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-4 h-4 bg-emerald-500 rotate-45 rounded-sm -z-10" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function Navbar() {
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Only hide on onboarding
    if (pathname === "/onboarding") return null;

    const isAppRoute = ["/swipe", "/dashboard", "/mode-select", "/profile", "/providers", "/automation"].includes(pathname);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] ${isAppRoute && session ? 'bg-transparent border-transparent' : isAppRoute ? 'bg-zinc-950 border-b border-emerald-500/30' : 'bg-black/50 backdrop-blur-xl border-b border-zinc-900'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <img
                        src="/logo.png"
                        alt="Swipe Logo"
                        className="w-8 h-8 object-contain group-hover:scale-110 transition-transform"
                    />
                    <span className="text-lg font-black tracking-tighter text-white hidden sm:inline uppercase">Swipe</span>
                </Link>

                {/* Desktop Nav Links (The Switch) */}
                <div className={`hidden md:flex items-center p-1 rounded-2xl ${isAppRoute && session ? 'bg-zinc-900/80 backdrop-blur-xl border border-zinc-800' : 'glass border border-zinc-800/50'}`}>
                    {NAV_LINKS.map(link => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`
                                    flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] uppercase tracking-widest font-black transition-all
                                    ${isActive
                                        ? 'bg-zinc-800 text-white'
                                        : 'text-zinc-500 hover:text-zinc-300'}
                                `}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Auth Buttons - Desktop */}
                <div className="hidden md:flex items-center gap-2 lg:gap-3">
                    {session ? (
                        <div className="flex items-center gap-4">
                            {/* Privacy Badge */}
                            <div
                                className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
                            >
                                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[9px] font-bold text-emerald-400 tracking-wide">
                                    We don't read or store your data
                                </span>
                            </div>

                            {/* Streak with Live Ping */}
                            <div className="relative">
                                <StreakBadge size="sm" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                            </div>

                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                                {session.user?.image ? (
                                    <img src={session.user.image} alt="" className="w-5 h-5 rounded-full" />
                                ) : (
                                    <User className="w-4 h-4 text-zinc-400" />
                                )}
                                <span className="text-sm font-medium text-zinc-300">{session.user?.name?.split(' ')[0]}</span>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                                title="Sign Out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-zinc-950 text-xs font-black tracking-widest uppercase rounded-full hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-95"
                        >
                            <Zap className="w-4 h-4" />
                            <span className="hidden sm:inline">Get Started</span>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? (
                        <X className="w-6 h-6 text-white" />
                    ) : (
                        <Menu className="w-6 h-6 text-white" />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {NAV_LINKS.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${pathname === link.href
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <div className="h-[1px] bg-white/5 my-4" />

                            {session ? (
                                <button
                                    onClick={() => signOut()}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-zinc-400 hover:text-red-400 bg-white/5"
                                >
                                    <span>Sign Out</span>
                                    <LogOut className="w-4 h-4" />
                                </button>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 rounded-xl text-base font-bold bg-emerald-500 text-black text-center"
                                >
                                    Get Started
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
