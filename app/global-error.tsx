"use client";

/**
 * Global Error Boundary (Root Layout Level)
 * This catches errors in the root layout itself
 * Must include html and body tags since it replaces the entire layout
 */

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center">
                    {/* Error Icon */}
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                        <span className="text-4xl">⚠️</span>
                    </div>

                    <h1 className="text-3xl font-black tracking-tighter mb-3">
                        Something went wrong
                    </h1>

                    <p className="text-zinc-400 mb-6">
                        A critical error occurred. Please try again.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => reset()}
                            className="px-6 py-3 bg-emerald-500 text-zinc-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors"
                        >
                            Try Again
                        </button>

                        <a
                            href="/"
                            className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors"
                        >
                            Go Home
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}
