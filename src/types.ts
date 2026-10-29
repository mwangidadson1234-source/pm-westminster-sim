export type MetricKey = 'approval' | 'loyalty' | 'integrity' | 'hostility';
export type Metrics = Record<MetricKey, number>;

export interface Choice {
  label: string;
  result: string;
  // Every choice changes all four metrics: [approval, loyalty, integrity, hostility]
  effects: [number, number, number, number];
  // Optional: an email that arrives later because of this choice
  followUp?: string;
}

export interface GameEvent {
  id: string;
  from: string;
  role: string;
  subject: string;
  body: string;
  choices: Choice[];
  minWeek?: number;                    // earliest week it can appear
  when?: (m: Metrics) => boolean;      // only appears when the numbers match (a reactive crisis)
  followUpOnly?: boolean;              // only appears as the result of an earlier choice
}

export type Whip = 'normal' | 'three-line' | 'concession';
export type Effects = [number, number, number, number];

export interface Bill {
  id: string;
  name: string;
  summary: string;
  controversy: number;      // 0-100: how many MPs dislike it
  passEffects: Effects;
  failEffects: Effects;
}
export interface BillState { id: string; stage: number; status: 'active' | 'passed' | 'failed'; }
export interface VoteResult {
  bill: string; stage: string; whip: Whip;
  forVotes: number; against: number; rebels: number; passed: boolean;
}

export interface HistoryItem { id: string; week: number; choice: string; }

export interface GameState {
  week: number;
  metrics: Metrics;
  currentId: string;
  seen: string[];
  queue: string[];
  history: HistoryItem[];
  bills: BillState[];
  vote: VoteResult | null;
  noConfidence: boolean;
  acted: boolean;
  lastResult: { text: string; deltas: Metrics } | null;
  ended: string | null;
}
