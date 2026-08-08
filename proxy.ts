import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./lib/i18n";

/**
 * Elk adres hoort onder een taal te staan. Wie op / binnenkomt, of op een pad
 * zonder taalprefix, wordt doorgestuurd naar de taal die zijn browser
 * aangeeft — met Nederlands als terugval.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = negotiate(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

/**
 * Leest de Accept-Language-kop en kiest de best passende taal. De kop ziet er
 * uit als "nl-NL,nl;q=0.9,en-US;q=0.8" — hoogste q wint.
 */
function negotiate(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="));
      const quality = q ? Number.parseFloat(q.slice(2)) : 1;
      return {
        tag: tag.trim().toLowerCase(),
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    // "nl-be" telt als "nl".
    const base = tag.split("-")[0];
    const match = LOCALES.find((locale) => locale === base);
    if (match) return match;
  }

  return DEFAULT_LOCALE;
}

export const config = {
  // Alles behalve de interne paden van Next en bestanden met een extensie.
  matcher: ["/((?!_next/|.*\\.).*)"],
};
