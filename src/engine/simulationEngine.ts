import { config, scenarios } from "../data/content";
import { decisionSchema, stateSchema } from "./validation";
import { SCHEMA_VERSION } from "./types";
import type {
  GameState,
  InventoryLot,
  LoanProduct,
  PoolEvent,
  ReplayResult,
  SavedGame,
  SimulationResult,
  SimulationValidationError,
  TurnSnapshot,
  WeekDecision,
  WeekNumber,
  WeekResult,
} from "./types";

export { validateSavedGame } from "./validation";
export const stockTargets = {
  low_80: 80,
  medium_110: 110,
  high_145: 145,
} as const;
export const money = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
const clamp = (n: number) => Math.max(0, Math.min(100, n));
const round = (n: number) => Math.floor(n + 0.5);
export const inventoryValue = (lots: InventoryLot[]) =>
  lots.reduce(
    (s, l) =>
      s + round((l.quantityMilliPortions * l.unitMaterialCostRp) / 1000),
    0,
  );
export const outstandingDebt = (s: GameState) =>
  s.activeLoan?.schedule.reduce(
    (sum, i) => sum + i.totalRp - i.principalPaidRp - i.interestPaidRp,
    0,
  ) ?? 0;
export const outstandingPrincipal = (s: GameState) =>
  s.activeLoan?.schedule.reduce(
    (sum, i) => sum + i.principalRp - i.principalPaidRp,
    0,
  ) ?? 0;

export function initialState(
  isJudgeDemoMode = false,
  rngSeed = 20261031,
): GameState {
  return {
    schemaVersion: SCHEMA_VERSION,
    contentVersion: scenarios.contentVersion,
    phase: "decision",
    outcome: "in_progress",
    operatingArrearsRp: 0,
    activeMenuId: "nasi_ayam_lengkuas",
    currentWeek: 1,
    rngSeed: rngSeed >>> 0,
    isJudgeDemoMode,
    businessCashRp: config.initialBusinessCashRp,
    personalCashRp: config.initialPersonalCashRp,
    emergencyFundRp: 0,
    inventoryLots: [],
    activeLoan: null,
    trustScore: config.initialTrustScore,
    wellbeingScore: config.initialWellbeingScore,
    unlockedChannels: { cash: true, qris: false, whatsapp: false },
    brokenFridgeUnrepaired: false,
    rawMaterialInflationActive: false,
  };
}
export function createSavedGame(mode: "full" | "demo"): SavedGame {
  return {
    schemaVersion: SCHEMA_VERSION,
    contentVersion: scenarios.contentVersion,
    revision: 0,
    mode,
    state: initialState(mode === "demo"),
    history: [],
    lastReplayBranch: null,
    preTestResponses: [],
    postTestResponses: [],
  };
}
export function defaultDecision(state: GameState): WeekDecision {
  return {
    week: Math.min(state.currentWeek, 12) as WeekNumber,
    scenarioChoiceKey: state.currentWeek === 10 ? "B" : "A",
    targetStockOption: "medium_110",
    sellingPriceRp: 14000,
    enableQris: state.unlockedChannels.qris || state.currentWeek === 4,
    enableWhatsapp: state.unlockedChannels.whatsapp || state.currentWeek === 5,
    enableBigPromo: false,
    acceptBeyondSafeCapacity: false,
    ownerDrawRp: 0,
    emergencyTransferRp: 0,
  };
}
const error = (
  code: SimulationValidationError["code"],
  message: string,
  shortfallRp?: number,
): SimulationResult => ({
  ok: false,
  error: {
    code,
    message,
    ...(shortfallRp === undefined ? {} : { shortfallRp }),
    suggestedActions: [
      "Tinjau target stok dan biaya aksi.",
      "Pilih pembiayaan jika tersedia pada kejadian ini.",
      "Coba keputusan lain melalui replay.",
    ],
  },
});
function nextSeed(seed: number) {
  let x = seed || 1;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x >>> 0;
}
export interface SimulationOptions {
  enablePool?: boolean;
  drawnPoolEventIds?: string[];
}
export function getScenario(
  week: WeekNumber,
  loanType: LoanProduct["id"] = "formal_productive",
) {
  const scenario = structuredClone(scenarios.weeks[week - 1]);
  if (week === 8 || week === 9) {
    const action = scenario.choices[1].action;
    if (action.type === "TAKE_LOAN" || action.type === "FRIDGE_REPAIR")
      action.loanType = loanType;
  }
  return scenario;
}

export function simulateWeek(
  input: GameState,
  decision: WeekDecision,
  options: SimulationOptions = {},
): SimulationResult {
  if (
    input?.schemaVersion !== SCHEMA_VERSION ||
    input?.contentVersion !== scenarios.contentVersion
  )
    return error(
      "STATE_VERSION_MISMATCH",
      "Versi simpanan berbeda dengan aplikasi.",
    );
  if (!stateSchema.safeParse(input).success)
    return error("INVALID_STATE", "State permainan tidak valid.");
  if (input.phase === "finished" || input.currentWeek === 13)
    return error("GAME_FINISHED", "Sesi sudah selesai.");
  if (
    !decisionSchema.safeParse(decision).success ||
    decision.week !== input.currentWeek ||
    input.phase !== "decision"
  )
    return error(
      "INVALID_DECISION",
      "Keputusan sudah diproses atau tidak cocok dengan minggu aktif.",
    );
  const before = structuredClone(input);
  const s = structuredClone(input);
  const week = decision.week;
  const scenario = getScenario(week, decision.loanType);
  const choice = scenario.choices.find(
    (c) => c.key === decision.scenarioChoiceKey,
  )!;
  const action = choice.action;
  s.rngSeed = nextSeed(s.rngSeed);
  const eligible = scenarios.optionalPoolEvents.filter((e) =>
    e.eligibleWeeks.includes(week),
  );
  let pool: PoolEvent | undefined;
  if (options.drawnPoolEventIds) {
    if (
      options.drawnPoolEventIds.length > 1 ||
      options.drawnPoolEventIds.some((id) => !eligible.some((e) => e.id === id))
    )
      return error("INVALID_DECISION", "Event replay tidak valid.");
    pool = eligible.find((e) => e.id === options.drawnPoolEventIds![0]);
  } else if (
    options.enablePool &&
    !s.isJudgeDemoMode &&
    eligible.length &&
    s.rngSeed / 2 ** 32 < 0.25
  ) {
    pool = eligible[nextSeed(s.rngSeed) % eligible.length];
  }
  const replacement = pool?.replacesMainEvent;
  if (action.type === "UNLOCK_CHANNEL") {
    if (action.channel === "qris") s.unlockedChannels.qris = true;
    else s.unlockedChannels.whatsapp = true;
  }
  if (
    (decision.enableQris && !s.unlockedChannels.qris) ||
    (decision.enableWhatsapp && !s.unlockedChannels.whatsapp)
  )
    return error(
      "INVALID_CHANNEL_SELECTION",
      "Aktifkan kanal melalui keputusan kejadian terlebih dahulu.",
    );

  let repair = 0,
    emergencyUsed = 0,
    dp = 0,
    catering = 0,
    helper = 0,
    loanDisbursed = 0;
  let safeCapacity =
    pool?.capacityOverridePortions ?? config.normalCapacityPortions;
  let demandFactor = scenario.eventDemandFactorBps;
  let forceCap = false;
  s.activeMenuId =
    week === 11 &&
    action.type === "CONTEXTUAL_MENU_ADAPT" &&
    action.menuId === "nasi_telur_krispi"
      ? "nasi_telur_krispi"
      : "nasi_ayam_lengkuas";
  if (week >= 11) s.rawMaterialInflationActive = true;
  if (
    action.type === "CONTEXTUAL_MENU_ADAPT" &&
    action.menuId === "es_teh_wedang_jahe" &&
    week === 6
  )
    demandFactor = 8500;
  if (action.type === "CATERING_CONTRACT" && action.mode !== "decline") {
    catering = action.mode === "coop_ratna" ? 40 : 80;
    dp = catering * 7000;
  }
  if (week === 8 && !replacement) s.brokenFridgeUnrepaired = true;
  const requestsLoan =
    action.type === "TAKE_LOAN" ||
    (action.type === "FRIDGE_REPAIR" && action.mode === "take_loan");
  if (requestsLoan) {
    if (s.activeLoan && outstandingDebt(s) > 0)
      return error(
        "LOAN_ALREADY_ACTIVE",
        "Selesaikan pinjaman aktif sebelum mengambil pinjaman baru.",
      );
    if (week !== 8 && week !== 9)
      return error(
        "INVALID_DECISION",
        "Pembiayaan hanya tersedia pada minggu 8–9.",
      );
    const p =
      config.loans[decision.loanType ?? action.loanType ?? "formal_productive"];
    loanDisbursed = p.principalRp;
    s.activeLoan = {
      loanId: `loan-${week}-${p.id}`,
      productId: p.id,
      disbursedWeek: week,
      schedule: Array.from({ length: 4 }, (_, i) => ({
        dueWeek: (week + i + 1) as WeekNumber | 13,
        principalRp: p.weeklyPrincipalRp,
        interestRp: p.weeklyInterestRp,
        totalRp: p.weeklyInstallmentRp,
        principalPaidRp: 0,
        interestPaidRp: 0,
        paid: false,
      })),
      arrearsRp: 0,
    };
  }
  s.businessCashRp += dp + loanDisbursed;
  if (action.type === "FRIDGE_REPAIR" && action.mode !== "delay_repair") {
    repair = replacement
      ? (pool?.mitigationCostRp ?? 0)
      : config.fridgeRepairCostRp;
    if (action.mode === "use_emergency_and_cash")
      emergencyUsed = Math.min(s.emergencyFundRp, repair);
    if (replacement)
      safeCapacity =
        pool?.mitigatedCapacityPortions ?? config.normalCapacityPortions;
    else s.brokenFridgeUnrepaired = false;
  }
  if (action.type === "WORKER_CAPACITY_MODE") {
    forceCap = action.mode === "cap_orders";
    if (action.mode === "hire_part_time") {
      helper = pool?.mitigationCostRp ?? config.partTimeCostRp;
      safeCapacity =
        pool?.mitigatedCapacityPortions ?? config.overtimeCapacityPortions;
    }
  }
  s.emergencyFundRp -= emergencyUsed;
  s.businessCashRp += emergencyUsed;

  const target = Math.min(
    stockTargets[decision.targetStockOption],
    pool?.maxStockOverridePortions ?? 160,
  );
  const activeLots = s.inventoryLots.filter((l) => l.menuId === s.activeMenuId);
  const available = activeLots.reduce(
    (sum, l) => sum + l.quantityMilliPortions,
    0,
  );
  let purchaseMilli = Math.max(0, target * 1000 - available);
  const menu = config.menus[s.activeMenuId];
  const inflation =
    s.activeMenuId === "nasi_ayam_lengkuas" && s.rawMaterialInflationActive
      ? 1300
      : 0;
  const materialUnit =
    menu.rawMaterialCostRp +
    inflation -
    (s.activeMenuId === "nasi_ayam_lengkuas" &&
    decision.targetStockOption === "high_145"
      ? config.highStockDiscountPerPortionRp
      : 0);
  const newLots: InventoryLot[] = [];
  if (action.type === "CATERING_CONTRACT" && action.mode === "coop_ratna") {
    const coopMilli = Math.min(purchaseMilli, Math.max(0, 40000 - available));
    if (coopMilli > 0)
      newLots.push({
        menuId: s.activeMenuId,
        lotId: `w${week}-coop`,
        createdWeek: week,
        quantityMilliPortions: coopMilli,
        unitMaterialCostRp:
          menu.rawMaterialCostRp - config.coopDiscountPerPortionRp,
      });
    purchaseMilli -= coopMilli;
  }
  if (purchaseMilli > 0)
    newLots.push({
      menuId: s.activeMenuId,
      lotId: `w${week}-regular`,
      createdWeek: week,
      quantityMilliPortions: purchaseMilli,
      unitMaterialCostRp: materialUnit,
    });
  const purchase = inventoryValue(newLots);
  const upfront = purchase + repair + helper;
  if (s.businessCashRp < upfront)
    return error(
      "INSUFFICIENT_WORKING_CAPITAL",
      `Kas belum cukup untuk bahan dan aksi minggu ini. Kekurangan ${money(upfront - s.businessCashRp)}.`,
      upfront - s.businessCashRp,
    );
  s.businessCashRp -= upfront;
  s.inventoryLots.push(...newLots);

  if (s.activeMenuId === "nasi_telur_krispi" && decision.enableBigPromo)
    return error(
      "INVALID_DECISION",
      "Menu telur memakai harga tetap Rp11.000; nonaktifkan Promo untuk melanjutkan.",
    );
  const channel = decision.enableBigPromo
    ? config.channelFactorsBps.promoActive
    : decision.enableWhatsapp
      ? config.channelFactorsBps.waActive
      : decision.enableQris && !pool?.qrisOutage
        ? config.channelFactorsBps.qrisActive
        : config.channelFactorsBps.cashOnly;
  const priceFactor =
    s.activeMenuId === "nasi_telur_krispi"
      ? 10000
      : config.priceFactorsBps[decision.sellingPriceRp];
  const effectivePrice =
    s.activeMenuId === "nasi_telur_krispi"
      ? 11000
      : decision.sellingPriceRp -
        (decision.enableBigPromo ? config.promoPriceCutPerPortionRp : 0);
  const demand = round(
    config.baseDemandPortions *
      (priceFactor / 10000) *
      ((5000 + input.trustScore * 70) / 10000) *
      (channel / 10000) *
      (demandFactor / 10000) *
      ((pool?.demandMultiplierBps ?? 10000) / 10000),
  );
  const limit =
    !forceCap && decision.acceptBeyondSafeCapacity
      ? config.overtimeCapacityPortions
      : safeCapacity;
  if (catering > Math.min(target, limit))
    return error(
      "INVALID_DECISION",
      "Target stok atau kapasitas belum cukup untuk memenuhi kontrak katering.",
    );
  const regular = Math.min(
    demand,
    Math.max(0, Math.min(target, limit) - catering),
  );
  const sold = regular + catering;
  const revenue = regular * effectivePrice + catering * 14000;
  s.businessCashRp += revenue - dp;
  const other =
    sold *
    (menu.packagingCostRp + menu.utilityAllocationRp + menu.laborAllocationRp);
  const oldArrears = s.operatingArrearsRp;
  const pay = (due: number) => {
    const paid = Math.min(s.businessCashRp, due);
    s.businessCashRp -= paid;
    return paid;
  };
  const otherPaid = pay(other);
  const fixedPaid = pay(config.weeklyFixedCostRp);
  const arrearsAdded = other - otherPaid + config.weeklyFixedCostRp - fixedPaid;
  const oldArrearsPaid = pay(oldArrears);
  s.operatingArrearsRp = oldArrears - oldArrearsPaid + arrearsAdded;
  let principalPaid = 0,
    interestPaid = 0;
  if (s.activeLoan) {
    for (const item of s.activeLoan.schedule.filter((i) => i.dueWeek <= week)) {
      const interest = pay(item.interestRp - item.interestPaidRp);
      interestPaid += interest;
      item.interestPaidRp += interest;
      const principal = pay(item.principalRp - item.principalPaidRp);
      principalPaid += principal;
      item.principalPaidRp += principal;
      item.paid =
        item.principalPaidRp === item.principalRp &&
        item.interestPaidRp === item.interestRp;
    }
    s.activeLoan.arrearsRp = s.activeLoan.schedule
      .filter((i) => i.dueWeek <= week)
      .reduce(
        (n, i) => n + i.totalRp - i.principalPaidRp - i.interestPaidRp,
        0,
      );
  }
  let toConsume = sold * 1000;
  s.inventoryLots.sort((a, b) => a.createdWeek - b.createdWeek);
  for (const lot of s.inventoryLots.filter(
    (l) => l.menuId === s.activeMenuId,
  )) {
    const used = Math.min(toConsume, lot.quantityMilliPortions);
    lot.quantityMilliPortions -= used;
    toConsume -= used;
  }
  const wasteRate = s.brokenFridgeUnrepaired
    ? config.brokenFridgeWasteRateBps
    : config.normalWasteRateBps;
  let wasteMilli = 0,
    wasteValue = 0;
  for (const lot of s.inventoryLots) {
    const previousValue = inventoryValue([lot]);
    const waste = round((lot.quantityMilliPortions * wasteRate) / 10000);
    lot.quantityMilliPortions -= waste;
    wasteMilli += waste;
    wasteValue += previousValue - inventoryValue([lot]);
  }
  s.inventoryLots = s.inventoryLots.filter((l) => l.quantityMilliPortions > 0);
  if (
    (s.operatingArrearsRp > 0 || (s.activeLoan?.arrearsRp ?? 0) > 0) &&
    decision.ownerDrawRp + decision.emergencyTransferRp > 0
  )
    return error(
      "INVALID_DECISION",
      "Lunasi tunggakan sebelum mengambil uang pribadi atau menambah cadangan.",
    );
  if (decision.ownerDrawRp + decision.emergencyTransferRp > s.businessCashRp)
    return error(
      "INSUFFICIENT_WORKING_CAPITAL",
      "Kas tidak cukup untuk penarikan pribadi dan transfer cadangan.",
      decision.ownerDrawRp + decision.emergencyTransferRp - s.businessCashRp,
    );
  s.businessCashRp -= decision.ownerDrawRp + decision.emergencyTransferRp;
  s.personalCashRp += decision.ownerDrawRp;
  s.emergencyFundRp += decision.emergencyTransferRp;
  const overload = sold > safeCapacity;
  const poolTrust =
    pool?.requiresOverload && !overload ? 0 : (pool?.trustDelta ?? 0);
  s.trustScore = clamp(
    s.trustScore + choice.immediateTrustDelta + poolTrust - (overload ? 10 : 0),
  );
  s.wellbeingScore = clamp(
    s.wellbeingScore + choice.immediateWellbeingDelta - (overload ? 20 : 0),
  );
  s.currentWeek = (week + 1) as GameState["currentWeek"];
  s.phase = week === 12 ? "finished" : "debrief";
  if (week === 12) s.outcome = classifyOutcome(s);
  const closing = s.businessCashRp;
  const debrief = `Terjual ${sold} porsi dengan pendapatan ${money(revenue)}. Pembelian bahan ${money(purchase)}, produksi lain ${money(other)}, dan biaya tetap terbayar ${money(fixedPaid)}.${repair + helper ? ` Servis/bantuan ${money(repair + helper)}.` : ""} Kas akhir ${money(closing)}. ${overload ? "Pesanan melebihi kapasitas aman; kepercayaan turun 10 dan kondisi pekerja turun 20." : "Produksi berada dalam kapasitas aman."}`;
  const result: WeekResult = {
    week,
    openingBusinessCashRp: input.businessCashRp,
    effectiveSellingPriceRp: effectivePrice,
    safeCapacityPortions: safeCapacity,
    acceptedOrders: sold,
    producedPortions: sold,
    operatingArrearsAddedRp: arrearsAdded,
    regularDemandPortions: demand,
    cateringPortionsSold: catering,
    regularPortionsSold: regular,
    totalRevenueRp: revenue,
    cateringDpReceivedRp: dp,
    loanDisbursedRp: loanDisbursed,
    newMaterialPurchaseCostRp: purchase,
    otherProductionCostRp: otherPaid,
    fixedCostPaidRp: fixedPaid,
    repairOrHelperCostRp: repair + helper,
    loanPrincipalPaidRp: principalPaid,
    loanInterestPaidRp: interestPaid,
    ownerDrawPaidRp: decision.ownerDrawRp,
    emergencyTransferNetRp: decision.emergencyTransferRp - emergencyUsed,
    closingBusinessCashRp: closing,
    wasteMilliPortions: wasteMilli,
    wasteInventoryValueRp: wasteValue,
    carryOverMilliPortions: s.inventoryLots.reduce(
      (n, l) => n + l.quantityMilliPortions,
      0,
    ),
    overloadTriggered: overload,
    causalDebriefText: debrief,
  };
  // In the v2.2 result contract there is no old-arrears payment field. Cash reconciliation
  // derives it from before/after operating arrears; no invented result property is added.
  const snapshot: TurnSnapshot = {
    week,
    before,
    decision: structuredClone(decision),
    drawnPoolEventIds: pool ? [pool.id] : [],
    after: structuredClone(s),
    result: structuredClone(result),
  };
  return { ok: true, nextState: s, weekResult: result, snapshot };
}

export function restartRequirement(state: GameState) {
  const inventory = state.inventoryLots
    .filter((l) => l.menuId === "nasi_ayam_lengkuas")
    .reduce((n, l) => n + l.quantityMilliPortions, 0);
  const materials = round(
    (Math.max(0, 80000 - inventory) / 1000) *
      (7200 + (state.rawMaterialInflationActive ? 1300 : 0)),
  );
  const due =
    state.activeLoan?.schedule
      .filter((i) => i.dueWeek <= 13)
      .reduce(
        (n, i) => n + i.totalRp - i.principalPaidRp - i.interestPaidRp,
        0,
      ) ?? 0;
  return materials + config.weeklyFixedCostRp + state.operatingArrearsRp + due;
}
export function classifyOutcome(state: GameState): GameState["outcome"] {
  if (state.businessCashRp + state.emergencyFundRp < restartRequirement(state))
    return "cash_exhausted";
  return state.operatingArrearsRp === 0 &&
    (state.activeLoan?.arrearsRp ?? 0) === 0 &&
    state.trustScore >= 60 &&
    state.wellbeingScore >= 60
    ? "stable"
    : "fragile";
}

export function continueToDecision(state: GameState): GameState {
  return {
    ...structuredClone(state),
    phase: state.currentWeek === 13 ? "finished" : "decision",
    activeMenuId:
      state.currentWeek === 13 ? state.activeMenuId : "nasi_ayam_lengkuas",
  };
}
export function baselineDecision(state: GameState): WeekDecision {
  const decision = defaultDecision(state);
  if (state.currentWeek === 4) decision.enableQris = true;
  if (state.currentWeek === 5) decision.enableWhatsapp = true;
  if (state.currentWeek <= 6) decision.emergencyTransferRp = 50000;
  if (state.currentWeek === 10) decision.scenarioChoiceKey = "B";
  return decision;
}
export function generateDemoPresets(): Record<1 | 4 | 8 | 12, SavedGame> {
  let game = createSavedGame("demo");
  const stops: Record<number, SavedGame> = {};
  for (let w = 1; w <= 12; w++) {
    if ([1, 4, 8, 12].includes(w)) stops[w] = structuredClone(game);
    const result = simulateWeek(game.state, baselineDecision(game.state));
    if (!result.ok)
      throw new Error(`Preset demo M${w}: ${result.error.message}`);
    game = {
      ...game,
      state: continueToDecision(result.nextState),
      history: [...game.history, result.snapshot],
      revision: game.revision + 1,
    };
  }
  return stops as Record<1 | 4 | 8 | 12, SavedGame>;
}

function alternativeRun(
  history: TurnSnapshot[],
  decision: WeekDecision,
  throughWeek: WeekNumber,
):
  | TurnSnapshot[]
  | { failedWeek: WeekNumber; error: SimulationValidationError } {
  const originals = history.filter(
    (h) => h.week >= decision.week && h.week <= throughWeek,
  );
  if (
    !originals.length ||
    originals[0].week !== decision.week ||
    originals.at(-1)!.week !== throughWeek
  )
    return {
      failedWeek: decision.week,
      error: {
        code: "INVALID_DECISION",
        message: "Rentang histori replay tidak tersedia.",
        suggestedActions: [],
      },
    };
  const snapshots: TurnSnapshot[] = [];
  let state = structuredClone(originals[0].before);
  for (const original of originals) {
    const selected = structuredClone(
      original.week === decision.week ? decision : original.decision,
    );
    if (original.week !== decision.week) {
      const upcomingAction = getScenario(
        original.week,
        selected.loanType,
      ).choices.find((c) => c.key === selected.scenarioChoiceKey)!.action;
      selected.enableQris &&=
        state.unlockedChannels.qris ||
        (upcomingAction.type === "UNLOCK_CHANNEL" &&
          upcomingAction.channel === "qris");
      selected.enableWhatsapp &&=
        state.unlockedChannels.whatsapp ||
        (upcomingAction.type === "UNLOCK_CHANNEL" &&
          upcomingAction.channel === "whatsapp");
    }
    const result = simulateWeek(state, selected, {
      drawnPoolEventIds: original.drawnPoolEventIds,
    });
    if (!result.ok) return { failedWeek: original.week, error: result.error };
    snapshots.push(result.snapshot);
    state = continueToDecision(result.nextState);
  }
  return snapshots;
}
export function runResilienceReplay(
  history: TurnSnapshot[],
  decision: WeekDecision,
  throughWeek: WeekNumber = decision.week,
): ReplayResult {
  const results = alternativeRun(history, decision, throughWeek);
  if (!Array.isArray(results)) return { ok: false, ...results };
  const final = results.at(-1)!;
  const base = history.find((h) => h.week === throughWeek)!;
  return {
    ok: true,
    branch: {
      fromWeek: decision.week,
      throughWeek,
      baselineSnapshots: structuredClone(history),
      alternativeDecision: structuredClone(decision),
      alternativeAfter: final.after,
      alternativeResult: final.result,
      deltas: {
        businessCashDeltaRp:
          final.after.businessCashRp - base.after.businessCashRp,
        debtDeltaRp: outstandingDebt(final.after) - outstandingDebt(base.after),
        wasteValueDeltaRp:
          results.reduce((n, s) => n + s.result.wasteInventoryValueRp, 0) -
          history
            .filter((h) => h.week >= decision.week && h.week <= throughWeek)
            .reduce((n, s) => n + s.result.wasteInventoryValueRp, 0),
        trustDelta: final.after.trustScore - base.after.trustScore,
        wellbeingDelta: final.after.wellbeingScore - base.after.wellbeingScore,
      },
    },
  };
}
export function applyReplay(
  game: SavedGame,
  branch: NonNullable<SavedGame["lastReplayBranch"]>,
): SavedGame {
  const results = alternativeRun(
    branch.baselineSnapshots,
    branch.alternativeDecision,
    branch.throughWeek,
  );
  if (!Array.isArray(results)) throw new Error(results.error.message);
  return {
    ...structuredClone(game),
    state: results.at(-1)!.after,
    history: [
      ...game.history.filter((h) => h.week < branch.fromWeek),
      ...results,
    ],
    lastReplayBranch: structuredClone(branch),
    revision: game.revision + 1,
    postTestResponses: [],
  };
}
