import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "Roast My Landing Page AI 🔥 - Brutal Design Critique",
        template: "%s | Roast My Landing Page AI"
    },
    description: "Will your site survive? Get an instant, brutal AI audit of your UX/UI. 1,200+ sites roasted.",
    openGraph: {
        title: "Roast My Landing Page AI 🔥 - Brutal Design Critique",
        description: "Will your site survive? Get an instant, brutal AI audit of your UX/UI. 1,200+ sites roasted.",
        url: 'https://roast-my-landing-page.ai',
        siteName: 'Roast My Landing Page AI',
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "Roast My Landing Page AI 🔥 - Brutal Design Critique",
        description: "Will your site survive? Get an instant, brutal AI audit of your UX/UI. 1,200+ sites roasted.",
    },
    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
    },
    manifest: '/manifest.json',
};

import Footer from "./components/Footer";

import { Toaster } from 'sonner';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
                <Footer />
                <Toaster position="top-center" richColors theme="dark" />
            </body>
        </html>
    );
}
