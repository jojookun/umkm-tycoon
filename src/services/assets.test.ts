import { afterEach, describe, expect, it, vi } from "vitest";
import { assetUrl } from "./assets";
afterEach(() => vi.unstubAllEnvs());
describe("deployment asset paths", () => {
  it("keeps local/root assets working", () => {
    vi.stubEnv("BASE_URL", "/");
    expect(assetUrl("art/stage-neutral.png")).toBe("/art/stage-neutral.png");
  });
  it("resolves logos and characters below the GitHub Pages project path", () => {
    vi.stubEnv("BASE_URL", "/umkm-tycoon/");
    expect(assetUrl("brand/tahan-banting-compact.png")).toBe(
      "/umkm-tycoon/brand/tahan-banting-compact.png",
    );
    expect(assetUrl("/characters/character-mas_raka-neutral.png")).toBe(
      "/umkm-tycoon/characters/character-mas_raka-neutral.png",
    );
  });
});
