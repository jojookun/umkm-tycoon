import {
  baselineDecision,
  continueToDecision,
  simulateWeek,
} from "./simulationEngine";
import type { SavedGame, SimulationValidationError, WeekNumber } from "./types";

export function advanceAfterDebrief(current: SavedGame): {
  game: SavedGame;
  failure?: { week: WeekNumber; error: SimulationValidationError };
} {
  let next: SavedGame = {
    ...structuredClone(current),
    state: continueToDecision(current.state),
    revision: current.revision + 1,
  };
  if (current.mode === "demo" && next.state.currentWeek < 13) {
    const stop =
      ([1, 4, 8, 12] as const).find((w) => w >= next.state.currentWeek) ?? 12;
    while (next.state.currentWeek < stop) {
      const week = next.state.currentWeek as WeekNumber;
      const result = simulateWeek(next.state, baselineDecision(next.state));
      if (!result.ok)
        return { game: next, failure: { week, error: result.error } };
      next = {
        ...next,
        state: continueToDecision(result.nextState),
        history: [...next.history, result.snapshot],
      };
    }
  }
  return { game: next };
}
