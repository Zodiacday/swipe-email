"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useConfirmModal } from "@/hooks/useConfirmModal";
import { AlertTriangle, Shield, Check, X } from "lucide-react";

/**
 * Premium Confirmation Modal
 * Part of the "Obsidian Emerald" UI Unification
 */
export function ConfirmModal() {
    const { modalState, handleConfirm, handleCancel } = useConfirmModal();
    const { isOpen, title, message, confirmLabel, cancelLabel, variant } = modalState;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCancel}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md glass rounded-3xl p-8 shadow-2xl overflow-hidden border border-emerald-500/20"
                    >
                        {/* Status/Variant Indicator */}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto ${variant === 'danger' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'
                            }`}>
                            {variant === 'danger' ? <AlertTriangle className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
                        </div>

                        <div className="text-center">
                            <h2 className="text-2xl font-black tracking-tight text-white mb-2">{title}</h2>
                            <p className="text-zinc-400 leading-relaxed mb-8">
                                {message}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleConfirm}
                                className={`w-full py-4 rounded-3xl font-black tracking-widest uppercase text-xs transition-all active:scale-95 ${variant === 'danger'
                                        ? 'bg-red-500 text-white hover:bg-red-400 shadow-lg shadow-red-500/20'
                                        : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Check className="w-4 h-4" />
                                    {confirmLabel}
                                </div>
                            </button>
                            <button
                                onClick={handleCancel}
                                className="w-full py-4 rounded-3xl font-black tracking-widest uppercase text-xs text-zinc-500 hover:text-white hover:bg-white/5 transition-all text-center flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                {cancelLabel}
                            </button>
                        </div>

                        {/* Visual Flare */}
                        <div className={`absolute -bottom-16 -left-16 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none ${variant === 'danger' ? 'bg-red-500' : 'bg-emerald-500'
                            }`} />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
