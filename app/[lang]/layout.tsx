import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import {
  HTML_LANG,
  LOCALES,
  OG_LOCALE,
  colofonPath,
  dict,
  homePath,
  isLocale,
  type Locale,
} from "@/lib/i18n";
import { siteUrl } from "@/lib/site";
import "../globals.css";

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

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = dict(lang);

  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: `${t.siteNaam} — ${t.siteOndertitel}`,
      template: `%s — ${t.siteNaam}`,
    },
    description: t.siteBeschrijving,
    openGraph: {
      title: `${t.siteNaam} — ${t.siteOndertitel}`,
      description: t.siteBeschrijving,
      type: "website",
      locale: OG_LOCALE[lang],
      siteName: t.siteNaam,
    },
    twitter: {
      card: "summary_large_image",
      title: `${t.siteNaam} — ${t.siteOndertitel}`,
      description: t.siteBeschrijving,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b0c0e",
};

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale: Locale = lang;
  const t = dict(locale);

  return (
    <html
      lang={HTML_LANG[locale]}
      className={`${sans.variable} ${serif.variable} ${mono.variable}`}
    >
      <body>
        <a className="skip" href="#inhoud">
          {t.naarInhoud}
        </a>

        <header className="site-head">
          <div className="wrap site-head-inner">
            <Link href={homePath(locale)} className="wordmark">
              <span className="wordmark-dot" aria-hidden="true" />
              {t.siteNaam}
            </Link>
            <nav className="site-nav" aria-label={t.menuLabel}>
              <Link href={`${homePath(locale)}#stukken`}>{t.navStukken}</Link>
              <Link href={colofonPath(locale)}>{t.navColofon}</Link>
              <LanguageSwitch locale={locale} />
            </nav>
          </div>
        </header>

        <main id="inhoud">{children}</main>

        <footer className="site-foot">
          <div className="wrap site-foot-inner">
            <p>{t.voetTekst}</p>
            <p>
              {t.voetAlles}{" "}
              <Link href={colofonPath(locale)}>{t.voetLink}</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
