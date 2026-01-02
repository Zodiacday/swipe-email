import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify",
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            // Persist the OAuth access_token to the token right after signin
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.expiresAt = account.expires_at;
                return token;
            }

            // Check if token needs refresh (5 min buffer before expiry)
            const expiresAt = (token.expiresAt as number) * 1000;
            const bufferMs = 5 * 60 * 1000;
            if (Date.now() < expiresAt - bufferMs) {
                return token; // Token still valid
            }

            // Token expired or about to expire - refresh it
            try {
                const response = await fetch("https://oauth2.googleapis.com/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        client_id: process.env.GOOGLE_CLIENT_ID!,
                        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                        grant_type: "refresh_token",
                        refresh_token: token.refreshToken as string,
                    }),
                });

                const tokens = await response.json();
                if (!response.ok) {
                    throw new Error(tokens.error || "Failed to refresh token");
                }

                console.log("[Auth] Token refreshed successfully");
                return {
                    ...token,
                    accessToken: tokens.access_token,
                    expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
                    refreshToken: tokens.refresh_token ?? token.refreshToken,
                };
            } catch (error) {
                console.error("[Auth] Token refresh failed:", error);
                return { ...token, error: "RefreshAccessTokenError" };
            }
        },
        async session({ session, token }) {
            // Send properties to the client
            session.accessToken = token.accessToken as string;
            session.refreshToken = token.refreshToken as string;
            if (token.error) {
                session.error = token.error as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
};
