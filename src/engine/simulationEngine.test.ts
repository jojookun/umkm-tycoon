import { describe, expect, it } from "vitest";
import { config, scenarios, assessment } from "../data/content";
import {
  initialState,
  defaultDecision,
  baselineDecision,
  continueToDecision,
  simulateWeek,
  generateDemoPresets,
  inventoryValue,
  runResilienceReplay,
  applyReplay,
  createSavedGame,
  outstandingDebt,
  restartRequirement,
} from "./simulationEngine";
import {
  validateSavedGame,
  stateSchema,
  scenariosSchema,
  assessmentSchema,
} from "./validation";
import type { GameState, WeekDecision, TurnSnapshot } from "./types";

function run(state: GameState, patch: Partial<WeekDecision> = {}) {
  const result = simulateWeek(state, { ...defaultDecision(state), ...patch });
  if (!result.ok) throw new Error(result.error.message);
  return result;
}
function balanced() {
  let s = initialState();
  const history: TurnSnapshot[] = [];
  for (let w = 1; w <= 12; w++) {
    const r = run(s, baselineDecision(s));
    history.push(r.snapshot);
    s = continueToDecision(r.nextState);
  }
  return { state: s, history };
}
describe("canonical economy v2.2", () => {
  it("reproduces the complete balanced dry-run without fake demo balances", () => {
    const { state, history } = balanced();
    expect(history.map((h) => h.after.businessCashRp)).toEqual([
      1524500, 1503000, 1481500, 1620500, 1705500, 1458800, 1705400, 1690400,
      1825400, 1960400, 1952400, 1741100,
    ]);
    expect(state.outcome).toBe("stable");
    expect(state.emergencyFundRp).toBe(0);
    expect(generateDemoPresets()[8].state.businessCashRp).toBe(1705400);
  });
  it("keeps conservative cash-only play viable and blocks careless M4 atomically", () => {
    let conservative = initialState(),
      careless = initialState();
    const conservativeCash: number[] = [];
    for (let w = 1; w <= 12; w++) {
      const c = run(conservative, {
        sellingPriceRp: 16000,
        targetStockOption: "low_80",
        scenarioChoiceKey:
          w === 7 ? "C" : w === 10 ? "B" : w === 4 || w === 5 ? "B" : "A",
        enableQris: false,
        enableWhatsapp: false,
      });
      conservative = c.nextState;
      conservativeCash.push(conservative.businessCashRp);
      conservative = continueToDecision(conservative);
    }
    expect(conservativeCash).toEqual([
      1739200, 1892800, 2046400, 2200000, 2353600, 2177000, 2424200, 2127800,
      2281400, 2435000, 2487200, 2298100,
    ]);
    for (let w = 1; w <= 3; w++)
      careless = continueToDecision(
        run(careless, {
          sellingPriceRp: 12000,
          targetStockOption: "high_145",
          ownerDrawRp: 100000,
        }).nextState,
      );
    const before = structuredClone(careless);
    const blocked = simulateWeek(careless, {
      ...defaultDecision(careless),
      sellingPriceRp: 12000,
      targetStockOption: "high_145",
      ownerDrawRp: 100000,
    });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.error.shortfallRp).toBe(218750);
    expect(careless).toEqual(before);
  });
  it("accounts for catering DP once, coop discount only on the 40 catering portions", () => {
    const s = {
      ...initialState(),
      currentWeek: 7 as const,
      unlockedChannels: { cash: true as const, qris: true, whatsapp: true },
    };
    const self = run(s, {
      scenarioChoiceKey: "A",
      targetStockOption: "low_80",
    });
    expect(self.weekResult).toMatchObject({
      cateringDpReceivedRp: 560000,
      cateringPortionsSold: 80,
      regularPortionsSold: 0,
      totalRevenueRp: 1120000,
      newMaterialPurchaseCostRp: 576000,
      otherProductionCostRp: 264000,
    });
    const coop = run(s, {
      scenarioChoiceKey: "B",
      targetStockOption: "high_145",
    });
    expect(coop.weekResult).toMatchObject({
      cateringDpReceivedRp: 280000,
      cateringPortionsSold: 40,
      regularPortionsSold: 80,
      newMaterialPurchaseCostRp: 268000 + 105 * 6900,
    });
  });
  it("preserves FIFO value and does not charge waste twice", () => {
    const r = run(initialState(), {
      targetStockOption: "high_145",
      sellingPriceRp: 16000,
    });
    expect(r.weekResult.wasteMilliPortions).toBe(34500);
    expect(inventoryValue(r.nextState.inventoryLots)).toBe(34500 * 6.9);
    expect(r.nextState.businessCashRp).toBe(
      1600000 +
        r.weekResult.totalRevenueRp -
        r.weekResult.newMaterialPurchaseCostRp -
        r.weekResult.otherProductionCostRp -
        250000,
    );
    const second = run(continueToDecision(r.nextState), {
      targetStockOption: "low_80",
      sellingPriceRp: 16000,
    });
    expect(second.weekResult.newMaterialPurchaseCostRp).toBe(45500 * 7.2);
  });
  it("uses the highest channel once; overload is actual accepted production", () => {
    const s = {
      ...initialState(),
      unlockedChannels: { cash: true as const, qris: true, whatsapp: true },
    };
    const safe = run(s, {
      enableQris: true,
      enableWhatsapp: true,
      targetStockOption: "high_145",
      sellingPriceRp: 12000,
    });
    expect(safe.weekResult.regularDemandPortions).toBe(140);
    expect(safe.weekResult.producedPortions).toBe(120);
    expect(safe.weekResult.overloadTriggered).toBe(false);
    const overloaded = run(s, {
      enableBigPromo: true,
      targetStockOption: "high_145",
      sellingPriceRp: 12000,
      acceptBeyondSafeCapacity: true,
    });
    expect(overloaded.weekResult.producedPortions).toBe(145);
    expect(overloaded.nextState.wellbeingScore).toBe(60);
  });
  it.each(["formal_productive", "instant_high_cost"] as const)(
    "schedules and pays %s, including a remaining M13 installment",
    (productId) => {
      const s = { ...initialState(), currentWeek: 9 as const };
      let r = run(s, { scenarioChoiceKey: "B", loanType: productId });
      expect(r.nextState.activeLoan?.schedule.map((i) => i.dueWeek)).toEqual([
        10, 11, 12, 13,
      ]);
      expect(r.weekResult.loanPrincipalPaidRp).toBe(0);
      for (let w = 10; w <= 12; w++)
        r = run(continueToDecision(r.nextState), {
          scenarioChoiceKey: w === 10 ? "B" : "A",
        });
      expect(outstandingDebt(r.nextState)).toBe(
        config.loans[productId].weeklyInstallmentRp,
      );
      expect(restartRequirement(r.nextState)).toBeGreaterThan(
        config.loans[productId].weeklyInstallmentRp,
      );
    },
  );
  it("partially pays obligations, prevents draws with arrears, never makes negative wallets", () => {
    const s = {
      ...initialState(),
      currentWeek: 12 as const,
      businessCashRp: 552000,
      rawMaterialInflationActive: true,
      brokenFridgeUnrepaired: true,
      trustScore: 0,
      inventoryLots: [
        {
          menuId: "nasi_ayam_lengkuas" as const,
          lotId: "old",
          createdWeek: 11 as const,
          quantityMilliPortions: 80000,
          unitMaterialCostRp: 8500,
        },
      ],
    };
    const r = run(s, {
      sellingPriceRp: 12000,
      targetStockOption: "low_80",
      ownerDrawRp: 0,
    });
    expect(r.nextState.businessCashRp).toBeGreaterThanOrEqual(0);
    const poor = { ...s, businessCashRp: 0, operatingArrearsRp: 500000 };
    const low = run(poor, {
      sellingPriceRp: 12000,
      targetStockOption: "low_80",
    });
    expect(low.nextState.operatingArrearsRp).toBeGreaterThan(0);
    expect(
      simulateWeek(poor, {
        ...defaultDecision(poor),
        sellingPriceRp: 12000,
        targetStockOption: "low_80",
        ownerDrawRp: 50000,
      }).ok,
    ).toBe(false);
  });
  it("does not convert old chicken stock to eggs for free", () => {
    const s = {
      ...initialState(),
      currentWeek: 11 as const,
      inventoryLots: [
        {
          menuId: "nasi_ayam_lengkuas" as const,
          lotId: "old",
          createdWeek: 10 as const,
          quantityMilliPortions: 80000,
          unitMaterialCostRp: 7200,
        },
      ],
    };
    const r = run(s, { scenarioChoiceKey: "B", targetStockOption: "low_80" });
    expect(r.weekResult.newMaterialPurchaseCostRp).toBe(80 * 4200);
    expect(r.weekResult.effectiveSellingPriceRp).toBe(11000);
    expect(
      r.nextState.inventoryLots.some((l) => l.menuId === "nasi_ayam_lengkuas"),
    ).toBe(true);
    expect(run(continueToDecision(r.nextState)).nextState.activeMenuId).toBe(
      "nasi_ayam_lengkuas",
    );
  });
  it("rejects stale decisions, non-finite data, and unavailable channels", () => {
    const s = initialState();
    expect(
      simulateWeek(s, { ...defaultDecision(s), enableQris: true }).ok,
    ).toBe(false);
    expect(stateSchema.safeParse({ ...s, businessCashRp: NaN }).success).toBe(
      false,
    );
    const r = run(s);
    expect(simulateWeek(r.nextState, defaultDecision(r.nextState)).ok).toBe(
      false,
    );
  });
  it("pays interest before principal and keeps arrears in the schedule exactly once", () => {
    const loanState = run(
      { ...initialState(), currentWeek: 9 },
      { scenarioChoiceKey: "B", loanType: "instant_high_cost" },
    ).nextState;
    const poor = {
      ...continueToDecision(loanState),
      businessCashRp: 0,
      operatingArrearsRp: 100000,
      trustScore: 0,
      inventoryLots: [
        {
          menuId: "nasi_ayam_lengkuas" as const,
          lotId: "free-prepaid",
          createdWeek: 9 as const,
          quantityMilliPortions: 80000,
          unitMaterialCostRp: 7200,
        },
      ],
    };
    const r = run(poor, {
      targetStockOption: "low_80",
      sellingPriceRp: 12000,
      scenarioChoiceKey: "B",
      enableQris: false,
      enableWhatsapp: false,
    });
    expect(r.weekResult.loanInterestPaidRp).toBe(37500);
    expect(r.weekResult.loanPrincipalPaidRp).toBe(64900);
    expect(r.nextState.activeLoan?.arrearsRp).toBe(47600);
    expect(outstandingDebt(r.nextState)).toBe(497600);
  });
  it("reconciles cash for varied decisions and never mutates failed turns", () => {
    for (let seed = 1; seed <= 30; seed++) {
      let state = initialState(false, seed);
      for (let w = 1; w <= 12; w++) {
        const d = {
          ...defaultDecision(state),
          sellingPriceRp: ([12000, 14000, 16000] as const)[(seed + w) % 3],
          targetStockOption: (["low_80", "medium_110", "high_145"] as const)[
            (seed * w) % 3
          ],
          scenarioChoiceKey: "ABC"[
            (seed + w) % 3
          ] as WeekDecision["scenarioChoiceKey"],
          enableBigPromo: seed % 3 === 0,
          acceptBeyondSafeCapacity: seed % 2 === 0,
        };
        if (w === 4) d.enableQris = d.scenarioChoiceKey === "A";
        if (w === 5) d.enableWhatsapp = d.scenarioChoiceKey === "A";
        const before = structuredClone(state);
        const result = simulateWeek(state, d);
        expect(state).toEqual(before);
        if (!result.ok) break;
        const r = result.weekResult;
        const oldPaid =
          before.operatingArrearsRp +
          r.operatingArrearsAddedRp -
          result.nextState.operatingArrearsRp;
        expect(r.closingBusinessCashRp).toBe(
          r.openingBusinessCashRp +
            r.totalRevenueRp +
            r.loanDisbursedRp -
            r.newMaterialPurchaseCostRp -
            r.otherProductionCostRp -
            r.fixedCostPaidRp -
            r.repairOrHelperCostRp -
            r.loanPrincipalPaidRp -
            r.loanInterestPaidRp -
            r.ownerDrawPaidRp -
            r.emergencyTransferNetRp -
            oldPaid,
        );
        expect(stateSchema.safeParse(result.nextState).success).toBe(true);
        state = continueToDecision(result.nextState);
      }
    }
  });
});
describe("content, replay and saved games", () => {
  it("validates all content and rejects duplicate answers and weeks", () => {
    expect(scenarios.weeks).toHaveLength(12);
    expect(assessment.pre).toHaveLength(5);
    const bad = structuredClone(scenarios);
    bad.weeks[1].week = 1;
    expect(scenariosSchema.safeParse(bad).success).toBe(false);
    const badAssessment = structuredClone(assessment);
    badAssessment.pre[0].options[1].isCorrect = true;
    expect(assessmentSchema.safeParse(badAssessment).success).toBe(false);
  });
  it("replays M8 through M12 without touching baseline; applying creates consistent snapshots", () => {
    const { state, history } = balanced();
    const original = structuredClone(history);
    const replay = runResilienceReplay(
      history,
      {
        ...history[7].decision,
        scenarioChoiceKey: "B",
        loanType: "instant_high_cost",
      },
      12,
    );
    expect(replay.ok).toBe(true);
    expect(history).toEqual(original);
    if (!replay.ok) return;
    const game = { ...createSavedGame("full"), state, history };
    const applied = applyReplay(game, replay.branch);
    expect(applied.history[7].after.businessCashRp).toBe(1840400);
    expect(validateSavedGame(applied)).toBe(true);
    expect(applied.history).toHaveLength(12);
  });
  it("rejects malformed saves rather than trusting type assertions", () => {
    const game = createSavedGame("full");
    expect(validateSavedGame(game)).toBe(true);
    expect(
      validateSavedGame({
        ...game,
        state: { ...game.state, businessCashRp: -1 },
      }),
    ).toBe(false);
    expect(validateSavedGame({ ...game, mode: "demo" })).toBe(false);
    expect(
      validateSavedGame({ ...game, state: { ...game.state, currentWeek: 4 } }),
    ).toBe(false);
  });
  it("keeps replacement events exclusive and replay draws stable", () => {
    const s = generateDemoPresets()[8].state;
    const a = simulateWeek(s, defaultDecision(s), {
      drawnPoolEventIds: ["stove_issue"],
    });
    expect(a.ok).toBe(true);
    if (!a.ok) return;
    expect(a.weekResult.repairOrHelperCostRp).toBe(150000);
    expect(a.nextState.brokenFridgeUnrepaired).toBe(false);
    const replay = runResilienceReplay([a.snapshot], {
      ...a.snapshot.decision,
      scenarioChoiceKey: "C",
    });
    expect(replay.ok).toBe(true);
  });
  it("returns the failing replay week without touching baseline when funding is insufficient", () => {
    const { history } = balanced();
    const before = structuredClone(history);
    const poor = structuredClone(history[7]);
    poor.before.businessCashRp = 100;
    poor.before.emergencyFundRp = 0;
    const replay = runResilienceReplay([poor], {
      ...poor.decision,
      scenarioChoiceKey: "A",
    });
    expect(replay.ok).toBe(false);
    if (!replay.ok) expect(replay.failedWeek).toBe(8);
    expect(history).toEqual(before);
  });
});
