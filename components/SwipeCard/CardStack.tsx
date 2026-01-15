/**
 * CardStack Component
 * Manages the 3-card stack for swipe interface
 * Updated to use simplified Left=Trash, Right=Keep gestures
 */

"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SwipeCard } from "./SwipeCard";
import type { NormalizedEmail, SwipeAction } from "@/lib/types";
import { BufferItem } from "@/lib/engines/buffer";

interface CardStackProps {
    items: BufferItem[];
    onSwipe: (email: NormalizedEmail, action: SwipeAction) => void;
}

export function CardStack({
    items,
    onSwipe,
}: CardStackProps) {
    const [exitingCard, setExitingCard] = useState<{
        email: NormalizedEmail;
        direction: "left" | "right";
    } | null>(null);

    // With the buffer, we ALWAYS look at the first few items
    const visibleCards = items
        .slice(0, 3)
        .map((item, index) => ({
            item,
            stackPosition: index as 0 | 1 | 2,
        }));

    // Handle swipe action - convert direction to SwipeAction
    const handleSwipe = useCallback(
        (direction: "left" | "right") => {
            const currentItem = items[0];
            if (!currentItem) return;

            // Convert direction to action
            const action: SwipeAction = direction === "left" ? "delete" : "keep";

            // Set exiting card for animation
            setExitingCard({ email: currentItem.email, direction });

            // Call onSwipe callback
            onSwipe(currentItem.email, action);

            // Re-sync happens in parent after consume()
            setTimeout(() => {
                setExitingCard(null);
            }, 120);
        },
        [items, onSwipe]
    );

    // Get exit animation based on direction
    const getExitAnimation = (direction: "left" | "right") => {
        return direction === "left"
            ? { x: -500, rotate: -15, opacity: 0 }
            : { x: 500, rotate: 15, opacity: 0 };
    };

    if (visibleCards.length === 0 && !exitingCard) {
        return null;
    }

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence mode="popLayout">
                {/* Exiting card animation */}
                {exitingCard && (
                    <motion.div
                        key={`exit-${exitingCard.email.id}`}
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
                        animate={getExitAnimation(exitingCard.direction)}
                        exit={{ opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                            duration: 0.12,
                        }}
                        style={{ zIndex: 40 }}
                    >
                        <div className="w-full h-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl" />
                    </motion.div>
                )}

                {/* Visible cards (reversed for proper z-index stacking) */}
                {[...visibleCards].reverse().map(({ item, stackPosition }) => (
                    <motion.div
                        key={item.email.id}
                        className="absolute inset-0"
                        style={{
                            zIndex: 30 - stackPosition,
                            scale: 1 - stackPosition * 0.05,
                            y: stackPosition * 12,
                        }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                            opacity: stackPosition === 0 ? 1 : 0.5 - stackPosition * 0.15,
                            scale: 1 - stackPosition * 0.05,
                            y: stackPosition * 12,
                        }}
                    >
                        <SwipeCard
                            email={item.email}
                            onSwipe={handleSwipe}
                            isActive={stackPosition === 0 && !exitingCard}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

export { SwipeCard };
