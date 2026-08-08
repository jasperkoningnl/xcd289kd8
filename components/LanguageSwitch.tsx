"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LOCALES,
  LOCALE_NAMES,
  LOCALE_SHORT,
  dict,
  type Locale,
} from "@/lib/i18n";
import { translatePath } from "@/lib/paths";

/**
 * De taalschakelaar. Springt naar dezelfde bladzijde in de andere taal, niet
 * naar de voorpagina: /nl/stuk/zwerm wordt /en/piece/flock.
 */
export function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? `/${locale}`;
  const t = dict(locale);

  return (
    <div className="taalschakel" role="group" aria-label={t.taalLabel}>
      {LOCALES.map((target) => {
        const current = target === locale;
        return (
          <Link
            key={target}
            href={translatePath(pathname, target)}
            className="taal"
            hrefLang={target}
            aria-current={current ? "true" : undefined}
            lang={target}
            title={LOCALE_NAMES[target]}
          >
            {LOCALE_SHORT[target]}
          </Link>
        );
      })}
    </div>
  );
}
