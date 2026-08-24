import type { Metadata } from "next";
import { headers } from "next/headers";
import { Playfair_Display, Lato, Inter, Noto_Serif, Parisienne } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

const parisienne = Parisienne({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-parisienne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Izzan - Discover Your Moment of Calm",
  description: "Handcrafted, Natural Candles & Essential Oils. Elevate Your Space.",
};

import Providers from "@/components/Providers";

import { Toaster } from "sonner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Izzan",
  "url": siteUrl,
  // Real asset (public/images/logo.png does not exist yet); swap when a
  // dedicated logo is added.
  "logo": `${siteUrl}/images/hero-poster.png`,
  "description": "Handcrafted, Natural Candles & Essential Oils. Elevate Your Space.",
  "sameAs": [
    "https://instagram.com/izzan_moment",
    "https://facebook.com/izzanscents"
  ]
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Nonce is generated per-request in middleware; required for the inline
  // JSON-LD script under the production CSP (no 'unsafe-inline').
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden relative" data-scroll-behavior="smooth">
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body 
        className={`${playfair.variable} ${lato.variable} ${inter.variable} ${notoSerif.variable} ${parisienne.variable} font-body antialiased min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors duration-300 flex flex-col relative`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            nonce={nonce}
          >
            <Providers>
              {children}
              <Toaster position="bottom-right" richColors />
            </Providers>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
