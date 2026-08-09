/**
 * Instellingen in de adresbalk. Wie een mooie stand vindt, kan de link
 * doorsturen en de ander ziet precies hetzelfde.
 *
 * Alleen waarden die van de standaard afwijken komen in de URL, zodat een
 * onaangeroerd stuk gewoon een schoon adres houdt. Alles wat binnenkomt wordt
 * gecontroleerd tegen de bediening zelf — een verzonnen parameter of een
 * waarde buiten het bereik wordt genegeerd in plaats van doorgegeven.
 */

import { clamp, type Control, type Params, type SimSpec } from "./sim";

/** Leest de bekende parameters uit een querystring. */
export function leesParams(spec: SimSpec, search: string): Params {
  const zoek = new URLSearchParams(search);
  const uit: Params = {};

  for (const control of spec.controls) {
    const ruw = zoek.get(control.key);
    if (ruw === null) continue;

    const waarde = ontleed(control, ruw);
    if (waarde !== undefined) uit[control.key] = waarde;
  }

  return uit;
}

function ontleed(
  control: Control,
  ruw: string,
): number | string | boolean | undefined {
  if (control.kind === "slider") {
    const getal = Number.parseFloat(ruw);
    if (!Number.isFinite(getal)) return undefined;
    // Afkappen op het bereik van het schuifje, en op het raster van de stap.
    const begrensd = clamp(getal, control.min, control.max);
    const stappen = Math.round((begrensd - control.min) / control.step);
    return Number(
      (control.min + stappen * control.step).toFixed(6),
    );
  }

  if (control.kind === "select") {
    return control.options.some((o) => o.value === ruw) ? ruw : undefined;
  }

  if (ruw === "1" || ruw === "true") return true;
  if (ruw === "0" || ruw === "false") return false;
  return undefined;
}

/**
 * Schrijft de afwijkende waarden terug naar de adresbalk. Met
 * `replaceState`, zodat elke beweging van een schuifje geen nieuwe stap in
 * de geschiedenis van de browser wordt.
 */
export function schrijfParams(spec: SimSpec, params: Params): void {
  if (typeof window === "undefined") return;

  const zoek = new URLSearchParams();

  for (const control of spec.controls) {
    const waarde = params[control.key];
    const standaard = spec.defaults[control.key];
    if (waarde === undefined || waarde === standaard) continue;

    if (typeof waarde === "boolean") zoek.set(control.key, waarde ? "1" : "0");
    else zoek.set(control.key, String(waarde));
  }

  const query = zoek.toString();
  const adres = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;

  window.history.replaceState(null, "", adres);
}
