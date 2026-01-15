"use client";

/**
 * Floating Feedback Button
 * Non-intrusive, appears on all pages except /swipe
 * Smaller on mobile, positioned to not interfere with navigation
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function FeedbackButton() {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);

    // Hide on swipe page (interferes with swiping) and feedback page itself
    const hiddenPaths = ["/swipe", "/feedback", "/login", "/onboarding"];
    if (hiddenPaths.some(path => pathname?.startsWith(path))) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8"
        >
            <Link
                href="/feedback"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group flex items-center gap-2 px-3 py-3 md:px-4 md:py-3 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 hover:border-emerald-500/50 rounded-full shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
            >
                <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />

                <AnimatePresence>
                    {isHovered && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="text-sm font-medium text-zinc-300 whitespace-nowrap overflow-hidden hidden md:block"
                        >
                            Feedback
                        </motion.span>
                    )}
                </AnimatePresence>
            </Link>
        </motion.div>
    );
}
