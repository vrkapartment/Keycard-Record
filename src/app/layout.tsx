import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { BottomNav } from "@/components/BottomNav";
import { ThemeToggleButton } from "@/components/ThemeToggle";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Keycard Record",
  description: "ระบบบันทึกรหัสคีย์การ์ดของหอพัก",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-sunken text-ink">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <header className="sticky top-0 z-30 border-b border-border bg-paper pt-[env(safe-area-inset-top)]">
          <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold text-primary">
              Keycard Record
            </Link>
            <ThemeToggleButton />
          </div>
        </header>
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-5 pb-24">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
