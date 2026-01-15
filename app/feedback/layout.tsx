import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Feedback",
    description: "Share your feedback, feature requests, or report issues. Help us make Swipe better.",
};

export default function FeedbackLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
