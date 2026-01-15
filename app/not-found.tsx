/**
 * 404 Not Found Page
 * Shows when user navigates to non-existent route
 */

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-md w-full text-center">
                {/* 404 */}
                <h1 className="text-[120px] md:text-[180px] font-black tracking-tighter leading-none text-zinc-900">
                    404
                </h1>

                <h2 className="text-2xl font-black tracking-tight mb-3 -mt-4">
                    Page Not Found
                </h2>

                <p className="text-zinc-500 mb-8">
                    This page got swiped left. It's probably in someone's trash now.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-emerald-500 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
