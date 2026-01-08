"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldOff, Star, Zap, ChevronRight, ChevronLeft, X } from "lucide-react";

interface OnboardingSlidesProps {
    isOpen: boolean;
    onDismiss: () => void;
}

export function OnboardingSlides({ isOpen, onDismiss }: OnboardingSlidesProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "BLOCKED SENDERS",
            description: "These senders are auto-trashed. Their future emails go straight to the bin, keeping your inbox permanently clean.",
            icon: ShieldOff,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
        },
        {
            title: "PERSONAL SENDERS",
            description: "These are your VIPs. Their emails are always highlighted and never suggested for deletion or tracking.",
            icon: Star,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            title: "PRO TIPS",
            description: "Swipe UP to unsubscribe instantly. Long-press any card to see deep sender insights and history.",
            icon: Zap,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
        }
    ];

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) setCurrentSlide(prev => prev + 1);
        else onDismiss();
    };

    const prevSlide = () => {
        if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg glass rounded-3xl overflow-hidden border-zinc-800/50"
                >
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 right-0 flex gap-1 h-1">
                        {slides.map((_, i) => (
                            <div
                                key={i}
                                className={`flex-1 transition-colors duration-500 ${i <= currentSlide ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={onDismiss}
                        className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="p-8 md:p-12">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -50, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="flex flex-col items-center text-center"
                            >
                                {(() => {
                                    const SlideIcon = slides[currentSlide].icon;
                                    return (
                                        <div className={`w-24 h-24 rounded-[2.5rem] ${slides[currentSlide].bg} flex items-center justify-center mb-8`}>
                                            <SlideIcon className={`w-12 h-12 ${slides[currentSlide].color}`} />
                                        </div>
                                    );
                                })()}

                                <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-4">
                                    {slides[currentSlide].title}
                                </h2>
                                <p className="text-zinc-400 text-lg leading-relaxed">
                                    {slides[currentSlide].description}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-12 flex items-center justify-between">
                            <button
                                onClick={prevSlide}
                                disabled={currentSlide === 0}
                                className={`flex items-center gap-2 font-black tracking-widest uppercase text-xs transition-opacity ${currentSlide === 0 ? 'opacity-0' : 'opacity-100'}`}
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>

                            <div className="flex gap-2">
                                {slides.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-emerald-500 w-6' : 'bg-zinc-800'}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={nextSlide}
                                className="flex items-center gap-2 bg-emerald-500 text-zinc-950 px-6 py-3 rounded-full font-black tracking-widest uppercase text-xs hover:bg-emerald-400 transition-all active:scale-95"
                            >
                                {currentSlide === slides.length - 1 ? 'Got it!' : 'Next'}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
