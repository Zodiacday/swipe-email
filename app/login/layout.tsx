import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In",
    description: "Sign in to Swipe with your Google account. Start cleaning your inbox in seconds with our secure OAuth login.",
    robots: {
        index: false, // Don't index login page
        follow: true,
    },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
