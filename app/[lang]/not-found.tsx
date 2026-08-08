"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, dict, homePath, isLocale, type Locale } from "@/lib/i18n";

/**
 * Een 404 krijgt geen routeparameters mee, dus de taal komt hier uit het pad
 * dat de bezoeker probeerde. Daardoor blijft een verdwaalde Engelse bezoeker
 * in het Engels.
 */
export default function NietGevonden() {
  const pathname = usePathname() ?? "";
  const first = pathname.split("/").filter(Boolean)[0] ?? "";
  const locale: Locale = isLocale(first) ? first : DEFAULT_LOCALE;
  const t = dict(locale);

  return (
    <div className="wrap wrap-narrow blok">
      <p className="eyebrow">404</p>
      <h1 className="blok-kop">{t.nietGevondenKop}</h1>
      <div className="prose">
        <p>{t.nietGevondenTekst}</p>
      </div>
      <p className="niet-gevonden-knop">
        <Link href={homePath(locale)} className="btn">
          {t.nietGevondenLink}
        </Link>
      </p>
    </div>
  );
}
