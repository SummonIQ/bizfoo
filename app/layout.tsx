import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppAnalyticsProvider } from "@/components/providers/analytics-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const siteUrl = "https://bizfoo.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "bizfoo — Storefronts that ship in an afternoon",
    template: "%s | bizfoo",
  },
  description:
    "bizfoo is a product and storefront management platform. Manage products, sync to Stripe, and serve a clean catalog API to any frontend.",
  openGraph: {
    title: "bizfoo — Storefronts that ship in an afternoon",
    description:
      "Manage products, sync to Stripe, and serve a clean catalog + checkout API to any frontend.",
    type: "website",
    url: siteUrl,
    siteName: "bizfoo",
  },
  twitter: {
    card: "summary_large_image",
    title: "bizfoo — Storefronts that ship in an afternoon",
  },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable}`}
    >
      <body>
        <ThemeProvider>
          <AppAnalyticsProvider>{children}</AppAnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
