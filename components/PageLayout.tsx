/**
 * PageLayout - Consistent Layout Wrapper
 * Provides standardized spacing, navbar offset, and container width across all pages.
 */

import { ReactNode } from "react";

interface PageLayoutProps {
    children: ReactNode;
    /** Maximum width of the content container. Defaults to "2xl" */
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "7xl" | "full";
    /** Additional padding bottom for pages with floating action bars */
    hasFloatingBar?: boolean;
    /** Optional className for the outer wrapper */
    className?: string;
}

const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
};

export function PageLayout({
    children,
    maxWidth = "2xl",
    hasFloatingBar = false,
    className = "",
}: PageLayoutProps) {
    return (
        <div
            className={`
                min-h-screen bg-black text-zinc-100 font-sans
                pt-[var(--navbar-height)]
                ${hasFloatingBar ? "pb-32" : "pb-12"}
                ${className}
            `}
        >
            <div
                className={`
                    ${maxWidthClasses[maxWidth]}
                    mx-auto
                    px-[var(--content-padding-x)]
                `}
            >
                {children}
            </div>
        </div>
    );
}
