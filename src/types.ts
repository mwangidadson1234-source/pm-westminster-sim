export type MetricKey = 'approval' | 'loyalty' | 'integrity' | 'hostility';
export type Metrics = Record<MetricKey, number>;

export interface Choice {
  label: string;
  result: string;
  // Every choice changes all four metrics: [approval, loyalty, integrity, hostility]
  effects: [number, number, number, number];
}

export interface GameEvent {
  id: string;
  from: string;
  role: string;
  subject: string;
  body: string;
  choices: Choice[];
}

export interface HistoryItem { id: string; week: number; choice: string; }

export interface GameState {
  week: number;
  metrics: Metrics;
  currentId: string;
  seen: string[];
  history: HistoryItem[];
  lastResult: { text: string; deltas: Metrics } | null;
  ended: string | null;
}
