import { writeFileSync } from "node:fs";
import {
  baselineDecision,
  continueToDecision,
  defaultDecision,
  initialState,
  simulateWeek,
} from "../src/engine/simulationEngine";
import type { WeekDecision } from "../src/engine/types";
const rows = [
  "profile,week,businessCashRp,emergencyFundRp,sold,wasteRp,status",
];
for (const profile of ["balanced", "conservative", "careless"]) {
  let state = initialState();
  for (let w = 1; w <= 12; w++) {
    let decision: WeekDecision = baselineDecision(state);
    if (profile !== "balanced")
      decision = {
        ...defaultDecision(state),
        scenarioChoiceKey:
          w === 7 ? "C" : w === 10 ? "B" : w === 4 || w === 5 ? "B" : "A",
        sellingPriceRp: profile === "careless" ? 12000 : 16000,
        targetStockOption: profile === "careless" ? "high_145" : "low_80",
        ownerDrawRp: profile === "careless" ? 100000 : 0,
        enableQris: false,
        enableWhatsapp: false,
      };
    const r = simulateWeek(state, decision);
    if (!r.ok) {
      rows.push(
        `${profile},${w},${state.businessCashRp},${state.emergencyFundRp},0,0,${r.error.code}`,
      );
      break;
    }
    rows.push(
      `${profile},${w},${r.nextState.businessCashRp},${r.nextState.emergencyFundRp},${r.weekResult.producedPortions},${r.weekResult.wasteInventoryValueRp},${r.nextState.outcome}`,
    );
    state = continueToDecision(r.nextState);
  }
}
writeFileSync("docs/balance-engine.csv", rows.join("\n") + "\n");
console.log(rows.join("\n"));
