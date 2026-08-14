import { Hanken_Grotesk, Inter } from "next/font/google";
import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { QuoteProvider } from "@/components/QuoteProvider";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "LAPACE Roofing Marketplace",
  description:
    "Find verified roofing professionals and premium aluminum & stone-coated materials from Lapace Aluminium.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${hanken.variable} ${inter.variable} h-full`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-full flex-col bg-background font-[family-name:var(--font-inter)] text-on-background antialiased">
        <QuoteProvider>
          <AppHeader />
          <div className="flex-1 pb-20 md:pb-0">{children}</div>
          <BottomNav />
        </QuoteProvider>
      </body>
    </html>
  );
}
