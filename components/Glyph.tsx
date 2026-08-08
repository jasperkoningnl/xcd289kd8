/**
 * Een klein merkteken per stuk. Met de hand getekend in plaats van
 * gegenereerd: op 40 pixels leest een gerichte schets beter dan een
 * uitgedunde simulatie.
 */

const paden: Record<string, React.ReactNode> = {
  zwerm: (
    <>
      <path d="M6 22l7-3-7-3 2 3z" />
      <path d="M17 14l7-3-7-3 2 3z" />
      <path d="M17 32l7-3-7-3 2 3z" />
      <path d="M28 23l7-3-7-3 2 3z" />
    </>
  ),
  patroon: (
    <>
      <circle cx="20" cy="20" r="3.5" />
      <circle cx="20" cy="20" r="8.5" />
      <circle cx="20" cy="20" r="13.5" />
      <path d="M20 6.5v-3M20 36.5v-3M6.5 20h-3M36.5 20h-3" />
    </>
  ),
  regel: (
    <>
      <path d="M19 6h2v4h-2z" fill="currentColor" stroke="none" />
      <path d="M15 12h2v4h-2zM23 12h2v4h-2z" fill="currentColor" stroke="none" />
      <path
        d="M11 18h2v4h-2zM19 18h2v4h-2zM27 18h2v4h-2z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M7 24h2v4H7zM15 24h2v4h-2zM23 24h2v4h-2zM31 24h2v4h-2z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M11 30h2v4h-2zM19 30h2v4h-2zM27 30h2v4h-2z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  stroming: (
    <>
      <path d="M4 12c6 0 6 8 12 8s6-8 12-8 6 8 8 8" />
      <path d="M4 20c6 0 6 8 12 8s6-8 12-8 6 8 8 8" />
      <path d="M4 28c6 0 6 8 12 8" />
    </>
  ),
  groei: (
    <>
      <path d="M20 36V16" />
      <path d="M20 24l-7-7M13 17V11M13 17H7" />
      <path d="M20 20l7-7M27 13V8M27 13h5" />
      <path d="M20 30l-5-5M20 28l5-5" />
    </>
  ),
  zandhoop: (
    <>
      <rect x="6" y="6" width="28" height="28" />
      <rect x="13" y="13" width="14" height="14" />
      <path d="M6 6l7 7M34 6l-7 7M6 34l7-7M34 34l-7-7" />
      <rect x="18" y="18" width="4" height="4" fill="currentColor" stroke="none" />
    </>
  ),
};

export function Glyph({ slug, size = 40 }: { slug: string; size?: number }) {
  const pad = paden[slug];
  if (!pad) return null;
  return (
    <svg
      className="kaart-glyph"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {pad}
    </svg>
  );
}
