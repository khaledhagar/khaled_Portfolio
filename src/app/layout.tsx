import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Khaled Hagar | Assistant General Manager",
  description:
    "Assistant General Manager at ANRPC Petroleum Co. — engineering excellence, preventive maintenance, and continuous growth.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${dmSans.variable} noise-overlay antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
