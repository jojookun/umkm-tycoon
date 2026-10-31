// src/engine/types.ts — Schema Version 2.2.0
export const SCHEMA_VERSION = "2.2.0" as const;

export type WeekNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type NextWeekState = WeekNumber | 13;

export type CharacterId =
  | "sari_pertiwi"
  | "kang_deden"
  | "dimas"
  | "haji_bambang"
  | "bu_ratna"
  | "mbak_nisa"
  | "pak_rt_karso"
  | "mas_raka"
  | "si_cepat_cair";

export type AnimationStateId =
  "idle_cooking" | "crisis_shock" | "worker_burnout" | "resilient_win";
export type StockLevelOption = "low_80" | "medium_110" | "high_145";
export type PriceOptionRp = 12000 | 14000 | 16000;
export type ChoiceKey = "A" | "B" | "C";

export interface MenuEconomy {
  id:
    | "nasi_ayam_lengkuas"
    | "nasi_telur_krispi"
    | "tahu_tempe_bacem"
    | "es_teh_wedang_jahe";
  name: string;
  perceivedHppRp: number;
  rawMaterialCostRp: number;
  packagingCostRp: number;
  utilityAllocationRp: number;
  laborAllocationRp: number;
  trueHppRp: number;
  defaultSellingPriceRp: number;
}

export interface LoanProduct {
  id: "formal_productive" | "instant_high_cost";
  name: string;
  principalRp: number;
  totalInterestOrFeeRp: number;
  totalObligationRp: number;
  tenorWeeks: 4;
  weeklyInstallmentRp: number;
  weeklyPrincipalRp: number;
  weeklyInterestRp: number;
}

export interface EconomyConfig {
  schemaVersion: typeof SCHEMA_VERSION;
  contentVersion: string;
  initialTrustScore: number;
  initialWellbeingScore: number;
  fridgeRepairCostRp: number;
  partTimeCostRp: number;
  initialTotalMoneyRp: number;
  initialBusinessCashRp: number;
  initialPersonalCashRp: number;
  weeklyFixedCostRp: number;
  baseDemandPortions: number;
  normalCapacityPortions: number;
  overtimeCapacityPortions: number;
  highStockDiscountPerPortionRp: number;
  coopDiscountPerPortionRp: number;
  promoPriceCutPerPortionRp: number;
  priceFactorsBps: Record<PriceOptionRp, number>;
  channelFactorsBps: {
    cashOnly: number;
    qrisActive: number;
    waActive: number;
    promoActive: number;
  };
  normalWasteRateBps: number;
  brokenFridgeWasteRateBps: number;
  menus: Record<MenuEconomy["id"], MenuEconomy>;
  loans: Record<LoanProduct["id"], LoanProduct>;
}

export type ScenarioAction =
  | {
      type: "SPLIT_INITIAL_WALLET";
      businessCashRp: number;
      personalCashRp: number;
    }
  | { type: "UNLOCK_CHANNEL"; channel: "qris" | "whatsapp" }
  | { type: "CATERING_CONTRACT"; mode: "self_dp50" | "coop_ratna" | "decline" }
  | {
      type: "FRIDGE_REPAIR";
      mode: "use_emergency_and_cash" | "take_loan" | "delay_repair";
      loanType?: LoanProduct["id"];
    }
  | { type: "TAKE_LOAN"; loanType: LoanProduct["id"] }
  | {
      type: "WORKER_CAPACITY_MODE";
      mode: "overtime" | "hire_part_time" | "cap_orders";
      costRp: number;
    }
  | {
      type: "CONTEXTUAL_MENU_ADAPT";
      menuId: MenuEconomy["id"];
      demandModifierBps?: number;
      materialDeltaRp?: number;
    }
  | { type: "VERIFY_PAYMENT"; acceptUnverified: boolean }
  | { type: "NO_OP" };

export interface ScenarioChoice {
  key: ChoiceKey;
  label: string;
  description: string;
  action: ScenarioAction;
  immediateTrustDelta: number;
  immediateWellbeingDelta: number;
  debriefExplanation: string;
}

export interface WeekScenario {
  week: WeekNumber;
  isJudgeDemoStop: boolean;
  title: string;
  learningObjective: string;
  featuredCharacterId: CharacterId;
  animationState: AnimationStateId;
  characterDialogue: string;
  shockTitle: string;
  shockDescription: string;
  eventDemandFactorBps: number;
  rawMaterialExtraCostRp: number;
  choices: [ScenarioChoice, ScenarioChoice, ScenarioChoice];
}

export interface PoolEvent {
  id:
    | "late_supplier"
    | "stove_issue"
    | "worker_sick"
    | "competitor_promo"
    | "positive_review"
    | "wait_time_complaint"
    | "qris_temp_outage";
  eligibleWeeks: WeekNumber[];
  weight: number;
  durationWeeks: 1;
  replacesMainEvent: boolean;
  incompatibleEventIds: PoolEvent["id"][];
  qrisOutage?: boolean;
  requiresOverload?: boolean;
  mitigatedCapacityPortions?: number;
  title: string;
  description: string;
  maxStockOverridePortions?: number;
  capacityOverridePortions?: number;
  demandMultiplierBps?: number;
  trustDelta?: number;
  mitigationCostRp?: number;
}

export interface ScenariosFile {
  schemaVersion: typeof SCHEMA_VERSION;
  contentVersion: string;
  config: EconomyConfig;
  weeks: WeekScenario[];
  optionalPoolEvents: PoolEvent[];
}

export interface InventoryLot {
  menuId: MenuEconomy["id"];
  lotId: string;
  createdWeek: WeekNumber;
  quantityMilliPortions: number; // 1000 = 1 porsi
  unitMaterialCostRp: number;
}

export interface InstallmentItem {
  dueWeek: NextWeekState;
  principalRp: number;
  interestRp: number;
  totalRp: number;
  principalPaidRp: number;
  interestPaidRp: number;
  paid: boolean;
}

export interface LoanState {
  loanId: string;
  productId: LoanProduct["id"];
  disbursedWeek: WeekNumber;
  schedule: InstallmentItem[];
  arrearsRp: number;
}

export interface GameState {
  schemaVersion: typeof SCHEMA_VERSION;
  contentVersion: string;
  phase: "decision" | "debrief" | "finished";
  outcome: "in_progress" | "stable" | "fragile" | "cash_exhausted";
  operatingArrearsRp: number;
  activeMenuId: "nasi_ayam_lengkuas" | "nasi_telur_krispi";
  currentWeek: NextWeekState;
  rngSeed: number;
  isJudgeDemoMode: boolean;
  businessCashRp: number;
  personalCashRp: number;
  emergencyFundRp: number;
  inventoryLots: InventoryLot[];
  activeLoan: LoanState | null;
  trustScore: number;
  wellbeingScore: number;
  unlockedChannels: { cash: true; qris: boolean; whatsapp: boolean };
  brokenFridgeUnrepaired: boolean;
  rawMaterialInflationActive: boolean;
}

export interface WeekDecision {
  week: WeekNumber;
  /** Additive implementation patch: persist the selected financing product for replay. */
  loanType?: LoanProduct["id"];
  scenarioChoiceKey: ChoiceKey;
  acceptBeyondSafeCapacity: boolean;
  targetStockOption: StockLevelOption;
  sellingPriceRp: PriceOptionRp;
  enableQris: boolean;
  enableWhatsapp: boolean;
  enableBigPromo: boolean;
  ownerDrawRp: 0 | 50000 | 100000;
  emergencyTransferRp: 0 | 50000 | 100000;
}

export interface WeekResult {
  week: WeekNumber;
  openingBusinessCashRp: number;
  effectiveSellingPriceRp: number;
  safeCapacityPortions: number;
  acceptedOrders: number;
  producedPortions: number;
  operatingArrearsAddedRp: number;
  regularDemandPortions: number;
  cateringPortionsSold: number;
  regularPortionsSold: number;
  // Includes the full catering contract revenue; DP is a component, never added twice.
  totalRevenueRp: number;
  cateringDpReceivedRp: number;
  loanDisbursedRp: number;
  newMaterialPurchaseCostRp: number;
  otherProductionCostRp: number;
  fixedCostPaidRp: number;
  repairOrHelperCostRp: number;
  loanPrincipalPaidRp: number;
  loanInterestPaidRp: number;
  ownerDrawPaidRp: number;
  emergencyTransferNetRp: number;
  closingBusinessCashRp: number;
  wasteMilliPortions: number;
  wasteInventoryValueRp: number;
  carryOverMilliPortions: number;
  overloadTriggered: boolean;
  causalDebriefText: string;
}

export type SimulationValidationError = {
  code:
    | "INSUFFICIENT_WORKING_CAPITAL"
    | "INSUFFICIENT_EMERGENCY_FUND"
    | "LOAN_ALREADY_ACTIVE"
    | "INVALID_CHANNEL_SELECTION"
    | "STATE_VERSION_MISMATCH"
    | "INVALID_DECISION"
    | "INVALID_STATE"
    | "GAME_FINISHED";
  message: string;
  shortfallRp?: number;
  suggestedActions: string[];
};

export type SimulationResult =
  | {
      ok: true;
      nextState: GameState;
      weekResult: WeekResult;
      snapshot: TurnSnapshot;
    }
  | { ok: false; error: SimulationValidationError };

export interface TurnSnapshot {
  week: WeekNumber;
  before: GameState;
  decision: WeekDecision;
  drawnPoolEventIds: string[];
  after: GameState;
  result: WeekResult;
}

export interface ReplayBranch {
  fromWeek: WeekNumber;
  baselineSnapshots: TurnSnapshot[];
  throughWeek: WeekNumber;
  alternativeDecision: WeekDecision;
  alternativeAfter: GameState;
  alternativeResult: WeekResult;
  deltas: {
    businessCashDeltaRp: number;
    debtDeltaRp: number;
    wasteValueDeltaRp: number;
    trustDelta: number;
    wellbeingDelta: number;
  };
}

export interface AssessmentQuestion {
  id: string;
  pairId:
    | "cash_separation"
    | "true_hpp"
    | "perishable_stock"
    | "emergency_vs_loan"
    | "channel_capacity";
  phase: "pre" | "post";
  scenarioText: string;
  options: { key: ChoiceKey; text: string; isCorrect: boolean }[];
  reasonOptions: { key: ChoiceKey; text: string; isCorrect: boolean }[];
}

export interface AssessmentResponse {
  questionId: string;
  pairId: AssessmentQuestion["pairId"];
  selectedOption: ChoiceKey;
  selectedReason: ChoiceKey;
  confidenceLevel: 1 | 2 | 3;
  responseTimeSeconds: number;
}

export interface CoachTelemetry {
  turn: WeekNumber;
  cash: number;
  inventory_waste: number;
  price: number;
  debt_payment: number;
  decision: string;
}

export interface CoachResponse {
  source: "ai_live" | "rule_based_fallback";
  mentorName: "Mas Raka";
  message: string;
}

export interface SavedGame {
  schemaVersion: typeof SCHEMA_VERSION;
  contentVersion: string;
  revision: number;
  mode: "full" | "demo";
  state: GameState;
  history: TurnSnapshot[];
  lastReplayBranch: ReplayBranch | null;
  preTestResponses: AssessmentResponse[];
  postTestResponses: AssessmentResponse[];
}

export interface AssessmentFile {
  schemaVersion: typeof SCHEMA_VERSION;
  contentVersion: string;
  pre: AssessmentQuestion[];
  post: AssessmentQuestion[];
}
export interface GlossaryEntry {
  id: string;
  plainTerm: string;
  formalTerm: string;
  definition: string;
  example: string;
}
export interface GlossaryFile {
  schemaVersion: typeof SCHEMA_VERSION;
  contentVersion: string;
  entries: GlossaryEntry[];
}
export type ReplayResult =
  | { ok: true; branch: ReplayBranch }
  | { ok: false; failedWeek: WeekNumber; error: SimulationValidationError };
