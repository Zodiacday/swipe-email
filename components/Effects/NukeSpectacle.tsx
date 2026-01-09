"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface NukeSpectacleProps {
    x: number;
    y: number;
    width: number;
    height: number;
    onComplete: () => void;
}

const LIQUID_EASE = [0.6, 0.01, -0.05, 0.95] as [number, number, number, number];

export function NukeSpectacle({ x, y, width, height, onComplete }: NukeSpectacleProps) {
    const [phase, setPhase] = useState<"charging" | "flash" | "particles">("charging");

    useEffect(() => {
        const chargingTimer = setTimeout(() => setPhase("flash"), 600);
        const flashTimer = setTimeout(() => setPhase("particles"), 750);
        const completeTimer = setTimeout(onComplete, 1800);

        return () => {
            clearTimeout(chargingTimer);
            clearTimeout(flashTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[200]">
            <AnimatePresence>
                {/* Charging Aura */}
                {phase === "charging" && (
                    <motion.div
                        initial={{ opacity: 0, x, y: y + height / 2, width, height: 2, scaleX: 0 }}
                        animate={{
                            opacity: 1,
                            scaleX: 1,
                            boxShadow: "0 0 60px rgba(16,185,129,1)",
                            backgroundColor: "#10b981"
                        }}
                        exit={{ opacity: 0, scaleY: 40, filter: "blur(20px)" }}
                        transition={{ duration: 0.5, ease: LIQUID_EASE }}
                        className="absolute left-0 top-0 bg-emerald-500 blur-[1px]"
                    />
                )}

                {/* The Flash */}
                {phase === "flash" && (
                    <motion.div
                        initial={{ opacity: 0, x, y, width, height, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1.05, filter: "brightness(3) blur(2px)" }}
                        exit={{ opacity: 0, scale: 1.2, filter: "blur(40px)" }}
                        style={{ position: "absolute", left: 0, top: 0 }}
                        className="bg-white rounded-lg mix-blend-screen"
                    />
                )}

                {/* Liquid Particles */}
                {phase === "particles" && (
                    <ParticleField x={x + width / 2} y={y + height / 2} />
                )}
            </AnimatePresence>
        </div>
    );
}

function ParticleField({ x, y }: { x: number, y: number }) {
    const particleCount = 64; // More particles for the nuke
    const particles = Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5);
        const velocity = 5 + Math.random() * 25;
        return {
            id: i,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            size: 2 + Math.random() * 8,
            delay: Math.random() * 0.2
        };
    });

    return (
        <div className="absolute left-0 top-0">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ x, y, opacity: 1, scale: 1, filter: "blur(0px)" }}
                    animate={{
                        x: x + p.vx * 18,
                        y: y + p.vy * 18,
                        opacity: 0,
                        scale: 0,
                        rotate: Math.random() * 720,
                        filter: "blur(4px)"
                    }}
                    transition={{
                        duration: 1.5,
                        ease: [0.16, 1, 0.3, 1], // Liquid deceleration
                        delay: p.delay
                    }}
                    className="absolute bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                    style={{
                        width: p.size,
                        height: p.size,
                    }}
                />
            ))}
        </div>
    );
}
