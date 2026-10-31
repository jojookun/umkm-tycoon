import type { CoachResponse, CoachTelemetry } from "../engine/types";
import { money } from "../engine/simulationEngine";

// Live AI is intentionally disabled until a server-side proxy and shared rate limiting exist.
export function getCoachReflection(t: CoachTelemetry): CoachResponse {
  const waste =
    t.inventory_waste > 0
      ? `Bahan terbuang senilai ${money(t.inventory_waste)}. Bandingkan target stok dengan porsi yang terjual.`
      : "Tidak ada bahan terbuang pada minggu ini.";
  const debt =
    t.debt_payment > 0 ? ` Cicilan terbayar ${money(t.debt_payment)}.` : "";
  return {
    source: "rule_based_fallback",
    mentorName: "Mas Raka",
    message: `Kas akhir minggu ${t.turn}: ${money(t.cash)}. ${waste}${debt} Coba keputusan lain untuk melihat konsekuensinya.`,
  };
}
