import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
    createOAuth2Client,
    setCredentials,
    createBlockFilter,
    getEmailsFromSender,
    batchModifyEmails,
} from "@/lib/providers/gmail";

/**
 * POST /api/gmail/block
 * 
 * Blocks a sender by:
 * 1. Creating a Gmail filter to auto-trash future emails
 * 2. Deleting all existing emails from the sender
 * 
 * Returns the filter ID for undo support.
 */
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { senderEmail } = await req.json();

        if (!senderEmail || typeof senderEmail !== "string") {
            return NextResponse.json({ error: "senderEmail is required" }, { status: 400 });
        }

        // Create Gmail API client
        const auth = createOAuth2Client();
        setCredentials(auth, session.accessToken as string, session.refreshToken as string | undefined);

        // Step 1: Create filter to block future emails
        const filterResult = await createBlockFilter(auth, { senderEmail });

        if (!filterResult.success) {
            return NextResponse.json(
                { error: "Failed to create block filter" },
                { status: 500 }
            );
        }

        // Step 2: Get all existing emails from sender
        const existingEmailIds = await getEmailsFromSender(auth, senderEmail);
        let emailsDeleted = 0;

        // Step 3: Trash all existing emails
        if (existingEmailIds.length > 0) {
            const trashSuccess = await batchModifyEmails(auth, existingEmailIds, {
                addLabelIds: ["TRASH"],
                removeLabelIds: ["INBOX"],
            });

            if (trashSuccess) {
                emailsDeleted = existingEmailIds.length;
            }
        }

        return NextResponse.json({
            success: true,
            senderEmail,
            filterId: filterResult.filterId,
            emailsDeleted,
            message: `Blocked ${senderEmail} and trashed ${emailsDeleted} emails`,
        });

    } catch (error) {
        console.error("Block API Error:", error);
        return NextResponse.json(
            { error: "Failed to block sender" },
            { status: 500 }
        );
    }
}
