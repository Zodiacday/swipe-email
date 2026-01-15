/**
 * Global Navbar - Obsidian Mint Edition
 * Persistent navigation across all pages
 * Fully responsive for desktop and mobile
 * 
 * Features:
 * - Smart logo: links to /mode-select when logged in
 * - User dropdown with Profile, Automation, Sign Out
 * - Mobile-optimized menu
 */

"use client";

import { Menu, X, Zap, User, LogOut, LayoutDashboard, Settings, Shield, ChevronDown, Sparkles, Bot, Crown, MessageSquare } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { StreakBadge } from "@/components/StreakBadge";

const NAV_LINKS = [
    { href: "/swipe", label: "Swipe", icon: Zap, tooltip: "The Game" },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, tooltip: "Manage Senders" },
    { href: "/providers", label: "Connections", icon: Settings, tooltip: "Inbox Source" },
];

const USER_MENU_LINKS = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/automation", label: "Automation", icon: Bot },
    { href: "/feedback", label: "Feedback", icon: MessageSquare },
];

export function Navbar() {
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const pathname = usePathname();
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close user menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Only hide on onboarding
    if (pathname === "/onboarding") return null;

    const isAppRoute = ["/swipe", "/dashboard", "/mode-select", "/profile", "/providers", "/automation"].includes(pathname);

    // Smart logo link: mode-select when logged in, home when not
    const logoHref = session ? "/mode-select" : "/";

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] ${isAppRoute && session ? 'bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50' : isAppRoute ? 'bg-zinc-950 border-b border-emerald-500/30' : 'bg-black/50 backdrop-blur-xl border-b border-zinc-900'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                {/* Logo - Smart link based on auth state */}
                <Link href={logoHref} className="flex items-center gap-2 group shrink-0">
                    <img
                        src="/logo.png"
                        alt="Swipe Logo"
                        className="w-8 h-8 object-contain group-hover:scale-110 transition-transform"
                    />
                    <span className="text-lg font-black tracking-tighter text-white hidden sm:inline uppercase">Swipe</span>
                </Link>

                {/* Desktop Nav Links (The Switch) */}
                {session && (
                    <div className="hidden md:flex items-center p-1 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800">
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
                )}

                {/* Auth Buttons - Desktop */}
                <div className="hidden md:flex items-center gap-2 lg:gap-3">
                    {session ? (
                        <div className="flex items-center gap-3">
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

                            {/* User Dropdown */}
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    aria-label="Open user menu"
                                    aria-expanded={userMenuOpen}
                                    aria-haspopup="menu"
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
                                >
                                    {session.user?.image ? (
                                        <Image src={session.user.image} alt="" width={24} height={24} className="rounded-full" />
                                    ) : (
                                        <User className="w-5 h-5 text-zinc-400" />
                                    )}
                                    <span className="text-sm font-medium text-zinc-300">{session.user?.name?.split(' ')[0]}</span>
                                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50"
                                        >
                                            <div className="p-2">
                                                {USER_MENU_LINKS.map(link => {
                                                    const Icon = link.icon;
                                                    const isActive = pathname === link.href;
                                                    return (
                                                        <Link
                                                            key={link.href}
                                                            href={link.href}
                                                            onClick={() => setUserMenuOpen(false)}
                                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                                                }`}
                                                        >
                                                            <Icon className="w-4 h-4" />
                                                            {link.label}
                                                        </Link>
                                                    );
                                                })}

                                                <div className="h-[1px] bg-zinc-800 my-2" />

                                                {/* Upgrade CTA */}
                                                <Link
                                                    href="/#pricing"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/20 text-amber-400 hover:border-amber-500/40 transition-colors"
                                                >
                                                    <Crown className="w-4 h-4" />
                                                    Upgrade to Pro
                                                </Link>

                                                <div className="h-[1px] bg-zinc-800 my-2" />

                                                <button
                                                    onClick={() => {
                                                        setUserMenuOpen(false);
                                                        signOut();
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
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
                            {/* Main Nav Links */}
                            {NAV_LINKS.map(link => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${pathname === link.href
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {link.label}
                                    </Link>
                                );
                            })}

                            <div className="h-[1px] bg-white/5 my-4" />

                            {/* User Menu Links (Profile, Automation) */}
                            {session && USER_MENU_LINKS.map(link => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${pathname === link.href
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {link.label}
                                    </Link>
                                );
                            })}

                            <div className="h-[1px] bg-white/5 my-4" />

                            {session ? (
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        signOut();
                                    }}
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
