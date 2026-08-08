/**
 * Vercel geeft het productiedomein mee tijdens de build; lokaal valt het
 * terug op de ontwikkelserver. Zo kloppen de canonieke URL's en de
 * `hreflang`-verwijzingen zonder dat er een domein hardgecodeerd staat.
 */
export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}
