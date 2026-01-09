"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import { Zap, LayoutDashboard, ArrowRight } from "lucide-react";

const SYNONYMER_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: SYNONYMER_EASE
        }
    }
};

const cardHoverTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30
} as const;

// --- Parallax Card Component ---
function ParallaxCard({ children, className, href, rotateYDir = 1 }: { children: React.ReactNode, className?: string, href: string, rotateYDir?: number }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10 * rotateYDir, 10 * rotateYDir]);

    function handleMouseMove(event: React.MouseEvent) {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(event.clientX - centerX);
        y.set(event.clientY - centerY);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <Link href={href} className="group relative block perspective-1000">
            <motion.div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX, rotateY }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={className}
            >
                {/* Layered parallax children via context or direct transformation if we want, 
                    but we'll pass the motion values down or just use them in the cards since we are inlining.
                    Actually, let's just use the motion values directly in the page component.
                */}
                {children}
            </motion.div>
        </Link>
    );
}

export default function ModeSelectPage() {
    // We'll track mouse for the whole page or per card? Per card is better.
    const mouseX1 = useMotionValue(0);
    const mouseY1 = useMotionValue(0);
    const mouseX2 = useMotionValue(0);
    const mouseY2 = useMotionValue(0);

    const handleMouseMove1 = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX1.set(e.clientX - (rect.left + rect.width / 2));
        mouseY1.set(e.clientY - (rect.top + rect.height / 2));
    };

    const handleMouseMove2 = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX2.set(e.clientX - (rect.left + rect.width / 2));
        mouseY2.set(e.clientY - (rect.top + rect.height / 2));
    };

    const handleMouseLeave = (mvX: any, mvY: any) => {
        mvX.set(0);
        mvY.set(0);
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 font-sans selection:bg-emerald-500/30">
            <motion.div
                className="max-w-6xl w-full"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <motion.div
                    variants={itemVariants}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-2 text-zinc-300">
                        Choose Your Mode
                    </h1>
                    <p className="text-base text-zinc-600 font-medium">
                        How do you want to clean your inbox?
                    </p>
                </motion.div>

                {/* Card Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Card 1: The Swipe (formerly Stack) */}
                    <motion.div variants={itemVariants}>
                        <div
                            onMouseMove={handleMouseMove1}
                            onMouseLeave={() => handleMouseLeave(mouseX1, mouseY1)}
                            className="group relative block perspective-1000"
                        >
                            <Link href="/swipe">
                                <motion.div
                                    style={{
                                        rotateX: useTransform(mouseY1, [-250, 250], [5, -5]),
                                        rotateY: useTransform(mouseX1, [-250, 250], [-5, 5]),
                                    }}
                                    className="h-[440px] rounded-[40px] bg-zinc-950 border border-zinc-900 p-8 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 hover:border-emerald-500/30 shadow-2xl group-hover:shadow-emerald-500/10"
                                >
                                    {/* 3D Stack Visual - High Parallax */}
                                    <motion.div
                                        style={{
                                            x: useTransform(mouseX1, [-250, 250], [-15, 15]),
                                            y: useTransform(mouseY1, [-250, 250], [-15, 15]),
                                        }}
                                        className="relative w-32 h-40 mb-12"
                                    >
                                        {/* Back Card */}
                                        <div className="absolute inset-0 bg-emerald-600/20 rounded-xl rotate-[-6deg] -translate-y-2 group-hover:rotate-[-12deg] group-hover:-translate-y-3 transition-transform duration-500 ease-out" />
                                        {/* Middle Card */}
                                        <div className="absolute inset-0 bg-emerald-600/40 rounded-xl rotate-[-3deg] -translate-y-1 group-hover:rotate-0 group-hover:-translate-y-1.5 transition-transform duration-500 ease-out" />
                                        {/* Front Card */}
                                        <div className="absolute inset-0 bg-emerald-500 rounded-xl flex items-center justify-center shadow-2xl group-hover:rotate-[8deg] group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
                                            <Zap className="w-12 h-12 text-zinc-950 fill-current" />
                                        </div>
                                    </motion.div>

                                    {/* Text Content - Subtle Parallax */}
                                    <motion.div
                                        style={{
                                            x: useTransform(mouseX1, [-250, 250], [-5, 5]),
                                            y: useTransform(mouseY1, [-250, 250], [-5, 5]),
                                        }}
                                        className="text-center relative z-20"
                                    >
                                        <h2 className="text-3xl font-black text-emerald-400 mb-4 tracking-tight uppercase italic">The Swipe</h2>
                                        <p className="text-zinc-300 text-center leading-relaxed max-w-xs mx-auto">
                                            Granular review. Swipe through your recent emails one by one. Gamified cleanup.
                                        </p>

                                        {/* Floating CTA */}
                                        <div className="mt-8 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                                            <span className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-zinc-950 rounded-full font-bold text-sm tracking-wide shadow-lg hover:bg-emerald-400 transition-colors">
                                                ENTER GAME MODE <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Card 2: Command Center */}
                    <motion.div variants={itemVariants}>
                        <div
                            onMouseMove={handleMouseMove2}
                            onMouseLeave={() => handleMouseLeave(mouseX2, mouseY2)}
                            className="group relative block perspective-1000"
                        >
                            <Link href="/dashboard">
                                <motion.div
                                    style={{
                                        rotateX: useTransform(mouseY2, [-250, 250], [5, -5]),
                                        rotateY: useTransform(mouseX2, [-250, 250], [5, -5]),
                                    }}
                                    className="h-[440px] rounded-[40px] bg-zinc-950 border border-zinc-900 p-8 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 hover:border-emerald-500/30 shadow-2xl group-hover:shadow-emerald-500/10"
                                >
                                    {/* Mini Dashboard Visual - High Parallax */}
                                    <motion.div
                                        style={{
                                            x: useTransform(mouseX2, [-250, 250], [-15, 15]),
                                            y: useTransform(mouseY2, [-250, 250], [-15, 15]),
                                        }}
                                        className="relative w-40 h-40 mb-12 flex items-center justify-center"
                                    >
                                        <div className="relative w-36 h-36 border-2 border-emerald-600/50 rounded-lg bg-zinc-900 overflow-hidden group-hover:bg-zinc-800 transition-colors duration-500">
                                            <div className="h-8 bg-emerald-600/20 flex items-center px-2 gap-2 group-hover:bg-emerald-600/40 transition-colors duration-500">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                                <div className="w-2 h-2 bg-emerald-500/50 rounded-full" />
                                            </div>
                                            <div className="p-3 space-y-2">
                                                <div className="h-2 bg-emerald-600/20 rounded w-full group-hover:translate-x-0 group-hover:opacity-100 opacity-50 transition-all duration-300 delay-0" />
                                                <div className="h-2 bg-emerald-600/20 rounded w-3/4 group-hover:translate-x-0 group-hover:opacity-100 opacity-50 transition-all duration-300 delay-75" />
                                                <div className="h-2 bg-emerald-600/20 rounded w-1/2 group-hover:translate-x-0 group-hover:opacity-100 opacity-50 transition-all duration-300 delay-100" />
                                            </div>
                                        </div>

                                        <div className="absolute inset-0 flex items-center justify-center z-10">
                                            <div className="bg-zinc-950 p-3 rounded-xl border border-emerald-500/30 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                                <LayoutDashboard className="w-10 h-10 text-emerald-400" />
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Text Content - Subtle Parallax */}
                                    <motion.div
                                        style={{
                                            x: useTransform(mouseX2, [-250, 250], [-5, 5]),
                                            y: useTransform(mouseY2, [-250, 250], [-5, 5]),
                                        }}
                                        className="text-center relative z-20"
                                    >
                                        <h2 className="text-3xl font-black text-emerald-400 mb-4 tracking-tight uppercase italic">Command Center</h2>
                                        <p className="text-zinc-300 text-center leading-relaxed max-w-xs mx-auto">
                                            Bulk operations. Group by Sender or Domain. Nuke thousands of emails in seconds.
                                        </p>

                                        {/* Floating CTA */}
                                        <div className="mt-8 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                                            <span className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-zinc-950 rounded-full font-bold text-sm tracking-wide shadow-lg hover:bg-emerald-400 transition-colors">
                                                ACCESS CONSOLE <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Footer Link */}
                <motion.div variants={itemVariants} className="mt-10 text-center">
                    <Link href="/profile" className="text-zinc-500 hover:text-zinc-300 text-sm font-medium underline underline-offset-4 transition-colors">
                        Manage Account & Connections
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
