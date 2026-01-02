import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { NextResponse } from "next/server";
import { setCredentials, batchModifyEmails } from "@/lib/providers/gmail";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { ids } = await request.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
        }

        const auth = new google.auth.OAuth2();
        setCredentials(auth, session.accessToken as string, session.refreshToken as string);

        // Batch Trash
        await batchModifyEmails(auth, ids, { addLabelIds: ["TRASH"] });

        return NextResponse.json({ success: true, count: ids.length });
    } catch (error) {
        console.error("Batch Trash API Error:", error);
        return NextResponse.json({ error: "Failed to trash emails" }, { status: 500 });
    }
}
