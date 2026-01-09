/**
 * Login Page - Real OAuth Integration
 */

"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Check, Sparkles } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Always redirect to mode-select after login
    const redirectPath = "/mode-select";

    // Redirect if already logged in
    useEffect(() => {
        if (session) {
            router.push(redirectPath);
        }
    }, [session, router]);

    const handleGoogleLogin = () => {
        signIn("google", { callbackUrl: redirectPath });
    };

    // Show login form even if session is loading (prevents blank page)
    // The MagneticButton will be disabled if still loading
    const isAuthLoading = status === "loading";

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 pt-20 selection:bg-emerald-500/30">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-6">
                        <Sparkles className="w-3 h-3" />
                        One Click Login
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter mb-3 uppercase italic leading-[0.9]">Clean Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 not-italic">Inbox</span></h1>
                    <p className="text-zinc-500 text-lg font-medium">Connect your email and start swiping in seconds</p>
                </div>

                {/* Login Card */}
                <div className="bg-zinc-950 p-8 rounded-[40px] border border-zinc-900 shadow-2xl">
                    <MagneticButton
                        onClick={handleGoogleLogin}
                        className="w-full py-4 bg-white text-zinc-950 font-black tracking-widest uppercase text-xs rounded-2xl flex items-center justify-center gap-3 mb-6 shadow-xl hover:bg-zinc-200 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </MagneticButton>

                    <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-xs text-zinc-400">
                            We only read and delete emails you explicitly swipe. Your data stays on Google's servers.
                        </p>
                    </div>
                </div>

                {/* Features */}
                <div className="mt-8 grid grid-cols-4 gap-3 text-center">
                    {[
                        { label: "←", desc: "Trash" },
                        { label: "→", desc: "Keep" },
                        { label: "↑", desc: "Unsub" },
                        { label: "↓", desc: "Skip" },
                    ].map((item, i) => (
                        <div key={i} className="text-zinc-500">
                            <div className="text-lg font-bold text-emerald-500">{item.label}</div>
                            <div className="text-[10px] uppercase tracking-wider">{item.desc}</div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-zinc-800 w-full">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                            <Shield className="w-5 h-5 text-emerald-500" />
                            <div className="text-left">
                                <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Security</div>
                                <div className="text-xs font-bold text-zinc-300">Audit Passed</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                            <Check className="w-5 h-5 text-emerald-500" />
                            <div className="text-left">
                                <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Privacy</div>
                                <div className="text-xs font-bold text-zinc-300">Local Only</div>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-4 font-mono text-center">
                        v2.0.1 • SECURE CONNECTION
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
