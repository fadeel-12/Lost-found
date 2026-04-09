import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';
import { TranslationProvider } from "@/contexts/TranslationContext";
import { PWAInstall } from "@/components/PWAInstall";

export const metadata: Metadata = {
  title: "Lostify - Lost & Found",
  description: "Report and recover lost items across your university campus.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lostify",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "Lostify - Lost & Found",
    description: "Report and recover lost items across your university campus.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="Lostify" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Lostify" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <TranslationProvider>
          {children}
          <Toaster richColors position="top-center" />
          <PWAInstall />
        </TranslationProvider>
      </body>
    </html>
  );
}
