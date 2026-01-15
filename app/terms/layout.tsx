import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Terms of Service for Swipe, the privacy-first inbox cleaner. Learn about our service terms, user responsibilities, and subscription policies.",
    robots: {
        index: true,
        follow: true,
    },
};

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
