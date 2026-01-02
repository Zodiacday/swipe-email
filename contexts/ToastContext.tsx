"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, Undo2 } from "lucide-react";

// --- Types ---
interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
    undoAction?: () => void;
    duration: number;
}

interface ToastContextType {
    showToast: (message: string, options?: Partial<Omit<Toast, "id" | "message">>) => void;
    dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// --- Toast Item Component ---
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const [progress, setProgress] = useState(100);

    React.useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
            setProgress(remaining);

            if (remaining <= 0) {
                onDismiss();
            }
        }, 50);

        return () => clearInterval(interval);
    }, [toast.duration, onDismiss]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
        error: <XCircle className="w-5 h-5 text-red-500 shrink-0" />,
        info: <Info className="w-5 h-5 text-cyan-500 shrink-0" />,
    };

    const borderColors = {
        success: "border-emerald-500/30",
        error: "border-red-500/30",
        info: "border-cyan-500/30",
    };

    const progressColors = {
        success: "bg-emerald-500",
        error: "bg-red-500",
        info: "bg-cyan-500",
    };

    return (
        <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`relative bg-zinc-900/95 backdrop-blur-xl border ${borderColors[toast.type]} rounded-xl px-4 py-3 shadow-2xl overflow-hidden min-w-[280px] max-w-[400px]`}
        >
            <div className="flex items-center gap-3">
                {icons[toast.type]}
                <span className="text-zinc-200 text-sm font-medium flex-1">{toast.message}</span>
                {toast.undoAction && (
                    <button
                        onClick={() => {
                            toast.undoAction?.();
                            onDismiss();
                        }}
                        className="flex items-center gap-1 text-cyan-400 font-bold text-sm hover:text-cyan-300 transition-colors"
                    >
                        <Undo2 className="w-4 h-4" />
                        Undo
                    </button>
                )}
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-800">
                <motion.div
                    className={`h-full ${progressColors[toast.type]}`}
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.05 }}
                />
            </div>
        </motion.div>
    );
}

// --- Provider ---
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, options?: Partial<Omit<Toast, "id" | "message">>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const toast: Toast = {
            id,
            message,
            type: options?.type || "success",
            undoAction: options?.undoAction,
            duration: options?.duration || 4000,
        };

        setToasts(prev => [...prev, toast]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, dismissToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[100] space-y-3 pointer-events-auto">
                <AnimatePresence mode="popLayout">
                    {toasts.map(toast => (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            onDismiss={() => dismissToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

// --- Hook ---
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}
