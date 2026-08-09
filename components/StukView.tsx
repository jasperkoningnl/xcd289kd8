"use client";

import type { Locale } from "@/lib/i18n";
import type { SimSpec } from "@/lib/sim";
import { groeiSpec } from "@/lib/sims/groei";
import { patroonSpec } from "@/lib/sims/patroon";
import { regelSpec } from "@/lib/sims/regel";
import { ritmeSpec } from "@/lib/sims/ritme";
import { stromingSpec } from "@/lib/sims/stroming";
import { synchronieSpec } from "@/lib/sims/synchronie";
import { zandhoopSpec } from "@/lib/sims/zandhoop";
import { zwermSpec } from "@/lib/sims/zwerm";
import { SimStage } from "./SimStage";

/**
 * De koppeling tussen de vaste `id` van een stuk en zijn simulatie. Dit
 * register moet aan de clientkant staan: de specificaties bevatten functies
 * en die kunnen niet over de servergrens.
 */
const SPECS: Record<string, SimSpec> = {
  zwerm: zwermSpec,
  patroon: patroonSpec,
  regel: regelSpec,
  stroming: stromingSpec,
  groei: groeiSpec,
  zandhoop: zandhoopSpec,
  synchronie: synchronieSpec,
  ritme: ritmeSpec,
};

export function StukView({
  id,
  titel,
  aspect,
  locale,
}: {
  id: string;
  titel: string;
  aspect: number;
  locale: Locale;
}) {
  const spec = SPECS[id];
  if (!spec) return null;
  return (
    <SimStage spec={spec} aspect={aspect} title={titel} locale={locale} />
  );
}
