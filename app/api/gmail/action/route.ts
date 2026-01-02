import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { NextResponse } from "next/server";
import { createOAuth2Client, setCredentials } from "@/lib/providers/gmail";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { action, payload } = await req.json();

        // Create and configure Gmail client
        const auth = createOAuth2Client();
        setCredentials(auth, session.accessToken as string, session.refreshToken as string | undefined);
        const gmail = google.gmail({ version: "v1", auth });

        if (action === "TRASH_SENDER") {
            const { email } = payload;

            // 1. Find ALL messages from this sender (handle pagination)
            let allIds: string[] = [];
            let pageToken: string | undefined;

            do {
                const listRes = await gmail.users.messages.list({
                    userId: "me",
                    q: `from:${email}`,
                    maxResults: 500,
                    pageToken
                });

                if (listRes.data.messages) {
                    allIds.push(...listRes.data.messages.map(m => m.id as string));
                }
                pageToken = listRes.data.nextPageToken || undefined;
            } while (pageToken);

            if (allIds.length === 0) {
                return NextResponse.json({ success: true, count: 0, message: "No emails found to trash." });
            }

            // 2. Batch Trash in chunks of 1000 (Gmail limit for batchModify)
            const chunkSize = 1000;
            for (let i = 0; i < allIds.length; i += chunkSize) {
                const chunk = allIds.slice(i, i + chunkSize);
                await gmail.users.messages.batchModify({
                    userId: "me",
                    requestBody: {
                        ids: chunk,
                        addLabelIds: ["TRASH"],
                        removeLabelIds: ["INBOX"],
                    },
                });
            }

            return NextResponse.json({ success: true, count: allIds.length, message: `Trashed ${allIds.length} emails from ${email}` });
        }

        return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

    } catch (error) {
        console.error("Action API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
