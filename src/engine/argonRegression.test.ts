import { describe, expect, it } from "vitest";
import {
  initialState,
  baselineDecision,
  continueToDecision,
  createSavedGame,
  defaultDecision,
  simulateWeek,
  runResilienceReplay,
  applyReplay,
  generateDemoPresets,
} from "./simulationEngine";
import { advanceAfterDebrief } from "./sessionFlow";
import { validateSavedGame } from "./validation";
import { saveGame, loadGame, saveKey } from "../services/storage";
import type { SavedGame, WeekDecision } from "./types";

function turn(game: SavedGame, patch: Partial<WeekDecision> = {}) {
  const result = simulateWeek(game.state, {
    ...defaultDecision(game.state),
    ...patch,
  });
  if (!result.ok) throw new Error(result.error.message);
  return {
    ...game,
    state: result.nextState,
    history: [...game.history, result.snapshot],
    revision: game.revision + 1,
  };
}
const storage = () => {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
};

describe("Argon audit regression", () => {
  it.each([4, 5] as const)(
    "replays without unlocking the M%s channel through M12, preserving later unlocks",
    (from) => {
      let game = createSavedGame("full");
      for (let w = 1; w <= 12; w++) {
        game = turn(game, baselineDecision(game.state));
        if (w < 12) game = { ...game, state: continueToDecision(game.state) };
      }
      const original = structuredClone(game);
      const decision = {
        ...game.history[from - 1].decision,
        scenarioChoiceKey: "B" as const,
        ...(from === 4 ? { enableQris: false } : { enableWhatsapp: false }),
      };
      const result = runResilienceReplay(game.history, decision, 12);
      expect(result.ok).toBe(true);
      expect(game).toEqual(original);
      if (!result.ok) return;
      expect(result.branch.alternativeAfter.unlockedChannels).toEqual({
        cash: true,
        qris: from !== 4,
        whatsapp: from !== 5,
      });
      const applied = applyReplay(game, result.branch);
      expect(
        applied.history
          .slice(from)
          .every((h) =>
            from === 4 ? !h.decision.enableQris : !h.decision.enableWhatsapp,
          ),
      ).toBe(true);
      const memory = storage();
      expect(saveGame(applied, null, memory).kind).toBe("saved");
      expect(loadGame("full", memory).kind).toBe("ready");
    },
  );

  it("pauses a cash-poor demo at M5 decision instead of trapping the user in M4 debrief", () => {
    let game = turn(createSavedGame("demo"), {
      targetStockOption: "high_145",
      sellingPriceRp: 12000,
      ownerDrawRp: 100000,
      emergencyTransferRp: 100000,
    });
    expect(game.state.businessCashRp).toBe(1106500);
    game = advanceAfterDebrief(game).game;
    expect(game.state.currentWeek).toBe(4);
    expect(game.state.businessCashRp).toBe(1135500);
    game = turn(game, {
      scenarioChoiceKey: "B",
      enableQris: false,
      targetStockOption: "high_145",
      sellingPriceRp: 12000,
      enableBigPromo: true,
      acceptBeyondSafeCapacity: true,
      ownerDrawRp: 100000,
      emergencyTransferRp: 100000,
    });
    expect(game.state.businessCashRp).toBe(708250);
    const before = structuredClone(game);
    const next = advanceAfterDebrief(game);
    expect(game).toEqual(before);
    expect(next.failure).toMatchObject({
      week: 5,
      error: { code: "INSUFFICIENT_WORKING_CAPITAL", shortfallRp: 83750 },
    });
    expect(next.game.state).toMatchObject({
      currentWeek: 5,
      phase: "decision",
      businessCashRp: 708250,
    });
    expect(next.game.history).toHaveLength(4);
    const memory = storage();
    expect(saveGame(next.game, null, memory).kind).toBe("saved");
    const recovered = turn(next.game, { targetStockOption: "low_80" });
    expect(recovered.state.currentWeek).toBe(6);
    expect(recovered.state.businessCashRp).toBeGreaterThan(0);
  });

  it("preserves unrelated chicken stock during eggs and resets the menu before M12", () => {
    const before = {
      ...initialState(),
      currentWeek: 11 as const,
      inventoryLots: [
        {
          menuId: "nasi_ayam_lengkuas" as const,
          lotId: "old-chicken",
          createdWeek: 10 as const,
          quantityMilliPortions: 17500,
          unitMaterialCostRp: 7200,
        },
      ],
    };
    const result = simulateWeek(before, {
      ...defaultDecision(before),
      scenarioChoiceKey: "B",
      targetStockOption: "low_80",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.weekResult.newMaterialPurchaseCostRp).toBe(80 * 4200);
    expect(result.weekResult.carryOverMilliPortions).toBe(8750);
    const next = continueToDecision(result.nextState);
    expect(next.activeMenuId).toBe("nasi_ayam_lengkuas");
    const chicken = simulateWeek(next, {
      ...defaultDecision(next),
      targetStockOption: "low_80",
    });
    expect(chicken.ok).toBe(true);
    if (chicken.ok)
      expect(chicken.weekResult.newMaterialPurchaseCostRp).toBe(71250 * 8.5);
  });

  it("keeps egg material at Rp4.200 even at high stock and rejects promo atomically", () => {
    const state = {
      ...initialState(),
      currentWeek: 11 as const,
      unlockedChannels: { cash: true as const, qris: true, whatsapp: true },
    };
    const decision = {
      ...defaultDecision(state),
      scenarioChoiceKey: "B" as const,
      targetStockOption: "high_145" as const,
    };
    const result = simulateWeek(state, decision);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.weekResult.newMaterialPurchaseCostRp).toBe(145 * 4200);
      expect(result.weekResult.effectiveSellingPriceRp).toBe(11000);
      expect(result.weekResult.regularDemandPortions).toBe(122);
    }
    const before = structuredClone(state);
    const promo = simulateWeek(state, { ...decision, enableBigPromo: true });
    expect(promo.ok).toBe(false);
    if (!promo.ok) expect(promo.error.code).toBe("INVALID_DECISION");
    expect(state).toEqual(before);
  });

  it("rejects forged initial balances and channel unlocks, even with internally consistent later turns", () => {
    const memory = storage();
    for (const patch of [
      { businessCashRp: 500000000 },
      {
        unlockedChannels: { cash: true as const, qris: true, whatsapp: false },
      },
    ]) {
      let game = createSavedGame("full");
      game.state = { ...game.state, ...patch };
      memory.setItem(saveKey("full"), JSON.stringify(game));
      expect(loadGame("full", memory).kind).toBe("invalid");
      game = turn(game);
      memory.setItem(saveKey("full"), JSON.stringify(game));
      expect(loadGame("full", memory).kind).toBe("invalid");
    }
  });

  it("rejects replay metadata whose range, decision, or result week contradict each other", () => {
    let game = turn(generateDemoPresets()[8]);
    const replay = runResilienceReplay(game.history, {
      ...game.history[7].decision,
      scenarioChoiceKey: "C",
    });
    expect(replay.ok).toBe(true);
    if (!replay.ok) return;
    game = applyReplay(game, replay.branch);
    expect(validateSavedGame(game)).toBe(true);
    for (const patch of [
      { fromWeek: 9 },
      {
        alternativeDecision: { ...replay.branch.alternativeDecision, week: 7 },
      },
      { alternativeResult: { ...replay.branch.alternativeResult, week: 7 } },
    ]) {
      expect(
        validateSavedGame({
          ...game,
          lastReplayBranch: { ...replay.branch, ...patch },
        }),
      ).toBe(false);
    }
  });
});
