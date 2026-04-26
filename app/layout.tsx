import type { Metadata } from "next";
import "./globals.css";
import "../styles/picker.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import { TrackPageView } from "@/components/TrackPageView";

export const metadata: Metadata = {
  title: "Drawlot — Official Random Picker",
  description: "ArenaPlus official draw tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Anton&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <TrackPageView />
        <Analytics />
      </body>
    </html>
  );
}
