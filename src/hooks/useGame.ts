import { useEffect, useState } from 'react';
import { EVENTS } from '../data/events';
import type { Choice, GameState, Metrics } from '../types';

const KEY = 'pm-westminster-save-v2';
const clamp = (n: number) => Math.max(0, Math.min(100, n));

const fresh = (): GameState => ({
  week: 1,
  metrics: { approval: 50, loyalty: 55, integrity: 60, hostility: 25 },
  currentId: EVENTS[0].id,
  seen: [EVENTS[0].id],
  queue: [],
  history: [],
  lastResult: null,
  ended: null,
});

function checkEnd(m: Metrics): string | null {
  if (m.loyalty <= 10) return 'Your party loses confidence in you. A leadership challenge removes you from Downing Street.';
  if (m.approval <= 10) return 'Public approval collapses. You resign after the local elections.';
  if (m.integrity <= 5) return 'A scandal becomes impossible to survive. You resign in disgrace.';
  if (m.hostility >= 95) return 'Every faction is against you. The Cabinet forces you out.';
  return null;
}

// Decides which email arrives next week
function pickNext(s: GameState): { id: string; seen: string[]; queue: string[] } {
  const queue = s.queue ?? [];
  if (queue.length > 0) return { id: queue[0], seen: s.seen, queue: queue.slice(1) };

  const ok = (id: string, seen: string[]) => {
    const e = EVENTS.find((x) => x.id === id)!;
    return !e.followUpOnly && !seen.includes(id) && id !== s.currentId &&
      s.week + 1 >= (e.minWeek ?? 1) && (!e.when || e.when(s.metrics));
  };
  let seen = s.seen;
  let pool = EVENTS.filter((e) => ok(e.id, seen));
  if (pool.length === 0) {
    seen = [];
    pool = EVENTS.filter((e) => ok(e.id, seen));
  }
  if (pool.length === 0) pool = [EVENTS[0]];

  // Crises that match your numbers come first, 7 weeks in 10
  const reactive = pool.filter((e) => e.when);
  const from = reactive.length > 0 && Math.random() < 0.7 ? reactive : pool;
  const next = from[Math.floor(Math.random() * from.length)];
  return { id: next.id, seen: [...seen, next.id], queue: [] };
}

export function useGame() {
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(KEY);
      return saved ? (JSON.parse(saved) as GameState) : fresh();
    } catch {
      return fresh();
    }
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  }, [state]);

  const current = EVENTS.find((e) => e.id === state.currentId) ?? EVENTS[0];

  function choose(choice: Choice) {
    setState((s) => {
      if (s.lastResult || s.ended) return s;
      const [a, l, i, h] = choice.effects;
      const m = s.metrics;
      const metrics: Metrics = {
        approval: clamp(m.approval + a),
        loyalty: clamp(m.loyalty + l),
        integrity: clamp(m.integrity + i),
        hostility: clamp(m.hostility + h),
      };
      return {
        ...s,
        metrics,
        queue: choice.followUp ? [...(s.queue ?? []), choice.followUp] : (s.queue ?? []),
        history: [...s.history, { id: s.currentId, week: s.week, choice: choice.label }],
        lastResult: { text: choice.result, deltas: { approval: a, loyalty: l, integrity: i, hostility: h } },
        ended: checkEnd(metrics),
      };
    });
  }

  function nextWeek() {
    setState((s) => {
      if (s.ended || !s.lastResult) return s;
      const next = pickNext(s);
      return { ...s, week: s.week + 1, currentId: next.id, seen: [...next.seen, next.id].filter((v, i, a) => a.indexOf(v) === i), queue: next.queue, lastResult: null };
    });
  }

  const restart = () => setState(fresh());

  return { state, current, choose, nextWeek, restart };
}
