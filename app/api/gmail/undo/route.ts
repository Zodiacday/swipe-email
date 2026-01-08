import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
    createOAuth2Client,
    setCredentials,
    deleteFilter,
    untrashEmail,
} from "@/lib/providers/gmail";

/**
 * POST /api/gmail/undo
 * 
 * Undoes a previous action:
 * - For block/nuke: Deletes the Gmail filter
 * - For trash: Untrashes the emails
 * 
 * Note: Cannot restore deleted emails after nuke, only removes the filter.
 */
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { type, filterId, emailIds } = await req.json() as {
            type: "trash" | "block" | "nuke";
            filterId?: string;
            emailIds?: string[];
        };

        if (!type) {
            return NextResponse.json({ error: "type is required" }, { status: 400 });
        }

        // Create Gmail API client
        const auth = createOAuth2Client();
        setCredentials(auth, session.accessToken as string, session.refreshToken as string | undefined);

        let filterDeleted = false;
        let emailsRestored = 0;

        // For block/nuke: delete the filter
        if ((type === "block" || type === "nuke") && filterId) {
            filterDeleted = await deleteFilter(auth, filterId);
            if (!filterDeleted) {
                return NextResponse.json({
                    success: false,
                    error: "Failed to delete filter",
                }, { status: 500 });
            }
        }

        // For trash: untrash emails
        if (type === "trash" && emailIds && emailIds.length > 0) {
            // Untrash in batches of 20 to avoid rate limits
            const batchSize = 20;
            for (let i = 0; i < emailIds.length; i += batchSize) {
                const batch = emailIds.slice(i, i + batchSize);
                const results = await Promise.all(
                    batch.map(id => untrashEmail(auth, id))
                );
                emailsRestored += results.filter(Boolean).length;
            }
        }

        return NextResponse.json({
            success: true,
            type,
            filterDeleted,
            emailsRestored,
            message: type === "trash"
                ? `Restored ${emailsRestored} emails`
                : `Removed block filter${emailsRestored > 0 ? ` and restored ${emailsRestored} emails` : ""}`,
        });

    } catch (error) {
        console.error("Undo API Error:", error);
        return NextResponse.json(
            { error: "Failed to undo action" },
            { status: 500 }
        );
    }
}
