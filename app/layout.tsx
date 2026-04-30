import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../styles/picker.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import { TrackPageView } from "@/components/TrackPageView";

export const viewport: Viewport = {
  themeColor: "#FF6B1A",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://drawlot.com"),
  title: {
    template: "%s | Drawlot.com",
    default: "Drawlot.com — Free Online Random Draw & Winner Picker Tool",
  },
  description:
    "Run a tamper-proof random draw online in seconds. Upload a CSV, XLSX or TXT participant list, pick up to 100 winners with cryptographic randomness, and export a branded winner poster. Free to use.",
  keywords: [
    "random draw tool",
    "online random picker",
    "random winner picker",
    "prize draw tool",
    "raffle picker online",
    "random number generator",
    "winner picker",
    "draw winners online",
    "cryptographically secure draw",
    "free raffle tool",
    "CSV winner picker",
    "random selection tool",
  ],
  authors: [{ name: "Drawlot.com", url: "https://drawlot.com" }],
  creator: "Drawlot.com",
  publisher: "Drawlot.com",
  category: "Utility",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://drawlot.com",
    siteName: "Drawlot.com",
    title: "Drawlot.com — Free Online Random Draw & Winner Picker Tool",
    description:
      "Upload your participant list, pick winners with cryptographic randomness, and export a branded poster. Free, fast and tamper-proof.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Drawlot.com — Free Online Random Draw Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drawlot.com — Free Online Random Draw & Winner Picker Tool",
    description:
      "Upload your participant list, pick winners with cryptographic randomness, and export a branded poster.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://drawlot.com",
  },
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
