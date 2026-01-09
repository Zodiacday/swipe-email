"use client";

import { motion } from "framer-motion";

/**
 * Template wraps all pages and provides smooth transitions
 * between route changes using Framer Motion.
 */
const LIQUID_EASE = [0.6, 0.01, -0.05, 0.95] as [number, number, number, number];

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, filter: "blur(12px)", scale: 0.98 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{
                duration: 0.8,
                ease: LIQUID_EASE
            }}
        >
            {children}
        </motion.div>
    );
}
