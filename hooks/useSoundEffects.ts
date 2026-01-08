/**
 * useSoundEffects - Audio feedback for swipe actions
 * Uses Web Audio API for low-latency sound effects
 */

import { useCallback, useRef, useEffect, useState } from "react";

type SoundType = "whoosh" | "snap" | "success" | "undo";

interface SoundEffectsOptions {
    enabled?: boolean;
    volume?: number;
}

// Sound generation using Web Audio API (no external files needed)
function createAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    return new (window.AudioContext || (window as any).webkitAudioContext)();
}

function playTone(
    ctx: AudioContext,
    frequency: number,
    duration: number,
    volume: number,
    type: OscillatorType = "sine"
) {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
}

export function useSoundEffects(options: SoundEffectsOptions = {}) {
    const { enabled = true, volume = 0.3 } = options;
    const audioContextRef = useRef<AudioContext | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        // Load mute preference from localStorage
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("swipe_sound_muted");
            setIsMuted(stored === "true");
        }
    }, []);

    const getContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = createAudioContext();
        }
        return audioContextRef.current;
    }, []);

    const play = useCallback(
        (sound: SoundType) => {
            if (!enabled || isMuted) return;

            const ctx = getContext();
            if (!ctx) return;

            // Resume context if suspended (browser autoplay policy)
            if (ctx.state === "suspended") {
                ctx.resume();
            }

            switch (sound) {
                case "whoosh":
                    // Descending sweep for swipe away
                    playTone(ctx, 400, 0.15, volume * 0.4, "sine");
                    setTimeout(() => playTone(ctx, 200, 0.1, volume * 0.2, "sine"), 50);
                    break;

                case "snap":
                    // Quick pop for card landing
                    playTone(ctx, 800, 0.05, volume * 0.5, "square");
                    break;

                case "success":
                    // Pleasant ascending tone
                    playTone(ctx, 523, 0.1, volume * 0.3, "sine"); // C5
                    setTimeout(() => playTone(ctx, 659, 0.1, volume * 0.3, "sine"), 100); // E5
                    setTimeout(() => playTone(ctx, 784, 0.15, volume * 0.4, "sine"), 200); // G5
                    break;

                case "undo":
                    // Reverse whoosh
                    playTone(ctx, 200, 0.15, volume * 0.3, "sine");
                    setTimeout(() => playTone(ctx, 400, 0.1, volume * 0.2, "sine"), 50);
                    break;
            }
        },
        [enabled, isMuted, getContext, volume]
    );

    const toggleMute = useCallback(() => {
        setIsMuted((prev) => {
            const next = !prev;
            if (typeof window !== "undefined") {
                localStorage.setItem("swipe_sound_muted", String(next));
            }
            return next;
        });
    }, []);

    return { play, isMuted, toggleMute };
}
