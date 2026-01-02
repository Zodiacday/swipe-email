import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar/Navbar";
import { AuthProvider } from "@/components/AuthProvider/AuthProvider";
import { EmailProvider } from "@/contexts/EmailContext";
import { ToastProvider } from "@/contexts/ToastContext";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swipe - Clean Your Inbox with Style",
  description: "Dopamine-driven email cleanup with gestures and gamification.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
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
              <Navbar />
              {children}
            </ToastProvider>
          </EmailProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

