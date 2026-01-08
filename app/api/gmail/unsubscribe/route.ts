import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NormalizedEmail } from "@/lib/types";
import { executeUnsubscribe } from "@/lib/engines/unsubscribe";
import {
    createOAuth2Client,
    setCredentials,
    createBlockFilter,
    markAsSpam,
} from "@/lib/providers/gmail";

/**
 * POST /api/gmail/unsubscribe
 * 
 * Attempts to unsubscribe from a sender using multiple methods:
 * 1. HTTP unsubscribe (List-Unsubscribe header)
 * 2. Mailto fallback
 * 3. Block sender fallback
 * 4. Mark as spam fallback
 * 
 * Returns the method used for transparency.
 */
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { email, confirmUnsafe } = await req.json() as {
            email: NormalizedEmail;
            confirmUnsafe?: boolean;
        };

        if (!email || !email.id) {
            return NextResponse.json({ error: "email object is required" }, { status: 400 });
        }

        // Create Gmail API client
        const auth = createOAuth2Client();
        setCredentials(auth, session.accessToken as string, session.refreshToken as string | undefined);

        // Execute unsubscribe using the engine
        const result = await executeUnsubscribe(email, {
            confirmUnsafe,
            // Provide Gmail-specific implementations
            createBlockFilter: async (sender: string) => {
                const filterResult = await createBlockFilter(auth, { senderEmail: sender });
                return filterResult.success;
            },
            markAsSpam: async (emailId: string) => {
                return await markAsSpam(auth, emailId);
            },
            // Note: sendMailto not implemented - would require server-side email sending
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                method: result.method,
                fallbackUsed: result.fallbackUsed,
                metadata: result.metadata,
                message: `Unsubscribed via ${result.method}${result.fallbackUsed ? " (fallback)" : ""}`,
            });
        }

        // Check if confirmation is required for suspicious links
        if (result.metadata?.requiresConfirmation) {
            return NextResponse.json({
                success: false,
                requiresConfirmation: true,
                reason: result.metadata.reason,
            }, { status: 200 });
        }

        return NextResponse.json({
            success: false,
            error: result.metadata?.error || "Unsubscribe failed",
            method: result.method,
        }, { status: 400 });

    } catch (error) {
        console.error("Unsubscribe API Error:", error);
        return NextResponse.json(
            { error: "Failed to unsubscribe" },
            { status: 500 }
        );
    }
}
