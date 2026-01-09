import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

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
        AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: "common", // Allow personal + work accounts
            authorization: {
                params: {
                    scope: "openid email profile offline_access https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.ReadWrite",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            // Persist the OAuth access_token and provider right after signin
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.expiresAt = account.expires_at;
                token.provider = account.provider; // Track which provider
                return token;
            }

            // Check if token needs refresh (5 min buffer before expiry)
            const expiresAt = (token.expiresAt as number) * 1000;
            const bufferMs = 5 * 60 * 1000;
            if (Date.now() < expiresAt - bufferMs) {
                return token; // Token still valid
            }

            // Token expired or about to expire - refresh based on provider
            try {
                let response: Response;

                if (token.provider === "azure-ad") {
                    // Microsoft token refresh
                    response = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({
                            client_id: process.env.AZURE_AD_CLIENT_ID!,
                            client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
                            grant_type: "refresh_token",
                            refresh_token: token.refreshToken as string,
                            scope: "openid email profile offline_access https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.ReadWrite",
                        }),
                    });
                } else {
                    // Google token refresh (default)
                    response = await fetch("https://oauth2.googleapis.com/token", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({
                            client_id: process.env.GOOGLE_CLIENT_ID!,
                            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                            grant_type: "refresh_token",
                            refresh_token: token.refreshToken as string,
                        }),
                    });
                }

                const tokens = await response.json();
                if (!response.ok) {
                    throw new Error(tokens.error || "Failed to refresh token");
                }

                console.log(`[Auth] ${token.provider} token refreshed successfully`);
                return {
                    ...token,
                    accessToken: tokens.access_token,
                    expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
                    refreshToken: tokens.refresh_token ?? token.refreshToken,
                };
            } catch (error) {
                console.error(`[Auth] ${token.provider} token refresh failed:`, error);
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
