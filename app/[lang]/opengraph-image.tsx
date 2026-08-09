import { ImageResponse } from "next/og";
import { LOCALES, dict, isLocale } from "@/lib/i18n";

export const alt = "Emergentie";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

/** De deelafbeelding van de voorpagina. */
export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "nl";
  const t = dict(locale);

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
            style={{ width: 14, height: 14, borderRadius: 7, background: "#e9a23b" }}
          />
          <div style={{ fontSize: 26, color: "#a5a29a", letterSpacing: 1 }}>
            {t.siteNaam}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, lineHeight: 1.05, letterSpacing: -3 }}>
            {t.heroTitelVoor}
          </div>
          <div
            style={{
              fontSize: 96,
              lineHeight: 1.05,
              letterSpacing: -3,
              color: "#e9a23b",
              fontStyle: "italic",
            }}
          >
            {t.heroTitelNadruk}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#6e6c67",
            borderTop: "1px solid rgba(236,231,221,0.16)",
            paddingTop: 22,
          }}
        >
          {t.heroEyebrow}
        </div>
      </div>
    ),
    size,
  );
}
