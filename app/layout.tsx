import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';
import { TranslationProvider } from "@/contexts/TranslationContext";

export const metadata: Metadata = {
  title: "Lostify - University Lost and Found",
  description: "Lostify helps students and staff report, find, and recover lost items across the University campus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TranslationProvider>
          {children}
          <Toaster richColors position="top-center" />
        </TranslationProvider>
      </body>
    </html>
  );
}
