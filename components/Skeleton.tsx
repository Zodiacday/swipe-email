"use client";

/**
 * Skeleton Loading Components
 * Premium pulse animation skeleton UI for loading states
 */

// --- Skeleton for Dashboard Row ---
export function SkeletonRow() {
    return (
        <div className="grid grid-cols-12 gap-4 px-6 h-[84px] items-center animate-pulse">
            {/* Checkbox */}
            <div className="col-span-1 flex justify-center">
                <div className="w-4 h-4 bg-zinc-800 rounded" />
            </div>

            {/* Identity */}
            <div className="col-span-5 flex items-center gap-4 pl-2">
                <div className="w-12 h-12 bg-zinc-800 rounded-full" />
                <div className="space-y-2 flex-1">
                    <div className="w-32 h-4 bg-zinc-800 rounded" />
                    <div className="w-48 h-3 bg-zinc-800 rounded" />
                </div>
            </div>

            {/* Volume */}
            <div className="col-span-4 flex items-center gap-4">
                <div className="w-12 h-5 bg-zinc-800 rounded" />
                <div className="flex-1 h-2 bg-zinc-800 rounded-full" />
                <div className="w-12 h-4 bg-zinc-800 rounded" />
            </div>

            {/* Actions */}
            <div className="col-span-2 flex justify-center gap-2">
                <div className="w-8 h-8 bg-zinc-800 rounded-lg" />
                <div className="w-8 h-8 bg-zinc-800 rounded-lg" />
            </div>
        </div>
    );
}

// --- Skeleton for Swipe Card ---
export function SkeletonCard() {
    return (
        <div className="w-full aspect-[3/4] max-h-[600px] bg-zinc-900 border border-zinc-800 rounded-3xl p-10 animate-pulse">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-zinc-800 rounded-full" />
                <div className="space-y-2 flex-1">
                    <div className="w-40 h-5 bg-zinc-800 rounded" />
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-4 bg-zinc-800 rounded" />
                        <div className="w-20 h-4 bg-zinc-800 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Subject */}
            <div className="space-y-3 mb-8">
                <div className="w-full h-7 bg-zinc-800 rounded" />
                <div className="w-3/4 h-7 bg-zinc-800 rounded" />
            </div>

            {/* Preview Box */}
            <div className="w-full h-36 bg-zinc-800/50 rounded-2xl p-6">
                <div className="space-y-2">
                    <div className="w-full h-4 bg-zinc-800 rounded" />
                    <div className="w-5/6 h-4 bg-zinc-800 rounded" />
                    <div className="w-4/6 h-4 bg-zinc-800 rounded" />
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between mt-8">
                <div className="w-20 h-3 bg-zinc-800 rounded" />
                <div className="w-20 h-3 bg-zinc-800 rounded" />
            </div>
        </div>
    );
}

// --- Skeleton for Stats Header ---
export function SkeletonStats() {
    return (
        <div className="flex items-center gap-6 animate-pulse">
            <div className="flex items-center gap-2">
                <div className="w-12 h-5 bg-zinc-800 rounded" />
                <div className="w-16 h-4 bg-zinc-800 rounded" />
            </div>
            <div className="w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-2">
                <div className="w-8 h-5 bg-zinc-800 rounded" />
                <div className="w-20 h-4 bg-zinc-800 rounded" />
            </div>
        </div>
    );
}

// --- Skeleton for Session Summary ---
export function SkeletonSummary() {
    return (
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                    <div className="w-10 h-8 bg-zinc-800 rounded mx-auto mb-2" />
                    <div className="w-14 h-3 bg-zinc-800 rounded mx-auto" />
                </div>
            ))}
        </div>
    );
}
