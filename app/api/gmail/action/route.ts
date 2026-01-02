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

            // 1. Find all messages from this sender
            const listRes = await gmail.users.messages.list({
                userId: "me",
                q: `from:${email}`,
                maxResults: 500,
            });

            const messages = listRes.data.messages;

            if (!messages || messages.length === 0) {
                return NextResponse.json({ success: true, count: 0, message: "No emails found to trash." });
            }

            // 2. Batch Trash
            const ids = messages.map((m) => m.id as string);

            await gmail.users.messages.batchModify({
                userId: "me",
                requestBody: {
                    ids: ids,
                    addLabelIds: ["TRASH"],
                    removeLabelIds: ["INBOX"],
                },
            });

            return NextResponse.json({ success: true, count: ids.length, message: `Trashed ${ids.length} emails from ${email}` });
        }

        return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

    } catch (error) {
        console.error("Action API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
