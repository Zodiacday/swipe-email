import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar/Navbar";
import { AuthProvider } from "@/components/AuthProvider/AuthProvider";
import { EmailProvider } from "@/contexts/EmailContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ConfirmModalProvider } from "@/hooks/useConfirmModal";
import { ConfirmModal } from "@/components/ConfirmModal";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Swipe - The Privacy-First Inbox Cleaner",
    template: "%s | Swipe",
  },
  description: "The privacy-first inbox cleaner that's actually fun to use. Clean thousands of emails in minutes with satisfying swipe gestures. Unlike others, we don't sell your data.",
  keywords: ["email cleaner", "inbox zero", "unsubscribe", "email management", "privacy", "gmail cleaner", "outlook cleaner"],
  authors: [{ name: "Swipe Inc." }],
  creator: "Swipe Inc.",
  publisher: "Swipe Inc.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://swipeemail.com",
    siteName: "Swipe",
    title: "Swipe - Inbox. Remastered.",
    description: "The privacy-first inbox cleaner that's actually fun to use. Unlike others, we don't sell your data.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Swipe - Clean Your Inbox with Style",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Swipe - The Privacy-First Inbox Cleaner",
    description: "Clean thousands of emails in minutes with satisfying swipe gestures. We don't sell your data.",
    images: ["/og-image.png"],
    creator: "@swipeemail",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Swipe",
  },
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL("https://swipeemail.com"),
  alternates: {
    canonical: "/",
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-body antialiased bg-black text-white`}
      >
        <AuthProvider>
          <EmailProvider>
            <ToastProvider>
              <ConfirmModalProvider>
                {/* Skip to content link for keyboard/screen reader users */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-black focus:rounded-lg focus:font-bold"
                >
                  Skip to main content
                </a>
                <Navbar />
                <main id="main-content" tabIndex={-1}>
                  {children}
                </main>
                <ConfirmModal />
              </ConfirmModalProvider>
            </ToastProvider>
          </EmailProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

