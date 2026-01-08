# 🎨 Gemini Flash Visual Tasks

## Project: SWIPE-THEM
**Path:** `C:\Users\natan\.gemini\antigravity\scratch\SWIPE-THEM`

---

## Task 1: Visual Unification

Make the app interior match the landing page aesthetic.

### Files to Modify:
- `app/swipe/page.tsx`
- `app/dashboard/page.tsx`
- `app/mode-select/page.tsx`
- `app/globals.css`

### Changes:

1. **Replace `cyan` with `emerald` everywhere:**
   - `text-cyan-400` → `text-emerald-400`
   - `bg-cyan-500` → `bg-emerald-500`
   - `border-cyan-500` → `border-emerald-500`

2. **Apply glass effect to cards:**
   - Add `glass` class (already in globals.css)
   - Example: `className="glass rounded-3xl"`

3. **Headers use `font-black tracking-tight`:**
   - Change `font-bold` to `font-black tracking-tight`

4. **Unify rounded corners:**
   - `rounded-2xl` → `rounded-3xl`

5. **Labels use landing style:**
   - `text-xs` → `text-[10px] uppercase tracking-widest`

---

## Task 2: Custom Confirmation Modal

Create a styled modal to replace `confirm()`.

### New Component: `components/ConfirmModal.tsx`

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning";
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "danger",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const colors = variant === "danger" 
        ? { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", btn: "bg-red-500 hover:bg-red-400" }
        : { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", btn: "bg-amber-500 hover:bg-amber-400" };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="glass rounded-3xl p-8 max-w-sm w-full shadow-2xl"
                    >
                        <button
                            onClick={onCancel}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                            <AlertTriangle className={`w-8 h-8 ${colors.text}`} />
                        </div>
                        
                        <h2 className="text-xl font-black tracking-tight text-center mb-2">{title}</h2>
                        <p className="text-zinc-400 text-center mb-8">{message}</p>
                        
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={onConfirm}
                                className={`w-full py-4 ${colors.btn} text-white font-bold rounded-2xl transition-colors`}
                            >
                                {confirmLabel}
                            </button>
                            <button
                                onClick={onCancel}
                                className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-2xl transition-colors"
                            >
                                {cancelLabel}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
```

---

## Task 3: Swipe Tutorial Overlay

Create a visual tutorial for first-time users.

### New Component: `components/SwipeTutorial.tsx`

Design a 3-step overlay showing:
1. ← Swipe left = Trash
2. → Swipe right = Keep
3. ↑ Swipe up = Unsubscribe

Use:
- Full-screen overlay with `backdrop-blur-xl`
- Step indicators (dots)
- Animated hand gesture icons
- "Got it" button to dismiss

---

## Task 4: Landing Page Polish

Update `app/page.tsx` to:
1. Show a dashboard preview screenshot (not just swipe demo)
2. Add "Two Modes" section explaining Swipe vs Dashboard
3. Match HeroDemo to actual swipe card design

---

## Reference: Design Tokens

```css
/* Colors */
--emerald: #10b981
--zinc-950: #09090b
--zinc-900: #18181b
--zinc-800: #27272a

/* Typography */
headers: font-black tracking-tight
labels: text-[10px] uppercase tracking-widest text-zinc-500
body: text-zinc-400

/* Effects */
.glass: bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50
shadows: shadow-2xl shadow-emerald-500/10
```
