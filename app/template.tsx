"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Template wraps all pages and provides smooth transitions
 * between route changes using Framer Motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                    duration: 0.15,
                    ease: [0.25, 0.1, 0.25, 1.0] // Custom easing
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
