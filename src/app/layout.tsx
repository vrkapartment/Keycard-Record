import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-sunken text-ink">
        <header className="sticky top-0 z-30 border-b border-border bg-paper pt-[env(safe-area-inset-top)]">
          <div className="mx-auto flex max-w-xl items-center px-4 py-3">
            <Link href="/" className="font-semibold text-primary">
              Keycard Record
            </Link>
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
