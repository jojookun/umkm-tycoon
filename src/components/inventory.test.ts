import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Wallets } from "./GamePanels";
import {
  initialState,
  defaultDecision,
  simulateWeek,
  continueToDecision,
} from "../engine/simulationEngine";

const stateWithChicken = () => ({
  ...initialState(),
  currentWeek: 11 as const,
  inventoryLots: [
    {
      menuId: "nasi_ayam_lengkuas" as const,
      lotId: "chicken",
      createdWeek: 10 as const,
      quantityMilliPortions: 17500,
      unitMaterialCostRp: 7200,
    },
  ],
});

describe("menu inventory presentation", () => {
  it("does not label chicken stock as available egg stock when the player changes the menu", () => {
    const state = stateWithChicken();
    const markup = renderToStaticMarkup(
      createElement(Wallets, {
        state,
        decision: { ...defaultDecision(state), scenarioChoiceKey: "B" },
      }),
    );
    expect(markup).toContain("Persediaan awal</dt><dd>0 porsi</dd>");
    expect(markup).toContain(
      "Bahan menu lain (tidak dipakai)</dt><dd>17,5 porsi</dd>",
    );
  });
  it("shows all carry-over during debrief and the usable chicken stock in M12", () => {
    const state = stateWithChicken();
    const result = simulateWeek(state, {
      ...defaultDecision(state),
      scenarioChoiceKey: "B",
      targetStockOption: "low_80",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const debrief = renderToStaticMarkup(
      createElement(Wallets, { state: result.nextState }),
    );
    expect(debrief).toContain("Persediaan dibawa</dt><dd>8,75 porsi</dd>");
    const next = continueToDecision(result.nextState);
    const markup = renderToStaticMarkup(
      createElement(Wallets, { state: next, decision: defaultDecision(next) }),
    );
    expect(markup).toContain("Persediaan awal</dt><dd>8,75 porsi</dd>");
  });
});
