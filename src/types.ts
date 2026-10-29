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

export interface HistoryItem { id: string; week: number; choice: string; }

export interface GameState {
  week: number;
  metrics: Metrics;
  currentId: string;
  seen: string[];
  queue: string[];
  history: HistoryItem[];
  lastResult: { text: string; deltas: Metrics } | null;
  ended: string | null;
}
