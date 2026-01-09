"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
    id?: string;
    title?: string;
}

export function MagneticButton({ children, className, onClick, id, title }: MagneticButtonProps) {
    const mx = useMotionValue(0);
    const my = useMotionValue(0);

    const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
    const x = useSpring(mx, springConfig);
    const y = useSpring(my, springConfig);

    // Inner content moves less than the button itself for "layered" depth
    const contentX = useTransform(x, (v) => v * 0.4);
    const contentY = useTransform(y, (v) => v * 0.4);

    function onMouseMove(e: React.MouseEvent) {
        const { clientX, clientY } = e;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        mx.set(clientX - centerX);
        my.set(clientY - centerY);
    }

    function onMouseLeave() {
        mx.set(0);
        my.set(0);
    }

    return (
        <motion.button
            id={id}
            title={title}
            onClick={onClick}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{ x, y }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={className}
        >
            <motion.div style={{ x: contentX, y: contentY }}>
                {children}
            </motion.div>
        </motion.button>
    );
}
