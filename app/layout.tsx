import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SeriousModeProvider } from "@/contexts/SeriousModeContext";

const inter = Inter({
  variable: "--font-clean",
  subsets: ["latin"],
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <SeriousModeProvider>
          {children}
        </SeriousModeProvider>
      </body>
    </html>
  );
}
