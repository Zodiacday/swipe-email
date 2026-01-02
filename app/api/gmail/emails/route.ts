import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface GmailMessage {
    id: string;
    threadId: string;
}

interface GmailMessageDetails {
    id: string;
    payload: {
        headers: Array<{ name: string; value: string }>;
        body?: { data?: string };
        parts?: Array<{ body?: { data?: string }; mimeType?: string }>;
    };
    snippet: string;
    internalDate: string;
    labelIds: string[];
    sizeEstimate: number;
}

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || searchParams.get("maxResults") || "20";
    const pageToken = searchParams.get("pageToken") || "";

    try {
        // Fetch list of messages
        const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${limit}&q=category:promotions OR category:social OR is:unread${pageToken ? `&pageToken=${pageToken}` : ""}`;

        const listResponse = await fetch(listUrl, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!listResponse.ok) {
            const error = await listResponse.json();
            return NextResponse.json({ error: error.error?.message || "Failed to fetch emails" }, { status: listResponse.status });
        }

        const listData = await listResponse.json();
        const messages: GmailMessage[] = listData.messages || [];

        // Fetch details for each message
        const emailDetails = await Promise.all(
            messages.map(async (msg) => {
                const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=List-Unsubscribe`;

                const detailResponse = await fetch(detailUrl, {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                });

                if (!detailResponse.ok) return null;

                const detail: GmailMessageDetails = await detailResponse.json();

                const getHeader = (name: string) =>
                    detail.payload.headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || "";

                const fromHeader = getHeader("From");
                const senderMatch = fromHeader.match(/^(.+?)\s*<(.+?)>$/) || [null, fromHeader, fromHeader];

                return {
                    id: detail.id,
                    provider: "gmail",
                    providerId: detail.id,
                    sender: senderMatch[2] || fromHeader,
                    senderName: senderMatch[1]?.replace(/"/g, "") || fromHeader,
                    senderDomain: (senderMatch[2] || fromHeader).split("@")[1] || "",
                    subject: getHeader("Subject"),
                    preview: detail.snippet,
                    receivedAt: new Date(parseInt(detail.internalDate)).toISOString(),
                    timestamp: parseInt(detail.internalDate),
                    listUnsubscribe: {
                        http: getHeader("List-Unsubscribe").match(/<(https?:\/\/[^>]+)>/)?.[1] || null,
                        mailto: getHeader("List-Unsubscribe").match(/<(mailto:[^>]+)>/)?.[1] || null,
                    },
                    category: detail.labelIds.includes("CATEGORY_PROMOTIONS") ? "promo" :
                        detail.labelIds.includes("CATEGORY_SOCIAL") ? "social" : "newsletter",
                    labels: detail.labelIds,
                    isRead: !detail.labelIds.includes("UNREAD"),
                    size: detail.sizeEstimate,
                    metadata: {},
                    headers: {},
                };
            })
        );

        return NextResponse.json({
            emails: emailDetails.filter(Boolean),
            nextPageToken: listData.nextPageToken,
            resultSizeEstimate: listData.resultSizeEstimate,
        });

    } catch (error) {
        console.error("Gmail API error:", error);
        return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const { action, emailId } = await request.json();

        if (action === "trash" && emailId) {
            const trashUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/trash`;

            const response = await fetch(trashUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return NextResponse.json({ error: error.error?.message || "Failed to trash email" }, { status: response.status });
            }

            return NextResponse.json({ success: true, emailId });
        }

        if (action === "untrash" && emailId) {
            const untrashUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/untrash`;

            const response = await fetch(untrashUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return NextResponse.json({ error: error.error?.message || "Failed to untrash email" }, { status: response.status });
            }

            return NextResponse.json({ success: true, emailId });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Gmail API error:", error);
        return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
    }
}

