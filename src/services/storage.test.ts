import { describe, it, expect } from "vitest";
import {
  createSavedGame,
  generateDemoPresets,
} from "../engine/simulationEngine";
import { loadGame, saveGame, saveKey } from "./storage";
const memory = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
  };
};
describe("save envelope", () => {
  it("separates full/demo and rejects stale tab revisions", () => {
    const storage = memory();
    const full = createSavedGame("full");
    expect(saveGame(full, null, storage).kind).toBe("saved");
    expect(loadGame("demo", storage).kind).toBe("empty");
    expect(saveGame({ ...full, revision: 1 }, 0, storage).kind).toBe("saved");
    expect(saveGame({ ...full, revision: 2 }, 0, storage).kind).toBe(
      "conflict",
    );
    expect(loadGame("full", storage).kind).toBe("ready");
  });
  it("roundtrips engine-derived presets and rejects tampered history", () => {
    const storage = memory();
    const game = generateDemoPresets()[8];
    expect(saveGame(game, null, storage).kind).toBe("saved");
    expect(loadGame("demo", storage).kind).toBe("ready");
    game.history[0].result.closingBusinessCashRp += 10;
    storage.setItem(saveKey("demo"), JSON.stringify(game));
    expect(loadGame("demo", storage).kind).toBe("invalid");
  });
  it("survives corrupt JSON and browser-denied storage", () => {
    const storage = memory();
    storage.setItem(saveKey("full"), "{broken");
    expect(loadGame("full", storage).kind).toBe("invalid");
    const denied = {
      getItem: () => {
        throw Error("denied");
      },
      setItem: () => {
        throw Error("denied");
      },
    };
    expect(loadGame("full", denied).kind).toBe("unavailable");
    expect(saveGame(createSavedGame("full"), null, denied).kind).toBe(
      "unavailable",
    );
  });
});
