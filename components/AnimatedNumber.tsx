"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    className?: string;
    format?: (n: number) => string;
}

/**
 * AnimatedNumber - Smoothly animates between number values
 * Uses spring physics for premium feel. Perfect for stats displays.
 */
export function AnimatedNumber({
    value,
    duration = 0.8,
    className = "",
    format = (n) => n.toLocaleString()
}: AnimatedNumberProps) {
    const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
    const display = useTransform(spring, (current) => format(Math.round(current)));
    const [displayValue, setDisplayValue] = useState(format(value));

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    useEffect(() => {
        const unsubscribe = display.on("change", (latest) => {
            setDisplayValue(latest);
        });
        return unsubscribe;
    }, [display]);

    return (
        <motion.span className={className}>
            {displayValue}
        </motion.span>
    );
}
