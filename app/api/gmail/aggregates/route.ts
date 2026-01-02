import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { NextResponse } from "next/server";
import { setCredentials, batchGetEmailMetadata } from "@/lib/providers/gmail";
import { aggregateEmails } from "@/lib/engines/aggregation";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "500"); // default to scan 500 emails

    try {
        const auth = new google.auth.OAuth2();
        setCredentials(auth, session.accessToken as string, session.refreshToken as string | undefined);

        const gmail = google.gmail({ version: "v1", auth });

        // 1. Fetch Message IDs (Lightweight)
        // We scan the INBOX to find the top offenders
        const response = await gmail.users.messages.list({
            userId: "me",
            maxResults: limit,
            q: "category:promotions OR category:updates OR category:social", // Focus on clutter
        });

        const messages = response.data.messages || [];

        if (messages.length === 0) {
            return NextResponse.json({
                stats: { totalEmails: 0, uniqueSenders: 0, storageEstimate: 0, oldestEmail: Date.now() },
                senders: []
            });
        }

        // 2. Fetch Headers (Heavier, but effectively batched)
        const normalizedEmails = await batchGetEmailMetadata(auth, messages.map(m => m.id!));

        // 3. Aggregate Locally
        const data = aggregateEmails(normalizedEmails);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Aggregation API Error:", error);
        return NextResponse.json({ error: "Failed to fetch aggregates" }, { status: 500 });
    }
}
