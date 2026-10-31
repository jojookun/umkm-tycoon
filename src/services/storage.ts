import { scenarios, assessment } from "../data/content";
import { validateSavedGame, stateSchema } from "../engine/validation";
import {
  simulateWeek,
  initialState,
  continueToDecision,
} from "../engine/simulationEngine";
import type { SavedGame } from "../engine/types";

export const saveKey = (mode: SavedGame["mode"]) =>
  `tahan-banting:save:2.2:${mode}`;
type StorageLike = Pick<Storage, "getItem" | "setItem">;
export type LoadResult =
  | { kind: "empty" }
  | { kind: "ready"; game: SavedGame }
  | { kind: "invalid"; raw: string }
  | { kind: "unavailable" };
function consistent(game: SavedGame) {
  if (game.contentVersion !== scenarios.contentVersion) return false;
  const start = game.history[0]?.before ?? game.state;
  const sameState = (a: SavedGame["state"], b: SavedGame["state"]) =>
    JSON.stringify(stateSchema.parse(a)) ===
    JSON.stringify(stateSchema.parse(b));
  if (!sameState(start, initialState(game.mode === "demo", start.rngSeed)))
    return false;
  if (
    !(["pre", "post"] as const).every((phase) =>
      game[phase === "pre" ? "preTestResponses" : "postTestResponses"].every(
        (r) =>
          assessment[phase].some(
            (q) => q.id === r.questionId && q.pairId === r.pairId,
          ),
      ),
    )
  )
    return false;
  for (let i = 0; i < game.history.length; i++) {
    const h = game.history[i];
    const simulated = simulateWeek(h.before, h.decision, {
      drawnPoolEventIds: h.drawnPoolEventIds,
    });
    if (
      !simulated.ok ||
      JSON.stringify(simulated.nextState) !== JSON.stringify(h.after) ||
      JSON.stringify(simulated.weekResult) !== JSON.stringify(h.result)
    )
      return false;
    const next =
      i === game.history.length - 1 ? game.state : game.history[i + 1].before;
    if (
      !sameState(
        next.phase === "decision" ? continueToDecision(h.after) : h.after,
        next,
      )
    )
      return false;
  }
  return true;
}
export function loadGame(
  mode: SavedGame["mode"],
  storage?: StorageLike,
): LoadResult {
  let raw: string | null;
  try {
    storage ??= window.localStorage;
    raw = storage.getItem(saveKey(mode));
  } catch {
    return { kind: "unavailable" };
  }
  if (!raw) return { kind: "empty" };
  try {
    if (raw.length > 2_000_000) return { kind: "invalid", raw };
    const value: unknown = JSON.parse(raw);
    if (!validateSavedGame(value) || value.mode !== mode || !consistent(value))
      return { kind: "invalid", raw };
    return { kind: "ready", game: value };
  } catch {
    return { kind: "invalid", raw };
  }
}
export type SaveResult =
  | { kind: "saved" }
  | { kind: "unavailable" }
  | { kind: "conflict" }
  | { kind: "invalid" };
export function saveGame(
  game: SavedGame,
  expectedRevision: number | null,
  storage?: StorageLike,
): SaveResult {
  if (!validateSavedGame(game) || !consistent(game)) return { kind: "invalid" };
  try {
    storage ??= window.localStorage;
    const existing = storage.getItem(saveKey(game.mode));
    if (expectedRevision !== null && existing) {
      const parsed: unknown = JSON.parse(existing);
      if (!validateSavedGame(parsed) || parsed.revision !== expectedRevision)
        return { kind: "conflict" };
    }
    storage.setItem(saveKey(game.mode), JSON.stringify(game));
    return { kind: "saved" };
  } catch {
    return { kind: "unavailable" };
  }
}
