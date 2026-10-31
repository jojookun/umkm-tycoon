import { z } from "zod";
import { SCHEMA_VERSION } from "./types";
import type {
  GameState,
  WeekDecision,
  WeekResult,
  TurnSnapshot,
  ReplayBranch,
  SavedGame,
  ScenariosFile,
  AssessmentFile,
  GlossaryFile,
} from "./types";

const int = z.number().int().min(0).max(1_000_000_000_000);
const delta = z.number().int().min(-1_000_000_000_000).max(1_000_000_000_000);
const score = int.max(100);
const week = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
  z.literal(10),
  z.literal(11),
  z.literal(12),
]);
const nextWeek = z.union([week, z.literal(13)]);
const key = z.enum(["A", "B", "C"]);
const text = z.string().min(1).max(4000);
const version = {
  schemaVersion: z.literal(SCHEMA_VERSION),
  contentVersion: text,
};
const menuId = z.enum([
  "nasi_ayam_lengkuas",
  "nasi_telur_krispi",
  "tahu_tempe_bacem",
  "es_teh_wedang_jahe",
]);
const productId = z.enum(["formal_productive", "instant_high_cost"]);
const pair = z.enum([
  "cash_separation",
  "true_hpp",
  "perishable_stock",
  "emergency_vs_loan",
  "channel_capacity",
]);
const character = z.enum([
  "sari_pertiwi",
  "kang_deden",
  "dimas",
  "haji_bambang",
  "bu_ratna",
  "mbak_nisa",
  "pak_rt_karso",
  "mas_raka",
  "si_cepat_cair",
]);
const installment = z
  .strictObject({
    dueWeek: nextWeek,
    principalRp: int,
    interestRp: int,
    totalRp: int,
    principalPaidRp: int,
    interestPaidRp: int,
    paid: z.boolean(),
  })
  .refine(
    (s) =>
      s.totalRp === s.principalRp + s.interestRp &&
      s.principalPaidRp <= s.principalRp &&
      s.interestPaidRp <= s.interestRp &&
      s.paid ===
        (s.principalPaidRp === s.principalRp &&
          s.interestPaidRp === s.interestRp),
    "Saldo cicilan tidak konsisten",
  );
const loan = z
  .strictObject({
    loanId: text,
    productId,
    disbursedWeek: z.union([z.literal(8), z.literal(9)]),
    schedule: z.array(installment).length(4),
    arrearsRp: int,
  })
  .refine(
    (l) => l.schedule.every((s, i) => s.dueWeek === l.disbursedWeek + i + 1),
    "Jadwal pinjaman tidak berurutan",
  );
const inventory = z.strictObject({
  menuId,
  lotId: text,
  createdWeek: week,
  quantityMilliPortions: int.max(160000),
  unitMaterialCostRp: int.max(100000),
});
const unique = <T>(xs: T[], id: (x: T) => unknown) =>
  new Set(xs.map(id)).size === xs.length;

export const stateSchema: z.ZodType<GameState> = z
  .strictObject({
    ...version,
    phase: z.enum(["decision", "debrief", "finished"]),
    outcome: z.enum(["in_progress", "stable", "fragile", "cash_exhausted"]),
    operatingArrearsRp: int,
    activeMenuId: z.enum(["nasi_ayam_lengkuas", "nasi_telur_krispi"]),
    currentWeek: nextWeek,
    rngSeed: int.max(0xffffffff),
    isJudgeDemoMode: z.boolean(),
    businessCashRp: int,
    personalCashRp: int,
    emergencyFundRp: int,
    inventoryLots: z.array(inventory).max(200),
    activeLoan: loan.nullable(),
    trustScore: score,
    wellbeingScore: score,
    unlockedChannels: z.strictObject({
      cash: z.literal(true),
      qris: z.boolean(),
      whatsapp: z.boolean(),
    }),
    brokenFridgeUnrepaired: z.boolean(),
    rawMaterialInflationActive: z.boolean(),
  })
  .refine(
    (s) =>
      unique(s.inventoryLots, (l) => l.lotId) &&
      s.inventoryLots.every(
        (l) => l.createdWeek <= Math.min(s.currentWeek, 12),
      ),
    "Lot tidak valid",
  )
  .refine(
    (s) =>
      (s.currentWeek === 13) === (s.phase === "finished") &&
      (s.phase === "finished"
        ? s.outcome !== "in_progress"
        : s.outcome === "in_progress"),
    "Fase permainan tidak konsisten",
  )
  .refine(
    (s) =>
      !s.activeLoan ||
      (s.activeLoan.disbursedWeek < s.currentWeek &&
        s.activeLoan.arrearsRp ===
          s.activeLoan.schedule
            .filter((i) => i.dueWeek < s.currentWeek)
            .reduce(
              (n, i) => n + i.totalRp - i.principalPaidRp - i.interestPaidRp,
              0,
            )),
    "Tunggakan pinjaman tidak konsisten",
  );

export const decisionSchema: z.ZodType<WeekDecision> = z.strictObject({
  week,
  loanType: productId.optional(),
  scenarioChoiceKey: key,
  acceptBeyondSafeCapacity: z.boolean(),
  targetStockOption: z.enum(["low_80", "medium_110", "high_145"]),
  sellingPriceRp: z.union([
    z.literal(12000),
    z.literal(14000),
    z.literal(16000),
  ]),
  enableQris: z.boolean(),
  enableWhatsapp: z.boolean(),
  enableBigPromo: z.boolean(),
  ownerDrawRp: z.union([z.literal(0), z.literal(50000), z.literal(100000)]),
  emergencyTransferRp: z.union([
    z.literal(0),
    z.literal(50000),
    z.literal(100000),
  ]),
});

const resultSchema: z.ZodType<WeekResult> = z
  .strictObject({
    week,
    openingBusinessCashRp: int,
    effectiveSellingPriceRp: int,
    safeCapacityPortions: int.max(160),
    acceptedOrders: int.max(160),
    producedPortions: int.max(160),
    operatingArrearsAddedRp: int,
    regularDemandPortions: int,
    cateringPortionsSold: int.max(80),
    regularPortionsSold: int.max(160),
    totalRevenueRp: int,
    cateringDpReceivedRp: int,
    loanDisbursedRp: int,
    newMaterialPurchaseCostRp: int,
    otherProductionCostRp: int,
    fixedCostPaidRp: int,
    repairOrHelperCostRp: int,
    loanPrincipalPaidRp: int,
    loanInterestPaidRp: int,
    ownerDrawPaidRp: int,
    emergencyTransferNetRp: delta,
    closingBusinessCashRp: int,
    wasteMilliPortions: int,
    wasteInventoryValueRp: int,
    carryOverMilliPortions: int,
    overloadTriggered: z.boolean(),
    causalDebriefText: text,
  })
  .refine(
    (r) =>
      r.producedPortions === r.regularPortionsSold + r.cateringPortionsSold &&
      r.acceptedOrders === r.producedPortions &&
      r.overloadTriggered === r.acceptedOrders > r.safeCapacityPortions,
    "Produksi tidak konsisten",
  );
const snapshotSchema: z.ZodType<TurnSnapshot> = z
  .strictObject({
    week,
    before: stateSchema,
    decision: decisionSchema,
    drawnPoolEventIds: z.array(text).max(1),
    after: stateSchema,
    result: resultSchema,
  })
  .refine(
    (s) =>
      s.before.phase === "decision" &&
      s.week === s.before.currentWeek &&
      s.week === s.decision.week &&
      s.week === s.result.week &&
      s.after.currentWeek === s.week + 1 &&
      s.result.openingBusinessCashRp === s.before.businessCashRp &&
      s.result.closingBusinessCashRp === s.after.businessCashRp,
    "Snapshot tidak konsisten",
  );
const replaySchema: z.ZodType<ReplayBranch> = z
  .strictObject({
    fromWeek: week,
    baselineSnapshots: z.array(snapshotSchema).min(1).max(12),
    throughWeek: week,
    alternativeDecision: decisionSchema,
    alternativeAfter: stateSchema,
    alternativeResult: resultSchema,
    deltas: z.strictObject({
      businessCashDeltaRp: delta,
      debtDeltaRp: delta,
      wasteValueDeltaRp: delta,
      trustDelta: delta,
      wellbeingDelta: delta,
    }),
  })
  .refine(
    (b) =>
      b.fromWeek <= b.throughWeek &&
      b.alternativeDecision.week === b.fromWeek &&
      b.alternativeResult.week === b.throughWeek &&
      b.alternativeAfter.currentWeek === b.throughWeek + 1 &&
      b.baselineSnapshots.some((s) => s.week === b.fromWeek) &&
      b.baselineSnapshots.some((s) => s.week === b.throughWeek),
    "Rentang cabang replay tidak konsisten",
  );
const responseSchema = z.strictObject({
  questionId: text,
  pairId: pair,
  selectedOption: key,
  selectedReason: key,
  confidenceLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  responseTimeSeconds: z.number().finite().min(0).max(86400),
});
export const savedGameSchema: z.ZodType<SavedGame> = z
  .strictObject({
    ...version,
    revision: int,
    mode: z.enum(["full", "demo"]),
    state: stateSchema,
    history: z.array(snapshotSchema).max(12),
    lastReplayBranch: replaySchema.nullable(),
    preTestResponses: z.array(responseSchema).max(5),
    postTestResponses: z.array(responseSchema).max(5),
  })
  .refine(
    (s) =>
      s.state.schemaVersion === s.schemaVersion &&
      s.state.contentVersion === s.contentVersion &&
      s.state.isJudgeDemoMode === (s.mode === "demo"),
    "Mode/versi tidak konsisten",
  )
  .refine(
    (s) =>
      s.history.length === s.state.currentWeek - 1 &&
      s.history.every(
        (h, i) =>
          h.week === i + 1 &&
          h.before.contentVersion === s.contentVersion &&
          h.after.contentVersion === s.contentVersion &&
          h.before.isJudgeDemoMode === s.state.isJudgeDemoMode &&
          h.after.isJudgeDemoMode === s.state.isJudgeDemoMode,
      ),
    "Histori tidak berurutan",
  )
  .refine(
    (s) =>
      unique(s.preTestResponses, (r) => r.questionId) &&
      unique(s.postTestResponses, (r) => r.questionId),
    "Jawaban duplikat",
  );

const action = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("SPLIT_INITIAL_WALLET"),
    businessCashRp: int,
    personalCashRp: int,
  }),
  z.strictObject({
    type: z.literal("UNLOCK_CHANNEL"),
    channel: z.enum(["qris", "whatsapp"]),
  }),
  z.strictObject({
    type: z.literal("CATERING_CONTRACT"),
    mode: z.enum(["self_dp50", "coop_ratna", "decline"]),
  }),
  z.strictObject({
    type: z.literal("FRIDGE_REPAIR"),
    mode: z.enum(["use_emergency_and_cash", "take_loan", "delay_repair"]),
    loanType: productId.optional(),
  }),
  z.strictObject({ type: z.literal("TAKE_LOAN"), loanType: productId }),
  z.strictObject({
    type: z.literal("WORKER_CAPACITY_MODE"),
    mode: z.enum(["overtime", "hire_part_time", "cap_orders"]),
    costRp: int,
  }),
  z.strictObject({
    type: z.literal("CONTEXTUAL_MENU_ADAPT"),
    menuId,
    demandModifierBps: int.optional(),
    materialDeltaRp: delta.optional(),
  }),
  z.strictObject({
    type: z.literal("VERIFY_PAYMENT"),
    acceptUnverified: z.boolean(),
  }),
  z.strictObject({ type: z.literal("NO_OP") }),
]);
const menu = z
  .strictObject({
    id: menuId,
    name: text,
    perceivedHppRp: int,
    rawMaterialCostRp: int,
    packagingCostRp: int,
    utilityAllocationRp: int,
    laborAllocationRp: int,
    trueHppRp: int,
    defaultSellingPriceRp: int,
  })
  .refine(
    (m) =>
      m.trueHppRp ===
      m.rawMaterialCostRp +
        m.packagingCostRp +
        m.utilityAllocationRp +
        m.laborAllocationRp,
    "HPP tidak seimbang",
  );
const product = z
  .strictObject({
    id: productId,
    name: text,
    principalRp: int,
    totalInterestOrFeeRp: int,
    totalObligationRp: int,
    tenorWeeks: z.literal(4),
    weeklyInstallmentRp: int,
    weeklyPrincipalRp: int,
    weeklyInterestRp: int,
  })
  .refine(
    (p) =>
      p.totalObligationRp === p.principalRp + p.totalInterestOrFeeRp &&
      p.weeklyInstallmentRp * 4 === p.totalObligationRp &&
      p.weeklyPrincipalRp * 4 === p.principalRp &&
      p.weeklyInterestRp * 4 === p.totalInterestOrFeeRp,
    "Produk pinjaman tidak seimbang",
  );
const config = z
  .strictObject({
    ...version,
    initialTrustScore: score,
    initialWellbeingScore: score,
    fridgeRepairCostRp: int,
    partTimeCostRp: int,
    initialTotalMoneyRp: int,
    initialBusinessCashRp: int,
    initialPersonalCashRp: int,
    weeklyFixedCostRp: int,
    baseDemandPortions: int,
    normalCapacityPortions: int,
    overtimeCapacityPortions: int,
    highStockDiscountPerPortionRp: int,
    coopDiscountPerPortionRp: int,
    promoPriceCutPerPortionRp: int,
    priceFactorsBps: z.strictObject({
      "12000": int,
      "14000": int,
      "16000": int,
    }),
    channelFactorsBps: z.strictObject({
      cashOnly: int,
      qrisActive: int,
      waActive: int,
      promoActive: int,
    }),
    normalWasteRateBps: int.max(10000),
    brokenFridgeWasteRateBps: int.max(10000),
    menus: z.record(menuId, menu),
    loans: z.record(productId, product),
  })
  .refine(
    (c) =>
      c.initialTotalMoneyRp ===
      c.initialBusinessCashRp + c.initialPersonalCashRp,
    "Modal awal tidak seimbang",
  );
const poolId = z.enum([
  "late_supplier",
  "stove_issue",
  "worker_sick",
  "competitor_promo",
  "positive_review",
  "wait_time_complaint",
  "qris_temp_outage",
]);
const scenarioChoice = z.strictObject({
  key,
  label: text,
  description: text,
  action,
  immediateTrustDelta: delta,
  immediateWellbeingDelta: delta,
  debriefExplanation: text,
});
export const scenariosSchema: z.ZodType<ScenariosFile> = z
  .strictObject({
    ...version,
    config,
    weeks: z
      .array(
        z.strictObject({
          week,
          isJudgeDemoStop: z.boolean(),
          title: text,
          learningObjective: text,
          featuredCharacterId: character,
          animationState: z.enum([
            "idle_cooking",
            "crisis_shock",
            "worker_burnout",
            "resilient_win",
          ]),
          characterDialogue: text,
          shockTitle: text,
          shockDescription: text,
          eventDemandFactorBps: int.max(20000),
          rawMaterialExtraCostRp: int,
          choices: z.tuple([scenarioChoice, scenarioChoice, scenarioChoice]),
        }),
      )
      .length(12),
    optionalPoolEvents: z
      .array(
        z.strictObject({
          id: poolId,
          eligibleWeeks: z.array(week),
          weight: int.min(1),
          durationWeeks: z.literal(1),
          replacesMainEvent: z.boolean(),
          incompatibleEventIds: z.array(poolId),
          qrisOutage: z.boolean().optional(),
          requiresOverload: z.boolean().optional(),
          mitigatedCapacityPortions: int.optional(),
          title: text,
          description: text,
          maxStockOverridePortions: int.optional(),
          capacityOverridePortions: int.optional(),
          demandMultiplierBps: int.max(20000).optional(),
          trustDelta: delta.optional(),
          mitigationCostRp: int.optional(),
        }),
      )
      .max(7),
  })
  .refine(
    (s) =>
      s.config.contentVersion === s.contentVersion &&
      s.weeks.every(
        (w, i) => w.week === i + 1 && unique(w.choices, (c) => c.key),
      ) &&
      unique(s.optionalPoolEvents, (p) => p.id),
    "Konten tidak berurutan/unik",
  );
const answer = z.strictObject({ key, text, isCorrect: z.boolean() });
const question = z
  .strictObject({
    id: text,
    pairId: pair,
    phase: z.enum(["pre", "post"]),
    scenarioText: text,
    options: z.array(answer).length(3),
    reasonOptions: z.array(answer).length(3),
  })
  .refine(
    (q) =>
      [q.options, q.reasonOptions].every(
        (xs) =>
          unique(xs, (a) => a.key) &&
          xs.filter((a) => a.isCorrect).length === 1,
      ),
    "Kunci soal tidak valid",
  );
export const assessmentSchema: z.ZodType<AssessmentFile> = z
  .strictObject({
    ...version,
    pre: z.array(question).length(5),
    post: z.array(question).length(5),
  })
  .refine(
    (a) =>
      a.pre.every((q) => q.phase === "pre") &&
      a.post.every((q) => q.phase === "post") &&
      unique([...a.pre, ...a.post], (q) => q.id) &&
      unique(a.pre, (q) => q.pairId) &&
      unique(a.post, (q) => q.pairId) &&
      a.pre.every((q) => a.post.some((p) => p.pairId === q.pairId)),
    "Pasangan pre/post tidak valid",
  );
export const glossarySchema: z.ZodType<GlossaryFile> = z
  .strictObject({
    ...version,
    entries: z
      .array(
        z.strictObject({
          id: text,
          plainTerm: text,
          formalTerm: text,
          definition: text,
          example: text,
        }),
      )
      .min(1),
  })
  .refine((g) => unique(g.entries, (e) => e.id), "Istilah duplikat");

export function validateSavedGame(value: unknown): value is SavedGame {
  return savedGameSchema.safeParse(value).success;
}
