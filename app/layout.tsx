import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

/**
 * Vercel geeft het productiedomein mee tijdens de build; lokaal valt het
 * terug op de ontwikkelserver. Zo kloppen de canonieke URL's zonder dat er
 * een domein hardgecodeerd staat.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const beschrijving =
  "Zes simulaties waarin ingewikkeld gedrag voortkomt uit een paar regels " +
  "van niks. Zwermen, patronen, planten en lawines — met de knoppen erbij.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Emergentie — eenvoudige regels, complex gedrag",
    template: "%s — Emergentie",
  },
  description: beschrijving,
  openGraph: {
    title: "Emergentie — eenvoudige regels, complex gedrag",
    description: beschrijving,
    type: "website",
    locale: "nl_NL",
    siteName: "Emergentie",
  },
  twitter: {
    card: "summary_large_image",
    title: "Emergentie — eenvoudige regels, complex gedrag",
    description: beschrijving,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0c0e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#inhoud">
          Naar de inhoud
        </a>

        <header className="site-head">
          <div className="wrap site-head-inner">
            <Link href="/" className="wordmark">
              <span className="wordmark-dot" aria-hidden="true" />
              Emergentie
            </Link>
            <nav className="site-nav" aria-label="Hoofdmenu">
              <Link href="/#stukken">Stukken</Link>
              <Link href="/colofon">Colofon</Link>
            </nav>
          </div>
        </header>

        <main id="inhoud">{children}</main>

        <footer className="site-foot">
          <div className="wrap site-foot-inner">
            <p>Emergentie — eenvoudige regels, complex gedrag</p>
            <p>
              Alles draait in de browser.{" "}
              <Link href="/colofon">Colofon en bronnen</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
