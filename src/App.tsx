import { useEffect, useRef, useState } from "react";
import { Logo } from "./components/Logo";
import { Modal } from "./components/Modal";
import { Assessment } from "./components/Assessment";
import {
  Debrief,
  DecisionControls,
  GlossaryPanel,
  HppPanel,
  LoanPanel,
  Report,
  Wallets,
} from "./components/GamePanels";
import {
  applyReplay,
  createSavedGame,
  defaultDecision,
  generateDemoPresets,
  money,
  outstandingDebt,
  runResilienceReplay,
  simulateWeek,
} from "./engine/simulationEngine";
import { loadGame, saveGame, saveKey } from "./services/storage";
import { assetUrl } from "./services/assets";
import { advanceAfterDebrief } from "./engine/sessionFlow";
import type {
  AssessmentResponse,
  ReplayBranch,
  SavedGame,
  SimulationValidationError,
  WeekDecision,
  WeekNumber,
} from "./engine/types";

type Page = "landing" | "pre" | "post" | "onboarding" | "demo" | "game";
type Dialog =
  | "hpp"
  | "loan"
  | "glossary"
  | "reset"
  | "history"
  | "replay"
  | "apply-replay"
  | null;
function download(name: string, text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
export default function App() {
  const finalDebrief = useRef<HTMLDetailsElement>(null);
  const [page, setPage] = useState<Page>("landing");
  const [game, setGame] = useState<SavedGame | null>(null);
  const gameRef = useRef(game);
  const revision = useRef<number | null>(null);
  const [decision, setDecision] = useState<WeekDecision | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [warning, setWarning] = useState("");
  const [conflict, setConflict] = useState(false);
  const [invalid, setInvalid] = useState<{
    raw: string;
    mode: SavedGame["mode"];
  } | null>(null);
  const [validation, setValidation] =
    useState<SimulationValidationError | null>(null);
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const [replayDecision, setReplayDecision] = useState<WeekDecision | null>(
    null,
  );
  const [replayThrough, setReplayThrough] = useState<WeekNumber>(1);
  const [branch, setBranch] = useState<ReplayBranch | null>(null);
  const [replayError, setReplayError] = useState("");
  const [existing, setExisting] = useState(false);
  useEffect(() => {
    setExisting(loadGame("full").kind === "ready");
  }, []);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      const active = gameRef.current;
      if (active && e.key === saveKey(active.mode)) {
        setConflict(true);
        setWarning(
          "Simpanan berubah di tab lain. Muat ulang simpanan sebelum melanjutkan.",
        );
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page, game?.state.currentWeek, game?.state.phase]);

  function install(next: SavedGame) {
    gameRef.current = next;
    setGame(next);
    if (next.mode === "full") setExisting(true);
    setDecision(defaultDecision(next.state));
    setValidation(null);
  }
  function commit(next: SavedGame, overwrite = false): boolean {
    if (conflict && !overwrite) return false;
    const saved = saveGame(next, overwrite ? null : revision.current);
    if (saved.kind === "conflict") {
      setConflict(true);
      setWarning(
        "Simpanan berubah di tab lain. Ekspor sesi ini atau muat simpanan terbaru.",
      );
      return false;
    }
    if (saved.kind === "invalid") {
      setWarning("Sesi gagal diverifikasi. Perubahan tidak disimpan.");
      return false;
    }
    if (saved.kind === "saved") {
      revision.current = next.revision;
      setWarning("");
    } else
      setWarning(
        "Progres belum tersimpan. Sesi tetap berjalan di perangkat ini.",
      );
    install(next);
    return true;
  }
  function start(mode: SavedGame["mode"]) {
    const loaded = loadGame(mode);
    if (loaded.kind === "invalid") {
      setInvalid({ raw: loaded.raw, mode });
      return;
    }
    if (loaded.kind === "ready") {
      revision.current = loaded.game.revision;
      install(loaded.game);
      setConflict(false);
      setWarning("");
      setPage("game");
      return;
    }
    const fresh = createSavedGame(mode);
    revision.current = null;
    if (commit(fresh, true)) setPage(mode === "full" ? "pre" : "demo");
  }
  function newSession(mode: SavedGame["mode"]) {
    setConflict(false);
    const fresh = createSavedGame(mode);
    revision.current = null;
    if (commit(fresh, true)) {
      setDialog(null);
      setInvalid(null);
      setPage(mode === "full" ? "pre" : "demo");
    }
  }
  function openReplay(week: WeekNumber) {
    if (!game) return;
    const snapshot = game.history.find((h) => h.week === week);
    if (!snapshot) return;
    setReplayDecision(structuredClone(snapshot.decision));
    setReplayThrough(week);
    setBranch(null);
    setReplayError("");
    setDialog("replay");
  }
  function execute() {
    const current = gameRef.current;
    if (
      !current ||
      !decision ||
      running.current ||
      current.state.phase !== "decision" ||
      conflict
    )
      return;
    running.current = true;
    setBusy(true);
    try {
      const r = simulateWeek(current.state, decision);
      if (!r.ok) {
        setValidation(r.error);
        return;
      }
      commit({
        ...current,
        state: r.nextState,
        history: [...current.history, r.snapshot],
        lastReplayBranch: null,
        revision: current.revision + 1,
      });
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  function nextWeek() {
    const current = gameRef.current;
    if (!current) return;
    if (current.state.currentWeek === 13) {
      setPage(
        current.mode === "full" && current.postTestResponses.length < 5
          ? "post"
          : "game",
      );
      return;
    }
    const advanced = advanceAfterDebrief(current);
    if (commit(advanced.game) && advanced.failure)
      setValidation({
        ...advanced.failure.error,
        message: `Demo berhenti di Minggu ${advanced.failure.week}. ${advanced.failure.error.message} Sesuaikan keputusan minggu ini untuk melanjutkan.`,
      });
  }
  function answer(phase: "pre" | "post", response: AssessmentResponse) {
    const current = gameRef.current;
    if (!current) return;
    const field = phase === "pre" ? "preTestResponses" : "postTestResponses";
    if (current[field].some((r) => r.questionId === response.questionId))
      return;
    commit({
      ...current,
      [field]: [...current[field], response],
      revision: current.revision + 1,
    });
  }
  const state = game?.state;
  const latest = game?.history.at(-1);
  const replayBefore = game?.history.find(
    (h) => h.week === replayDecision?.week,
  )?.before;
  const [loanContext, setLoanContext] = useState<"main" | "replay">("main");
  const [returnToReplay, setReturnToReplay] = useState(false);
  const openLoan = (context: "main" | "replay") => {
    setLoanContext(context);
    setDialog("loan");
  };
  const openHpp = (fromReplay = false) => {
    setReturnToReplay(fromReplay);
    setDialog("hpp");
  };
  const closeDialog = () => {
    if (
      (dialog === "loan" && loanContext === "replay") ||
      (dialog === "hpp" && returnToReplay)
    )
      setDialog("replay");
    else setDialog(null);
  };

  return (
    <>
      <a href="#main" className="skip-link">
        Lewati ke konten
      </a>
      <div className="app-shell">
        <header className="app-header">
          <button
            className="brand-button"
            onClick={() => setPage("landing")}
            aria-label="Ke halaman awal"
          >
            <Logo />
          </button>
          {state && page === "game" && (
            <p className="session-title">
              Dapur Sari ·{" "}
              {state.phase === "finished"
                ? "Sesi selesai"
                : state.phase === "debrief"
                  ? `Hasil Minggu ${state.currentWeek - 1}`
                  : `Minggu ${state.currentWeek} dari 12`}
            </p>
          )}
          <nav aria-label="Navigasi utama">
            {game?.mode === "demo" && (
              <button className="demo-tag" onClick={() => setPage("demo")}>
                Mode Demo Juri<span>M1 → M4 → M8 → M12</span>
              </button>
            )}
            <button
              className="text-button"
              onClick={() => setDialog("glossary")}
            >
              Kamus warung
            </button>
            {game && game.history.length > 0 && (
              <button
                className="text-button"
                onClick={() => setDialog("history")}
              >
                Riwayat & Replay
              </button>
            )}
            {game && (
              <button
                className="text-button"
                onClick={() =>
                  download(
                    "tahan-banting-session.json",
                    JSON.stringify(game, null, 2),
                  )
                }
              >
                Ekspor sesi
              </button>
            )}
          </nav>
        </header>
        {warning && (
          <div className="notice warning save-banner" role="status">
            <span>{warning}</span>
            {game && (
              <button
                className="secondary"
                onClick={() => {
                  if (conflict) start(game.mode);
                  else commit({ ...game, revision: game.revision + 1 });
                }}
              >
                {conflict ? "Muat simpanan terbaru" : "Coba simpan lagi"}
              </button>
            )}
          </div>
        )}
        <main id="main">
          {page === "landing" && (
            <section className="landing">
              <div className="landing-copy">
                <Logo full />
                <p className="eyebrow">Simulasi warung · 12 minggu</p>
                <h1>
                  Warung ramai.
                  <br />
                  Kas tetap aman?
                </h1>
                <p>
                  Jalankan Dapur Sari. Atur harga, stok, dan uang usaha. Hadapi
                  kejutan, lihat akibat keputusanmu, lalu coba cara lain.
                </p>
                <div className="landing-actions">
                  <button className="primary" onClick={() => start("full")}>
                    {existing ? "Lanjutkan Permainan" : "Mulai Permainan"}
                  </button>
                  <button className="secondary" onClick={() => setPage("demo")}>
                    Mode Demo Juri
                  </button>
                </div>
                <p className="caption">
                  Bermain tanpa akun dan tanpa uang nyata. Progres disimpan di
                  browser ini.
                </p>
              </div>
              <div className="landing-art">
                <img
                  src={assetUrl("art/stage-neutral.png")}
                  width="1520"
                  height="560"
                  alt="Sari dan Deden siap membuka Dapur Sari"
                />
                <div className="landing-note">
                  <strong>Satu keputusan, beberapa konsekuensi.</strong>
                  <p>
                    Penjualan, kas, pelanggan, dan kondisi pekerja saling
                    berkaitan.
                  </p>
                </div>
              </div>
            </section>
          )}
          {page === "demo" && (
            <section className="narrow">
              <h1>Mode Demo Juri</h1>
              <p>
                Jelajahi empat titik keputusan dalam aplikasi yang sama. Setiap
                titik dimulai dari hasil engine jalur seimbang; simpanan
                permainan penuh tetap terpisah.
              </p>
              <div className="demo-stops">
                {([1, 4, 8, 12] as const).map((w, i) => (
                  <button
                    className="panel demo-stop"
                    key={w}
                    onClick={() => {
                      const preset = generateDemoPresets()[w];
                      const loaded = loadGame("demo");
                      revision.current =
                        loaded.kind === "ready" ? loaded.game.revision : null;
                      setConflict(false);
                      if (
                        commit(
                          { ...preset, revision: (revision.current ?? 0) + 1 },
                          true,
                        )
                      )
                        setPage("game");
                    }}
                  >
                    <span className="week-number">M{w}</span>
                    <span>
                      <strong>
                        {
                          [
                            "Pisahkan kas",
                            "Buka QRIS",
                            "Hadapi kulkas rusak",
                            "Ujian akhir",
                          ][i]
                        }
                      </strong>
                      <span className="choice-description">
                        Mulai dari Minggu {w}
                      </span>
                    </span>
                    <span aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
              <button className="text-button" onClick={() => start("demo")}>
                Lanjutkan sesi demo tersimpan
              </button>
              <p className="caption">
                Minggu di antara checkpoint dijalankan dengan keputusan seimbang
                setelah kamu melihat debrief.
              </p>
            </section>
          )}
          {game && (page === "pre" || page === "post") && (
            <Assessment
              phase={page}
              responses={
                page === "pre" ? game.preTestResponses : game.postTestResponses
              }
              onAnswer={(r) => answer(page, r)}
              onDone={() => setPage(page === "pre" ? "onboarding" : "game")}
            />
          )}
          {page === "onboarding" && game && (
            <section className="panel narrow onboarding">
              <h1>Kenali uang Dapur Sari</h1>
              <p>
                Modal awal {money(2000000)} sudah dibagi ke dua dompet.
                Pemisahan ini tidak mengurangi uang lagi.
              </p>
              <dl className="ledger">
                <div>
                  <dt>Kas usaha</dt>
                  <dd>{money(1600000)}</dd>
                </div>
                <div>
                  <dt>Uang pribadi</dt>
                  <dd>{money(400000)}</dd>
                </div>
                <div>
                  <dt>Cadangan awal</dt>
                  <dd>{money(0)}</dd>
                </div>
              </dl>
              <ol>
                <li>Baca kejadian dan pilih respons.</li>
                <li>Atur stok, harga, kanal, dan dompet.</li>
                <li>Jalankan minggu, periksa arus kas, lalu coba replay.</li>
              </ol>
              <p>
                Kamu bisa bertahan lewat beberapa strategi. Kas besar bukan
                satu-satunya ukuran: pelanggan dan kondisi pekerja juga
                diperhitungkan.
              </p>
              <button className="primary full" onClick={() => setPage("game")}>
                Buka Warung · Minggu 1
              </button>
            </section>
          )}
          {page === "game" && game && state && decision && (
            <>
              {state.phase === "decision" ? (
                <div className="game-layout">
                  <Wallets state={state} decision={decision} />
                  <div className="decision-column">
                    <DecisionControls
                      state={state}
                      decision={decision}
                      onChange={(d) => {
                        setDecision(d);
                        setValidation(null);
                      }}
                      onHpp={() => openHpp()}
                      onLoan={() => openLoan("main")}
                    />
                    <div className="run-footer">
                      <button
                        className="primary full"
                        disabled={busy || conflict}
                        onClick={execute}
                      >
                        {busy
                          ? "Memproses minggu…"
                          : `Jalankan Minggu Ini (M${state.currentWeek})`}
                      </button>
                    </div>
                  </div>
                </div>
              ) : state.phase === "debrief" && latest ? (
                <div className="game-layout">
                  <Wallets state={state} />
                  <Debrief
                    snapshot={latest}
                    onNext={nextWeek}
                    onReplay={() => openReplay(latest.week)}
                    nextLabel={
                      game.mode === "demo"
                        ? `Lanjut Demo ke Minggu ${([1, 4, 8, 12] as const).find((w) => w >= state.currentWeek) ?? 12}`
                        : undefined
                    }
                  />
                </div>
              ) : (
                <>
                  <Report
                    game={game}
                    onHistory={() => setDialog("history")}
                    onReset={() => setDialog("reset")}
                    onPost={() => setPage("post")}
                  />
                  {latest && (
                    <details className="panel final-debrief" ref={finalDebrief}>
                      <summary>Lihat arus kas Minggu 12</summary>
                      <Debrief
                        snapshot={latest}
                        nextLabel="Kembali ke rapor"
                        onNext={() => {
                          if (finalDebrief.current)
                            finalDebrief.current.open = false;
                          document.getElementById("report-title")?.focus();
                          window.scrollTo({ top: 0 });
                        }}
                        onReplay={() => openReplay(latest.week)}
                      />
                    </details>
                  )}
                </>
              )}
            </>
          )}
        </main>
        <footer className="site-footer">
          <span>Tahan Banting · Dapur Sari</span>
          <span>Simulasi pembelajaran, bukan layanan keuangan.</span>
        </footer>
      </div>
      {invalid && (
        <Modal
          title="Simpanan belum bisa dibuka"
          onClose={() => setInvalid(null)}
        >
          <p>
            Data rusak atau memakai versi berbeda. Simpanan lama belum diubah.
            Ekspor dahulu jika ingin menyimpannya.
          </p>
          <button
            className="secondary full"
            onClick={() =>
              download("tahan-banting-save-original.json", invalid.raw)
            }
          >
            Ekspor simpanan asli
          </button>
          <button
            className="primary full"
            onClick={() => newSession(invalid.mode)}
          >
            Hapus simpanan ini dan mulai baru
          </button>
        </Modal>
      )}
      {validation && (
        <Modal
          title="Pilihan perlu disesuaikan"
          onClose={() => setValidation(null)}
        >
          <div className="notice danger" role="alert">
            <p>{validation.message}</p>
            {validation.shortfallRp !== undefined && (
              <strong>Kekurangan {money(validation.shortfallRp)}</strong>
            )}
          </div>
          <p>
            Belum ada transaksi yang diterapkan. Periksa target stok, biaya
            servis, dan pilihan pembiayaan yang tersedia. Persediaan lama juga
            memengaruhi kebutuhan bahan baru.
          </p>
          {game && game.history.length > 0 && (
            <button
              className="secondary full"
              onClick={() => {
                setValidation(null);
                setDialog("history");
              }}
            >
              Coba minggu sebelumnya (Replay)
            </button>
          )}
          <button className="primary full" onClick={() => setValidation(null)}>
            Kembali ke keputusan
          </button>
        </Modal>
      )}
      {dialog === "glossary" && (
        <Modal title="Kamus warung" onClose={closeDialog}>
          <GlossaryPanel />
        </Modal>
      )}
      {dialog === "hpp" && state && decision && (
        <Modal title="Biaya Sebenarnya (HPP)" onClose={closeDialog}>
          <HppPanel
            state={returnToReplay && replayBefore ? replayBefore : state}
            decision={
              returnToReplay && replayDecision ? replayDecision : decision
            }
          />
          <button className="primary full" onClick={closeDialog}>
            Tutup Rincian HPP
          </button>
        </Modal>
      )}
      {dialog === "loan" && decision && (
        <Modal title="Bandingkan pembiayaan" onClose={closeDialog}>
          <LoanPanel
            week={
              loanContext === "replay" && replayDecision
                ? replayDecision.week
                : decision.week
            }
            selected={
              loanContext === "replay"
                ? replayDecision?.loanType
                : decision.loanType
            }
            onSelect={(loanType) => {
              if (loanContext === "replay" && replayDecision) {
                setReplayDecision({ ...replayDecision, loanType });
                setBranch(null);
                setDialog("replay");
              } else {
                setDecision({ ...decision, loanType });
                setDialog(null);
              }
            }}
          />
          <button className="text-button" onClick={closeDialog}>
            Batal
          </button>
        </Modal>
      )}
      {dialog === "reset" && game && (
        <Modal title="Mulai sesi baru?" onClose={closeDialog}>
          <p>
            Simpanan mode {game.mode === "demo" ? "demo" : "penuh"} akan
            diganti. Ekspor sesi dahulu jika ingin menyimpannya.
          </p>
          <button
            className="secondary full"
            onClick={() =>
              download(
                "tahan-banting-before-reset.json",
                JSON.stringify(game, null, 2),
              )
            }
          >
            Ekspor sesi
          </button>
          <button
            className="primary full"
            onClick={() => newSession(game.mode)}
          >
            Ya, mulai lagi
          </button>
          <button className="text-button" onClick={closeDialog}>
            Batal
          </button>
        </Modal>
      )}
      {dialog === "history" && game && (
        <Modal title="Tinjau keputusan" onClose={closeDialog}>
          <p>
            Pilih minggu untuk mencoba keputusan lain. Hasil utama tetap
            disimpan sampai kamu mengonfirmasi cabang baru.
          </p>
          {game.history.map((h) => (
            <button
              className="history-row"
              key={h.week}
              onClick={() => openReplay(h.week)}
            >
              <strong>
                Minggu {h.week} · Pilihan {h.decision.scenarioChoiceKey}
              </strong>
              <span>Kas akhir {money(h.after.businessCashRp)} ›</span>
            </button>
          ))}
        </Modal>
      )}
      {dialog === "replay" && game && replayDecision && replayBefore && (
        <Modal
          title={`Replay Minggu ${replayDecision.week}`}
          onClose={closeDialog}
        >
          <p>Cabang percobaan. Simpanan utama belum berubah.</p>
          <DecisionControls
            state={replayBefore}
            decision={replayDecision}
            onChange={(d) => {
              setReplayDecision(d);
              setBranch(null);
              setReplayError("");
            }}
            onHpp={() => openHpp(true)}
            onLoan={() => openLoan("replay")}
          />
          <label className="through-select">
            Hitung ulang sampai
            <select
              value={replayThrough}
              onChange={(e) => {
                setReplayThrough(Number(e.target.value) as WeekNumber);
                setBranch(null);
              }}
            >
              {game.history
                .filter((h) => h.week >= replayDecision.week)
                .map((h) => (
                  <option key={h.week} value={h.week}>
                    Minggu {h.week}
                  </option>
                ))}
            </select>
          </label>
          <button
            className="primary full"
            onClick={() => {
              const result = runResilienceReplay(
                game.history,
                replayDecision,
                replayThrough,
              );
              if (result.ok) {
                setBranch(result.branch);
                setReplayError("");
              } else {
                setBranch(null);
                setReplayError(
                  `Minggu ${result.failedWeek}: ${result.error.message}`,
                );
              }
            }}
          >
            Hitung Simulasi Alternatif
          </button>
          {replayError && (
            <div className="notice danger" role="alert">
              {replayError} Simpanan utama tetap sama.
            </div>
          )}
          {branch && (
            <section className="notice success">
              <h3>Perbandingan Dampak Keuangan</h3>
              <p>
                Kas alternatif: {money(branch.alternativeAfter.businessCashRp)}.
              </p>
              <p>
                Cadangan: {money(branch.alternativeAfter.emergencyFundRp)}. Sisa
                kewajiban: {money(outstandingDebt(branch.alternativeAfter))}.
              </p>
              <p>
                Selisih kas terhadap hasil utama M{branch.throughWeek}:{" "}
                {money(branch.deltas.businessCashDeltaRp)}.
              </p>
              <p>
                Kepercayaan {branch.alternativeAfter.trustScore}/100 · Kondisi
                pekerja {branch.alternativeAfter.wellbeingScore}/100.
              </p>
              <button
                className="primary full"
                onClick={() => setDialog("apply-replay")}
              >
                Gunakan Keputusan Ini
              </button>
            </section>
          )}
        </Modal>
      )}
      {dialog === "apply-replay" && game && branch && (
        <Modal
          title="Terapkan hasil replay?"
          onClose={() => setDialog("replay")}
        >
          <p>
            Hasil mulai Minggu {branch.fromWeek} sampai {branch.throughWeek}{" "}
            akan diganti dengan perhitungan cabang. Progres setelah Minggu{" "}
            {branch.throughWeek} akan dibuang. Jawaban post-test direset agar
            sesuai sesi baru.
          </p>
          <p>Ekspor baseline tersedia sebelum menerapkan perubahan.</p>
          <button
            className="secondary full"
            onClick={() =>
              download(
                "tahan-banting-baseline.json",
                JSON.stringify(game, null, 2),
              )
            }
          >
            Ekspor baseline
          </button>
          <button
            className="primary full"
            onClick={() => {
              if (commit(applyReplay(game, branch))) {
                setDialog(null);
                setPage("game");
              }
            }}
          >
            Ya, Terapkan Cabang
          </button>
          <button className="text-button" onClick={() => setDialog("replay")}>
            Batal
          </button>
        </Modal>
      )}
    </>
  );
}
