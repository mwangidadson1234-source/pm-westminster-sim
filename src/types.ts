export type MetricKey = 'approval' | 'loyalty' | 'integrity' | 'hostility';
export type Metrics = Record<MetricKey, number>;
export type Effects = [number, number, number, number]; // [approval, loyalty, integrity, hostility]
export type Whip = 'normal' | 'three-line' | 'concession';
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface Choice { label: string; result: string; effects: Effects; followUp?: string; }

export interface GameEvent {
  id: string; from: string; role: string; subject: string; body: string; choices: Choice[];
  minWeek?: number;                  // earliest week it can appear
  when?: (m: Metrics) => boolean;    // only appears when the numbers match
  followUpOnly?: boolean;            // only appears after an earlier choice
}

export interface Bill {
  id: string; name: string; summary: string; controversy: number;
  passEffects: Effects; failEffects: Effects;
}
export interface BillState { id: string; stage: number; status: 'active' | 'passed' | 'failed'; }
export interface VoteResult {
  bill: string; stage: string; whip: Whip;
  forVotes: number; against: number; rebels: number; passed: boolean;
}

export interface Budget { income: number; corp: number; vat: number; nhs: number; education: number; defence: number; infra: number; }
export interface Economy { growth: number; deficit: number; debt: number; yield: number; waiting: number; services: number; }

export type PledgeStatus = 'progress' | 'delivered' | 'broken';
export interface PledgeState { id: string; status: PledgeStatus; }
export interface PmqsState { round: number; jabs: string[]; headlines: string[]; }

export interface HistoryItem { id: string; week: number; choice: string; }

export interface GameState {
  started: boolean; difficulty: Difficulty; victory: boolean;
  week: number; metrics: Metrics;
  currentId: string; seen: string[]; queue: string[]; history: HistoryItem[];
  bills: BillState[]; vote: VoteResult | null; noConfidence: boolean; acted: boolean;
  budget: Budget; economy: Economy; cooldown: number;
  pledges: PledgeState[]; pmqs: PmqsState | null; report: string[];
  lastResult: { text: string; deltas: Metrics } | null;
  ended: string | null;
}
