"use client";

import type { SimSpec } from "@/lib/sim";
import { groeiSpec } from "@/lib/sims/groei";
import { patroonSpec } from "@/lib/sims/patroon";
import { regelSpec } from "@/lib/sims/regel";
import { stromingSpec } from "@/lib/sims/stroming";
import { zandhoopSpec } from "@/lib/sims/zandhoop";
import { zwermSpec } from "@/lib/sims/zwerm";
import { SimStage } from "./SimStage";

/**
 * De koppeling tussen een slug en zijn simulatie. Dit register moet aan de
 * clientkant staan: de specificaties bevatten functies en die kunnen niet
 * over de servergrens.
 */
const SPECS: Record<string, SimSpec> = {
  zwerm: zwermSpec,
  patroon: patroonSpec,
  regel: regelSpec,
  stroming: stromingSpec,
  groei: groeiSpec,
  zandhoop: zandhoopSpec,
};

export function StukView({
  slug,
  titel,
  aspect,
}: {
  slug: string;
  titel: string;
  aspect: number;
}) {
  const spec = SPECS[slug];
  if (!spec) return null;
  return <SimStage spec={spec} aspect={aspect} title={titel} />;
}
