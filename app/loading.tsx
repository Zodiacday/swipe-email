"use client";

/**
 * Global Loading State
 * Shows while route transitions or initial data loads
 */

import { motion } from "framer-motion";
import Image from "next/image";

export default function Loading() {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            {/* Ambient glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10 flex flex-col items-center gap-6"
            >
                {/* Logo pulse */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
                >
                    <Image src="/logo.png" alt="Swipe" width={40} height={40} className="object-contain" priority />
                </motion.div>

                {/* Loading bar */}
                <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-emerald-500"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                <p className="text-zinc-500 text-sm font-medium tracking-wide">Loading...</p>
            </motion.div>
        </div>
    );
}
