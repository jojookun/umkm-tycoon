import { config, glossary } from "../data/content";
import { assetUrl } from "../services/assets";
import {
  getScenario,
  money,
  outstandingDebt,
  restartRequirement,
  stockTargets,
} from "../engine/simulationEngine";
import type {
  GameState,
  SavedGame,
  WeekDecision,
  WeekNumber,
  TurnSnapshot,
} from "../engine/types";
import { getCoachReflection } from "../services/aiCoach";
import { assessment } from "../data/content";
import { summarizeAssessment } from "../services/assessment";

interface DecisionProps {
  state: GameState;
  decision: WeekDecision;
  onChange: (d: WeekDecision) => void;
  onHpp: () => void;
  onLoan: () => void;
}
export function DecisionControls({
  state,
  decision: d,
  onChange,
  onHpp,
  onLoan,
}: DecisionProps) {
  const update = (patch: Partial<WeekDecision>) => onChange({ ...d, ...patch });
  const scenario = getScenario(d.week, d.loanType);
  const egg = d.week === 11 && d.scenarioChoiceKey === "B";
  const qrisAvailable =
    state.unlockedChannels.qris ||
    (d.week === 4 && d.scenarioChoiceKey === "A");
  const waAvailable =
    state.unlockedChannels.whatsapp ||
    (d.week === 5 && d.scenarioChoiceKey === "A");
  const choose = (key: WeekDecision["scenarioChoiceKey"]) =>
    update({
      scenarioChoiceKey: key,
      enableQris: state.unlockedChannels.qris
        ? d.enableQris
        : d.week === 4 && key === "A",
      enableWhatsapp: state.unlockedChannels.whatsapp
        ? d.enableWhatsapp
        : d.week === 5 && key === "A",
      acceptBeyondSafeCapacity: d.week === 10 && key === "C",
      enableBigPromo: d.week === 11 && key === "B" ? false : d.enableBigPromo,
    });
  return (
    <>
      <section className="panel shock-panel">
        <div className="shock-intro">
          <div className="stage-wrap">
            <img
              className="stage"
              src={assetUrl(
                `art/${d.week === 8 || state.brokenFridgeUnrepaired ? "stage-crisis" : "stage-neutral"}.png`,
              )}
              alt={
                d.week === 8
                  ? "Sari dan Deden menghadapi kulkas rusak di Dapur Sari"
                  : "Sari dan Deden di dapur warung"
              }
              width="760"
              height="280"
            />
            {state.unlockedChannels.qris && (
              <span className="qris-sign">QRIS ✓</span>
            )}
          </div>
          <div>
            <h1>{scenario.title}</h1>
            <p className="speaker">{names[scenario.featuredCharacterId]}</p>
            <p>{scenario.characterDialogue}</p>
            {d.week === 8 && (
              <strong className="accent">
                Servis {money(config.fridgeRepairCostRp)}
              </strong>
            )}
          </div>
        </div>
        <fieldset>
          <legend className="sr-only">Respons kejadian minggu {d.week}</legend>
          {scenario.choices.map((c) => (
            <label
              key={c.key}
              className={`choice ${d.scenarioChoiceKey === c.key ? "selected" : ""}`}
            >
              <input
                type="radio"
                name={`scenario-${d.week}`}
                checked={d.scenarioChoiceKey === c.key}
                onChange={() => choose(c.key)}
              />
              <span>
                <strong>
                  {c.key}. {c.label}
                </strong>
                <span className="choice-description">{c.description}</span>
              </span>
            </label>
          ))}
        </fieldset>
        {(d.week === 8 || d.week === 9) && d.scenarioChoiceKey === "B" && (
          <button className="secondary full" onClick={onLoan}>
            Bandingkan pembiayaan ·{" "}
            {config.loans[d.loanType ?? "formal_productive"].name}
          </button>
        )}
      </section>
      <section className="panel operations">
        <h2>Keputusan operasional</h2>
        <div className="operational-grid">
          <fieldset>
            <legend>Target stok (porsi)</legend>
            <div className="segments">
              {(
                Object.entries(stockTargets) as [
                  WeekDecision["targetStockOption"],
                  number,
                ][]
              ).map(([id, n]) => (
                <button
                  key={id}
                  className={d.targetStockOption === id ? "selected" : ""}
                  aria-pressed={d.targetStockOption === id}
                  onClick={() => update({ targetStockOption: id })}
                >
                  {n} porsi
                </button>
              ))}
            </div>
          </fieldset>
          {!egg ? (
            <fieldset>
              <legend>Harga per porsi</legend>
              <div className="segments price-segments">
                {([12000, 14000, 16000] as const).map((n) => (
                  <button
                    key={n}
                    aria-label={money(n)}
                    className={d.sellingPriceRp === n ? "selected" : ""}
                    aria-pressed={d.sellingPriceRp === n}
                    onClick={() => update({ sellingPriceRp: n })}
                  >
                    <span>Rp</span>
                    <span>{n.toLocaleString("id-ID")}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : (
            <p className="notice">
              Menu telur minggu ini: harga {money(11000)}, HPP {money(7500)}.
            </p>
          )}
        </div>
        <button className="hpp-link" onClick={onHpp}>
          <span>Lihat Biaya Sebenarnya (HPP)</span>
          <strong>
            {money(
              (egg ? 7500 : 10500 + (state.currentWeek >= 11 ? 1300 : 0)) -
                (!egg && d.targetStockOption === "high_145" ? 300 : 0),
            )}{" "}
            / porsi ›
          </strong>
        </button>
        <fieldset>
          <legend>Kanal penjualan</legend>
          <div className="channels">
            <label>
              <input
                type="checkbox"
                disabled={!qrisAvailable}
                checked={d.enableQris}
                onChange={(e) => update({ enableQris: e.target.checked })}
              />
              QRIS{!qrisAvailable ? " · belum aktif" : ""}
            </label>
            <label>
              <input
                type="checkbox"
                disabled={!waAvailable}
                checked={d.enableWhatsapp}
                onChange={(e) => update({ enableWhatsapp: e.target.checked })}
              />
              WA{!waAvailable ? " · belum aktif" : ""}
            </label>
            <label>
              <input
                type="checkbox"
                disabled={egg}
                checked={!egg && d.enableBigPromo}
                onChange={(e) => update({ enableBigPromo: e.target.checked })}
              />
              Promo
            </label>
          </div>
          {egg && (
            <p className="caption">
              Menu telur memakai harga tetap Rp11.000; promo potongan harga dan
              diskon grosir ayam tidak berlaku.
            </p>
          )}
          {!egg && d.enableBigPromo && (
            <p className="caption">
              Harga efektif reguler{" "}
              {money(egg ? 11000 : d.sellingPriceRp - 2000)} per porsi. Kanal
              memakai satu faktor tertinggi.
            </p>
          )}
        </fieldset>
        <details>
          <summary>Rincian operasional dan dompet</summary>
          <div className="detail-fields">
            <label>
              Ambil untuk pribadi
              <select
                value={d.ownerDrawRp}
                onChange={(e) =>
                  update({
                    ownerDrawRp: Number(
                      e.target.value,
                    ) as WeekDecision["ownerDrawRp"],
                  })
                }
              >
                {([0, 50000, 100000] as const).map((v) => (
                  <option value={v} key={v}>
                    {money(v)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sisihkan cadangan
              <select
                value={d.emergencyTransferRp}
                onChange={(e) =>
                  update({
                    emergencyTransferRp: Number(
                      e.target.value,
                    ) as WeekDecision["emergencyTransferRp"],
                  })
                }
              >
                {([0, 50000, 100000] as const).map((v) => (
                  <option value={v} key={v}>
                    {money(v)}
                  </option>
                ))}
              </select>
            </label>
            <label className="check-line">
              <input
                type="checkbox"
                checked={d.acceptBeyondSafeCapacity}
                disabled={d.week === 10 && d.scenarioChoiceKey === "B"}
                onChange={(e) =>
                  update({ acceptBeyondSafeCapacity: e.target.checked })
                }
              />
              Terima pesanan melebihi kapasitas aman (maksimal 160)
            </label>
            <p className="caption">
              Pesanan di atas kapasitas aman mengurangi kondisi pekerja 20 poin
              dan kepercayaan 10 poin. Stok tinggi saja tidak memicu penalti.
            </p>
          </div>
        </details>
      </section>
    </>
  );
}
export const names: Record<string, string> = {
  sari_pertiwi: "Sari Pertiwi",
  kang_deden: "Kang Deden · Juru Masak",
  dimas: "Dimas",
  haji_bambang: "Pak Haji Bambang",
  bu_ratna: "Bu Ratna",
  mbak_nisa: "Mbak Nisa",
  pak_rt_karso: "Pak RT Karso",
  mas_raka: "Mas Raka",
  si_cepat_cair: "Notifikasi pembiayaan",
};

export function Wallets({
  state: s,
  decision,
}: {
  state: GameState;
  decision?: WeekDecision;
}) {
  const selectedMenu =
    decision?.week === 11 && decision.scenarioChoiceKey === "B"
      ? "nasi_telur_krispi"
      : "nasi_ayam_lengkuas";
  const lots =
    s.inventoryLots
      .filter((l) => s.phase !== "decision" || l.menuId === selectedMenu)
      .reduce((n, l) => n + l.quantityMilliPortions, 0) / 1000;
  return (
    <aside className="sidebar">
      <section className="panel wallets">
        <h2>Kas Usaha</h2>
        <p className="cash" data-testid="business-cash">
          {money(s.businessCashRp)}
        </p>
        <dl>
          <div>
            <dt>Uang Pribadi</dt>
            <dd>{money(s.personalCashRp)}</dd>
          </div>
          <div>
            <dt>Cadangan Usaha</dt>
            <dd>{money(s.emergencyFundRp)}</dd>
          </div>
          <div>
            <dt>Sisa Kewajiban</dt>
            <dd>{money(outstandingDebt(s))}</dd>
          </div>
          {s.operatingArrearsRp > 0 && (
            <div>
              <dt>Tunggakan Operasional</dt>
              <dd className="danger-text">{money(s.operatingArrearsRp)}</dd>
            </div>
          )}
        </dl>
      </section>
      <section className="panel indicators">
        <h2>Kondisi usaha</h2>
        <dl>
          <div>
            <dt>Kepercayaan Pelanggan</dt>
            <dd>{s.trustScore} / 100</dd>
          </div>
          <div>
            <dt>Kondisi Pekerja</dt>
            <dd>{s.wellbeingScore} / 100</dd>
          </div>
          <div>
            <dt>
              {s.phase === "decision" ? "Persediaan awal" : "Persediaan dibawa"}
            </dt>
            <dd>{lots.toLocaleString("id-ID")} porsi</dd>
          </div>
          {s.phase === "decision" &&
            s.inventoryLots.some((l) => l.menuId !== selectedMenu) && (
              <div>
                <dt>Bahan menu lain (tidak dipakai)</dt>
                <dd>
                  {(
                    s.inventoryLots
                      .filter((l) => l.menuId !== selectedMenu)
                      .reduce((n, l) => n + l.quantityMilliPortions, 0) / 1000
                  ).toLocaleString("id-ID")}{" "}
                  porsi
                </dd>
              </div>
            )}
          {decision && (
            <div>
              <dt>Target stok</dt>
              <dd>{stockTargets[decision.targetStockOption]} porsi</dd>
            </div>
          )}
        </dl>
      </section>
      <div className="caption desktop-note">
        Sisa bahan pada game adalah penyederhanaan persediaan, bukan panduan
        penyimpanan makanan nyata.
      </div>
    </aside>
  );
}

export function HppPanel({
  state,
  decision,
}: {
  state: GameState;
  decision: WeekDecision;
}) {
  const egg = decision.week === 11 && decision.scenarioChoiceKey === "B";
  const raw = egg
    ? 4200
    : 7200 +
      (state.rawMaterialInflationActive || decision.week >= 11 ? 1300 : 0);
  const discount = !egg && decision.targetStockOption === "high_145" ? 300 : 0;
  const hpp = raw - discount + 3300;
  const price = egg
    ? 11000
    : decision.sellingPriceRp - (decision.enableBigPromo ? 2000 : 0);
  return (
    <>
      <p>Menu aktif: {egg ? "Nasi Telur Krispi" : "Nasi Ayam Lengkuas"}</p>
      <dl className="ledger">
        <div>
          <dt>Bahan baku {discount ? "(diskon grosir)" : ""}</dt>
          <dd>{money(raw - discount)}</dd>
        </div>
        <div>
          <dt>Kemasan & pelengkap</dt>
          <dd>{money(1000)}</dd>
        </div>
        <div>
          <dt>Energi produksi</dt>
          <dd>{money(800)}</dd>
        </div>
        <div>
          <dt>Tenaga produksi langsung</dt>
          <dd>{money(1500)}</dd>
        </div>
        <div className="ledger-total">
          <dt>Total HPP variabel</dt>
          <dd>{money(hpp)}</dd>
        </div>
      </dl>
      <div className="notice">
        <strong>Biaya tetap {money(250000)} / minggu</strong>
        <p>
          Upah dasar {money(150000)} + utilitas dan kebersihan {money(100000)}.
          Terpisah dari biaya per porsi.
        </p>
      </div>
      <div className="notice success">
        <strong>Margin kotor pada harga {money(price)}</strong>
        <p>
          {money(price - hpp)} per porsi ·{" "}
          {Math.round(((price - hpp) / price) * 100)}%
        </p>
      </div>
      <p className="caption">
        Rincian ini untuk bahan baru. Bahan lama dipakai lebih dahulu dengan
        harga pembeliannya sendiri. Diskon Bu Ratna hanya berlaku untuk bagian
        katering yang ditangani Sari.
      </p>
    </>
  );
}

export function LoanPanel({
  week,
  selected,
  onSelect,
}: {
  week: WeekNumber;
  selected: WeekDecision["loanType"];
  onSelect: (v: NonNullable<WeekDecision["loanType"]>) => void;
}) {
  return (
    <>
      <p>
        Pilih produk setelah membaca total biaya. Ini pembiayaan fiktif untuk
        simulasi.
      </p>
      {Object.values(config.loans).map((p) => (
        <section
          className={`loan-option ${selected === p.id ? "selected" : ""}`}
          key={p.id}
        >
          <h3>{p.name}</h3>
          <dl>
            <div>
              <dt>Pokok</dt>
              <dd>{money(p.principalRp)}</dd>
            </div>
            <div>
              <dt>Biaya selama tenor</dt>
              <dd>{money(p.totalInterestOrFeeRp)}</dd>
            </div>
            <div>
              <dt>Total pembayaran</dt>
              <dd>{money(p.totalObligationRp)}</dd>
            </div>
            <div>
              <dt>4 cicilan mingguan</dt>
              <dd>{money(p.weeklyInstallmentRp)}</dd>
            </div>
          </dl>
          <p className="caption">
            Jatuh tempo M{week + 1}–M{week + 4}. Pokok sudah termasuk total
            pembayaran.
          </p>
          <button className="secondary full" onClick={() => onSelect(p.id)}>
            Pilih {p.name}
          </button>
        </section>
      ))}
      <p className="caption">
        Pencairan dilakukan saat menjalankan minggu, bukan saat membuka rincian
        ini. Hanya satu pinjaman aktif.
      </p>
    </>
  );
}

export function Debrief({
  snapshot: h,
  onNext,
  onReplay,
  nextLabel,
}: {
  snapshot: TurnSnapshot;
  onNext: () => void;
  onReplay: () => void;
  nextLabel?: string;
}) {
  const r = h.result;
  const oldArrearsPaid = Math.max(
    0,
    h.before.operatingArrearsRp +
      r.operatingArrearsAddedRp -
      h.after.operatingArrearsRp,
  );
  const lines: [string, number][] = [
    ["Penjualan", r.totalRevenueRp],
    ["Pencairan pinjaman", r.loanDisbursedRp],
    ["Transfer cadangan ke kas", Math.max(0, -r.emergencyTransferNetRp)],
    ["Pembelian bahan", -r.newMaterialPurchaseCostRp],
    ["Produksi non-bahan", -r.otherProductionCostRp],
    ["Biaya tetap mingguan", -r.fixedCostPaidRp],
    ["Servis / bantuan pekerja", -r.repairOrHelperCostRp],
    ["Tunggakan lama terbayar", -oldArrearsPaid],
    ["Pokok pinjaman terbayar", -r.loanPrincipalPaidRp],
    ["Biaya pinjaman terbayar", -r.loanInterestPaidRp],
    ["Penarikan pribadi", -r.ownerDrawPaidRp],
    ["Sisihkan cadangan", -Math.max(0, r.emergencyTransferNetRp)],
  ];
  const coach = getCoachReflection({
    turn: r.week,
    cash: r.closingBusinessCashRp,
    inventory_waste: r.wasteInventoryValueRp,
    price: r.effectiveSellingPriceRp,
    debt_payment: r.loanPrincipalPaidRp + r.loanInterestPaidRp,
    decision: h.decision.scenarioChoiceKey,
  });
  return (
    <div className="debrief">
      <section className="panel">
        <h1>Hasil Minggu {r.week}</h1>
        <p className="muted">Rekonsiliasi arus kas usaha</p>
        <dl className="ledger">
          <div>
            <dt>Kas awal</dt>
            <dd>{money(r.openingBusinessCashRp)}</dd>
          </div>
          {lines
            .filter(([, n]) => n !== 0)
            .map(([label, n]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd className={n > 0 ? "positive" : ""}>
                  {n > 0 ? "+" : "−"}
                  {money(Math.abs(n))}
                </dd>
              </div>
            ))}
          <div className="ledger-total">
            <dt>Kas akhir usaha</dt>
            <dd data-testid="closing-cash">{money(r.closingBusinessCashRp)}</dd>
          </div>
        </dl>
        {r.cateringDpReceivedRp > 0 && (
          <p className="caption">
            DP {money(r.cateringDpReceivedRp)} sudah termasuk pendapatan
            katering, bukan penjualan tambahan.
          </p>
        )}
      </section>
      <section className="panel summary-grid">
        <div>
          <h2>Penjualan</h2>
          <p>
            {r.regularPortionsSold} reguler + {r.cateringPortionsSold} katering
          </p>
          <p className="caption">
            Permintaan reguler: {r.regularDemandPortions} porsi. Produksi:{" "}
            {r.producedPortions} dari kapasitas aman {r.safeCapacityPortions}.
          </p>
        </div>
        <div>
          <h2>Bahan terbuang</h2>
          <p>{money(r.wasteInventoryValueRp)}</p>
          <p className="caption">
            {(r.wasteMilliPortions / 1000).toLocaleString("id-ID")} porsi
            terbuang;{" "}
            {(r.carryOverMilliPortions / 1000).toLocaleString("id-ID")} porsi
            dibawa ke minggu berikutnya.
          </p>
        </div>
      </section>
      <section className="panel coach">
        <div className="coach-heading">
          <img
            src={assetUrl("characters/character-mas_raka-neutral.png")}
            alt=""
            width="56"
            height="64"
          />
          <h2>Mas Raka · Refleksi keputusan</h2>
          <span className="caption">Penjelasan lokal</span>
        </div>
        <p>{r.causalDebriefText}</p>
        <p>{coach.message}</p>
      </section>
      {h.after.operatingArrearsRp > 0 && (
        <div className="notice warning" role="status">
          Tunggakan operasional {money(h.after.operatingArrearsRp)} masih perlu
          dibayar.
        </div>
      )}
      <div className="actions">
        <button className="primary" onClick={onNext}>
          {nextLabel ??
            (r.week === 12
              ? "Lihat rapor"
              : "Lanjut ke Minggu " + (r.week + 1))}
        </button>
        <button className="secondary" onClick={onReplay}>
          Coba Keputusan Lain (Replay)
        </button>
      </div>
    </div>
  );
}

export function Report({
  game,
  onHistory,
  onReset,
  onPost,
}: {
  game: SavedGame;
  onHistory: () => void;
  onReset: () => void;
  onPost: () => void;
}) {
  const s = game.state;
  const pre = summarizeAssessment(assessment.pre, game.preTestResponses),
    post = summarizeAssessment(assessment.post, game.postTestResponses);
  return (
    <section className="report">
      <h1 id="report-title" tabIndex={-1}>
        Rapor Minggu 12
      </h1>
      <p className="outcome">
        {s.outcome === "stable"
          ? "Stabil & Dipercaya"
          : s.outcome === "cash_exhausted"
            ? "Modal kerja berikutnya belum cukup"
            : "Bertahan, masih perlu penguatan"}
      </p>
      <div className="summary-grid">
        <div className="panel">
          <h2>Saldo akhir Dapur Sari</h2>
          <dl className="ledger">
            {[
              ["Kas Usaha", s.businessCashRp],
              ["Cadangan Usaha", s.emergencyFundRp],
              ["Uang Pribadi", s.personalCashRp],
              ["Sisa Kewajiban Utang", outstandingDebt(s)],
              ["Tunggakan Operasional", s.operatingArrearsRp],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{money(Number(value))}</dd>
              </div>
            ))}
          </dl>
          <p className="caption">
            Saldo kas bukan laba atau kekayaan bersih. Kebutuhan modal minimum
            berikutnya: {money(restartRequirement(s))}, termasuk cicilan M13
            jika ada.
          </p>
        </div>
        <div className="panel">
          <h2>Manusia dan pelanggan</h2>
          <dl className="ledger">
            <div>
              <dt>Kondisi Pekerja</dt>
              <dd>{s.wellbeingScore} / 100</dd>
            </div>
            <div>
              <dt>Kepercayaan Pelanggan</dt>
              <dd>{s.trustScore} / 100</dd>
            </div>
          </dl>
          <p>
            Keputusan mana yang menjaga kas? Apa yang ingin kamu ubah saat
            bermain lagi?
          </p>
        </div>
      </div>
      <section className="panel">
        <h2>Pre-test / post-test</h2>
        {game.mode === "demo" ? (
          <p>Mode demo tidak dicampur dengan pengukuran sesi penuh.</p>
        ) : (
          <>
            <div className="summary-grid">
              {[
                ["Sebelum bermain", pre],
                ["Setelah bermain", post],
              ].map(([label, summary]) => {
                const result = typeof summary === "object" ? summary : null;
                return (
                  <div key={String(label)}>
                    <h3>{String(label)}</h3>
                    {result ? (
                      <>
                        <p>Keputusan benar: {result.decisionScore}/100</p>
                        <p>Alasan benar: {result.reasonScore}/100</p>
                        <p className="caption">
                          Keyakinan 1/2/3: {result.confidence.join(" / ")}.
                          Median waktu aktif: {result.medianActiveSeconds}{" "}
                          detik.
                        </p>
                      </>
                    ) : (
                      <p>Belum diukur lengkap.</p>
                    )}
                  </div>
                );
              })}
            </div>
            {!post && (
              <button className="secondary" onClick={onPost}>
                Kerjakan post-test
              </button>
            )}
            <p className="caption">
              Skor latihan menggambarkan jawaban dalam sesi ini; bukan bukti
              peningkatan literasi yang telah divalidasi.
            </p>
          </>
        )}
      </section>
      <div className="actions">
        <button className="primary" onClick={onHistory}>
          Tinjau Keputusan
        </button>
        <button className="secondary" onClick={onReset}>
          Main Lagi
        </button>
      </div>
    </section>
  );
}
export function GlossaryPanel() {
  return (
    <dl className="glossary">
      {glossary.entries.map((e) => (
        <div key={e.id}>
          <dt>
            <strong>{e.plainTerm}</strong> · {e.formalTerm}
          </dt>
          <dd>
            {e.definition}
            <p className="caption">{e.example}</p>
          </dd>
        </div>
      ))}
    </dl>
  );
}
