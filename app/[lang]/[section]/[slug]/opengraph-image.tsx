import { ImageResponse } from "next/og";
import { LOCALES, SECTION_STUKKEN, dict, isLocale } from "@/lib/i18n";
import { STUKKEN, getStukBySlug } from "@/lib/stukken";

export const alt = "Emergentie";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.flatMap((lang) =>
    STUKKEN.map((stuk) => ({
      lang,
      section: SECTION_STUKKEN[lang],
      slug: stuk.slug[lang],
    })),
  );
}

/**
 * De deelafbeelding per stuk. Typografisch in plaats van een plaatje van de
 * simulatie: hier draait geen canvas, en de regel is toch het interessantst.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; section: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "nl";
  const stuk = getStukBySlug(locale, slug);
  const t = dict(locale);

  const tekst = stuk?.tekst[locale];
  const titel = tekst?.titel ?? t.siteNaam;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0c0e",
          color: "#ece7dd",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              background: "#e9a23b",
            }}
          />
          <div style={{ fontSize: 26, color: "#a5a29a", letterSpacing: 1 }}>
            {t.siteNaam}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 24,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#6e6c67",
              marginBottom: 18,
            }}
          >
            {tekst?.kicker ?? ""}
          </div>
          <div style={{ fontSize: 104, lineHeight: 1, letterSpacing: -3 }}>
            {titel}
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.4,
              color: "#a5a29a",
              marginTop: 26,
              maxWidth: 880,
            }}
          >
            {tekst?.samenvatting ?? t.siteBeschrijving}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#6e6c67",
            borderTop: "1px solid rgba(236,231,221,0.16)",
            paddingTop: 22,
          }}
        >
          <div>{tekst?.herkomst ?? ""}</div>
          <div>{t.siteOndertitel}</div>
        </div>
      </div>
    ),
    size,
  );
}
