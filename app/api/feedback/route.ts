import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Feedback API - Sends to Discord Webhook
 * 
 * Add DISCORD_FEEDBACK_WEBHOOK_URL to your .env.local:
 * DISCORD_FEEDBACK_WEBHOOK_URL=https://discord.com/api/webhooks/...
 */

const FEEDBACK_TYPES = {
    general: { emoji: "💬", label: "General Feedback", color: 0x71717a },
    feature: { emoji: "💡", label: "Feature Request", color: 0xf59e0b },
    bug: { emoji: "🐛", label: "Bug Report", color: 0xef4444 },
    love: { emoji: "❤️", label: "Share the Love", color: 0xec4899 },
} as const;

type FeedbackType = keyof typeof FEEDBACK_TYPES;

interface FeedbackBody {
    type: FeedbackType;
    message: string;
}

export async function POST(request: NextRequest) {
    try {
        // Get user session (optional - anonymous feedback allowed)
        const session = await getServerSession(authOptions);

        // Parse body
        const body: FeedbackBody = await request.json();
        const { type, message } = body;

        // Validate
        if (!type || !FEEDBACK_TYPES[type]) {
            return NextResponse.json(
                { error: "Invalid feedback type" },
                { status: 400 }
            );
        }

        if (!message || message.trim().length < 5) {
            return NextResponse.json(
                { error: "Message too short" },
                { status: 400 }
            );
        }

        if (message.length > 2000) {
            return NextResponse.json(
                { error: "Message too long (max 2000 characters)" },
                { status: 400 }
            );
        }

        const feedbackMeta = FEEDBACK_TYPES[type];
        const userEmail = session?.user?.email || "Anonymous";
        const userName = session?.user?.name || "Anonymous User";
        const timestamp = new Date().toISOString();

        // Check if Discord webhook is configured
        const webhookUrl = process.env.DISCORD_FEEDBACK_WEBHOOK_URL;
        console.log("[Feedback API] Webhook URL present:", !!webhookUrl);

        if (!webhookUrl) {
            return NextResponse.json(
                { error: "Discord webhook not configured on server. Please restart your dev server." },
                { status: 500 }
            );
        }

        if (webhookUrl) {
            // Send to Discord
            const discordPayload = {
                embeds: [
                    {
                        title: `${feedbackMeta.emoji} ${feedbackMeta.label}`,
                        description: message,
                        color: feedbackMeta.color,
                        fields: [
                            {
                                name: "👤 User",
                                value: userEmail === "Anonymous"
                                    ? "Anonymous"
                                    : `${userName}\n${userEmail}`,
                                inline: true,
                            },
                            {
                                name: "📅 Submitted",
                                value: new Date().toLocaleString("en-US", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                }),
                                inline: true,
                            },
                        ],
                        footer: {
                            text: "Swipe Feedback Hub",
                        },
                        timestamp,
                    },
                ],
            };

            const discordResponse = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(discordPayload),
            });

            if (!discordResponse.ok) {
                console.error(
                    "[Feedback] Discord webhook failed:",
                    await discordResponse.text()
                );
                // Don't fail the request - still log locally
            } else {
                console.log("[Feedback] Sent to Discord successfully");
            }
        } else {
            // No webhook configured - just log locally
            console.log("[Feedback] No Discord webhook configured, logging locally:");
            console.log({
                type,
                message,
                user: userEmail,
                timestamp,
            });
        }

        // Always log to server for backup
        console.log(`[Feedback] ${feedbackMeta.emoji} ${type} from ${userEmail}`);

        return NextResponse.json({
            success: true,
            message: "Feedback received! Thank you for helping us improve.",
        });
    } catch (error) {
        console.error("[Feedback] Error:", error);
        return NextResponse.json(
            { error: "Failed to submit feedback" },
            { status: 500 }
        );
    }
}
