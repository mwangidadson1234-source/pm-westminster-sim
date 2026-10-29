import { useEffect, useState } from 'react';
import { EVENTS } from '../data/events';
import type { Choice, GameState, Metrics } from '../types';

const KEY = 'pm-westminster-save-v1';
const clamp = (n: number) => Math.max(0, Math.min(100, n));

const fresh = (): GameState => ({
  week: 1,
  metrics: { approval: 50, loyalty: 55, integrity: 60, hostility: 25 },
  currentId: EVENTS[0].id,
  seen: [EVENTS[0].id],
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
        history: [...s.history, { id: s.currentId, week: s.week, choice: choice.label }],
        lastResult: { text: choice.result, deltas: { approval: a, loyalty: l, integrity: i, hostility: h } },
        ended: checkEnd(metrics),
      };
    });
  }

  function nextWeek() {
    setState((s) => {
      if (s.ended || !s.lastResult) return s;
      let pool = EVENTS.filter((e) => !s.seen.includes(e.id));
      let seen = s.seen;
      if (pool.length === 0) {
        pool = EVENTS.filter((e) => e.id !== s.currentId);
        seen = [];
      }
      const next = pool[Math.floor(Math.random() * pool.length)];
      return { ...s, week: s.week + 1, currentId: next.id, seen: [...seen, next.id], lastResult: null };
    });
  }

  const restart = () => setState(fresh());

  return { state, current, choose, nextWeek, restart };
}
