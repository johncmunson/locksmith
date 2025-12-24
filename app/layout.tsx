import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
  title: "Locksmith",
  description: "A modern Next.js starter with authentication",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://locksmith-nextjs.vercel.app",
  ),
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔐</text></svg>",
  },
  openGraph: {
    title: "Locksmith",
    description:
      "A modern Next.js starter with a bulletproof and production-grade auth setup out of the box",
    url: "/",
    siteName: "Locksmith",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Locksmith",
    description:
      "A modern Next.js starter with a bulletproof and production-grade auth setup out of the box",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-gray-50`}
      >
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="text-center py-4 text-sm text-gray-600">
          <a
            href="https://github.com/johncmunson/locksmith"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 underline"
          >
            View on GitHub
          </a>
        </footer>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
