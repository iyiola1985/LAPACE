import { Montserrat } from "next/font/google";
import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import { AuthProvider } from "@/components/AuthProvider";
import { BottomNav } from "@/components/BottomNav";
import { QuoteProvider } from "@/components/QuoteProvider";
import { ScrollFrameSequence } from "@/components/ScrollFrameSequence";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="en" className={`${montserrat.variable} h-full`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-helvetica flex min-h-full flex-col bg-transparent text-white antialiased">
        <SmoothScroll>
          <ScrollFrameSequence className="flex min-h-full flex-1 flex-col">
            <AuthProvider>
              <QuoteProvider>
                <AppHeader />
                <div className="relative z-10 flex-1 pb-20 md:pb-0">
                  {children}
                </div>
                <BottomNav />
              </QuoteProvider>
            </AuthProvider>
          </ScrollFrameSequence>
        </SmoothScroll>
      </body>
    </html>
  );
}
