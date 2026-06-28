import type { Metadata } from "next";
import {
  Barlow_Condensed,
  Caveat_Brush,
  Inter,
  Noto_Sans_JP,
  Patrick_Hand,
  Plus_Jakarta_Sans,
  Zen_Kurenaido,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { SeriousModeProvider } from "@/contexts/SeriousModeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageHtmlWrapper from "@/components/LanguageHtmlWrapper";

const inter = Inter({
  variable: "--font-clean",
  subsets: ["latin"],
});

const caveatBrush = Caveat_Brush({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const patrickHand = Patrick_Hand({
  variable: "--font-handwritten",
  subsets: ["latin"],
  weight: "400",
});

const zenKurenaido = Zen_Kurenaido({
  variable: "--font-jp-handwritten",
  subsets: ["latin"],
  weight: "400",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-jp-clean",
  subsets: ["latin"],
});

const basecampDisplay = Barlow_Condensed({
  variable: "--font-basecamp-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
});

const basecampBody = Plus_Jakarta_Sans({
  variable: "--font-basecamp-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Diary of Archit | Portfolio",
  description: "A creative portfolio in the style of a Wimpy Kid diary. Developer, builder, and perpetual learner.",
  keywords: ["Archit Pai", "developer", "portfolio", "React", "Next.js", "Azure", "PostGIS", "MapLibre"],
  authors: [{ name: "Archit Pai" }],
  openGraph: {
    title: "Diary of Archit",
    description: "A creative portfolio in the style of a Wimpy Kid diary",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${caveatBrush.variable} ${patrickHand.variable} ${zenKurenaido.variable} ${notoSansJP.variable} ${basecampDisplay.variable} ${basecampBody.variable} antialiased`}>
        <LanguageProvider>
          <LanguageHtmlWrapper />
          <SeriousModeProvider>
            {children}
            <Analytics />
            <SpeedInsights />
          </SeriousModeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
