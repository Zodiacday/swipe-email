import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Privacy Policy for Swipe. We don't read your emails, don't sell your data, and only use OAuth for secure access. Learn how we protect your privacy.",
    robots: {
        index: true,
        follow: true,
    },
};

export default function PrivacyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
