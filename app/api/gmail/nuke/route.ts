import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
    createOAuth2Client,
    setCredentials,
    createBlockFilter,
    getEmailsFromDomain,
    batchModifyEmails,
} from "@/lib/providers/gmail";
import { canNukeDomain, getDomainSafetyCategory } from "@/lib/detection/newsletter";

/**
 * POST /api/gmail/nuke
 * 
 * Nukes an entire domain by:
 * 1. Checking domain safety (never_nuke, caution, safe_to_nuke)
 * 2. Creating a Gmail filter to block all future emails from domain
 * 3. Deleting all existing emails from domain
 * 
 * Returns the filter ID for undo support.
 */
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { domain, confirm } = await req.json();

        if (!domain || typeof domain !== "string") {
            return NextResponse.json({ error: "domain is required" }, { status: 400 });
        }

        // Step 1: Check domain safety
        const safetyCheck = canNukeDomain(domain);
        const safetyCategory = getDomainSafetyCategory(domain);

        if (!safetyCheck.allowed) {
            return NextResponse.json({
                success: false,
                error: safetyCheck.reason || "This domain cannot be nuked",
                safetyCategory,
                blocked: true,
            }, { status: 403 });
        }

        // If domain requires confirmation and confirm not provided
        if (safetyCheck.requiresConfirmation && !confirm) {
            return NextResponse.json({
                success: false,
                requiresConfirmation: true,
                safetyCategory,
                reason: safetyCheck.reason || "This domain may contain important emails. Please confirm.",
            }, { status: 200 });
        }

        // Create Gmail API client
        const auth = createOAuth2Client();
        setCredentials(auth, session.accessToken as string, session.refreshToken as string | undefined);

        // Step 2: Create filter to block entire domain
        const filterResult = await createBlockFilter(auth, { domain });

        if (!filterResult.success) {
            return NextResponse.json(
                { error: "Failed to create domain block filter" },
                { status: 500 }
            );
        }

        // Step 3: Get all existing emails from domain
        const existingEmailIds = await getEmailsFromDomain(auth, domain);
        let emailsDeleted = 0;

        // Step 4: Trash all existing emails
        if (existingEmailIds.length > 0) {
            // Batch in chunks of 1000 (Gmail limit)
            const chunkSize = 1000;
            for (let i = 0; i < existingEmailIds.length; i += chunkSize) {
                const chunk = existingEmailIds.slice(i, i + chunkSize);
                const trashSuccess = await batchModifyEmails(auth, chunk, {
                    addLabelIds: ["TRASH"],
                    removeLabelIds: ["INBOX"],
                });

                if (trashSuccess) {
                    emailsDeleted += chunk.length;
                }
            }
        }

        return NextResponse.json({
            success: true,
            domain,
            filterId: filterResult.filterId,
            emailsDeleted,
            safetyCategory,
            message: `Nuked @${domain}: blocked future emails and trashed ${emailsDeleted} existing`,
        });

    } catch (error) {
        console.error("Nuke API Error:", error);
        return NextResponse.json(
            { error: "Failed to nuke domain" },
            { status: 500 }
        );
    }
}
