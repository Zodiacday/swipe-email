"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from "react";

/**
 * Confirmation modal configuration
 */
export interface ConfirmOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning";
}

interface ConfirmModalState extends ConfirmOptions {
    isOpen: boolean;
    resolve: ((value: boolean) => void) | null;
}

interface ConfirmModalContextType {
    modalState: ConfirmModalState;
    confirm: (options: ConfirmOptions) => Promise<boolean>;
    handleConfirm: () => void;
    handleCancel: () => void;
}

const defaultState: ConfirmModalState = {
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    variant: "danger",
    resolve: null,
};

const ConfirmModalContext = createContext<ConfirmModalContextType | null>(null);

/**
 * Provider for the confirmation modal system.
 * Wrap your app with this to enable promise-based confirmations.
 */
export function ConfirmModalProvider({ children }: { children: ReactNode }) {
    const [modalState, setModalState] = useState<ConfirmModalState>(defaultState);

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                ...options,
                confirmLabel: options.confirmLabel || "Confirm",
                cancelLabel: options.cancelLabel || "Cancel",
                variant: options.variant || "danger",
                resolve,
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        modalState.resolve?.(true);
        setModalState(defaultState);
    }, [modalState.resolve]);

    const handleCancel = useCallback(() => {
        modalState.resolve?.(false);
        setModalState(defaultState);
    }, [modalState.resolve]);

    return (
        <ConfirmModalContext.Provider value={{ modalState, confirm, handleConfirm, handleCancel }}>
            {children}
        </ConfirmModalContext.Provider>
    );
}

/**
 * Hook to use the confirmation modal.
 * 
 * @example
 * const { confirm } = useConfirmModal();
 * const confirmed = await confirm({ title: "Delete?", message: "This cannot be undone." });
 * if (confirmed) { // do the thing }
 */
export function useConfirmModal() {
    const context = useContext(ConfirmModalContext);
    if (!context) {
        throw new Error("useConfirmModal must be used within ConfirmModalProvider");
    }
    return context;
}
