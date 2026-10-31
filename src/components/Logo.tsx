import { assetUrl } from "../services/assets";

export function Logo({ full = false }: { full?: boolean }) {
  return (
    <img
      className={full ? "logo logo-full" : "logo"}
      src={assetUrl(
        `brand/tahan-banting-${full ? "horizontal" : "compact"}.png`,
      )}
      alt="Tahan Banting — UMKM Tycoon"
      width={full ? 512 : 360}
      height={full ? 128 : 80}
    />
  );
}
