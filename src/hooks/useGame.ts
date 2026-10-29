import { useEffect, useState } from 'react';
import { EVENTS } from '../data/events';
import { BILLS, STAGES, VOTE_STAGES, WHIP_COST } from '../data/bills';
import { applyEffects, simulateVote } from '../logic/parliament';
import type { BillState, Choice, GameState, Metrics, VoteResult, Whip } from '../types';

const KEY = 'pm-westminster-save-v3';

const fresh = (): GameState => ({
  week: 1,
  metrics: { approval: 50, loyalty: 55, integrity: 60, hostility: 25 },
  currentId: EVENTS[0].id,
  seen: [EVENTS[0].id],
  queue: [],
  history: [],
  bills: BILLS.map((b) => ({ id: b.id, stage: 0, status: 'active' as const })),
  vote: null,
  noConfidence: false,
  acted: false,
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
      if (s.lastResult || s.ended || s.noConfidence) return s;
      const metrics = applyEffects(s.metrics, choice.effects);
      const [a, l, i, h] = choice.effects;
      return {
        ...s,
        metrics,
        queue: choice.followUp ? [...s.queue, choice.followUp] : s.queue,
        history: [...s.history, { id: s.currentId, week: s.week, choice: choice.label }],
        lastResult: { text: choice.result, deltas: { approval: a, loyalty: l, integrity: i, hostility: h } },
        ended: checkEnd(metrics),
      };
    });
  }

  function nextWeek() {
    setState((s) => {
      if (s.ended || !s.lastResult || s.noConfidence) return s;
      const next = pickNext(s);
      const m = s.metrics;
      // Weak leaders get challenged
      const noConfidence = (m.loyalty < 25 && Math.random() < 0.5) || (m.integrity < 20 && Math.random() < 0.3);
      return {
        ...s,
        week: s.week + 1,
        currentId: next.id,
        seen: [...next.seen, next.id].filter((v, i, a) => a.indexOf(v) === i),
        queue: next.queue,
        lastResult: null,
        acted: false,
        noConfidence,
      };
    });
  }

  // Move one bill forward one stage. Only one parliamentary action per week.
  function advanceBill(billId: string, whip: Whip) {
    setState((s) => {
      if (s.acted || s.ended || s.noConfidence) return s;
      const bs = s.bills.find((b) => b.id === billId);
      const bill = BILLS.find((b) => b.id === billId);
      if (!bs || !bill || bs.status !== 'active') return s;

      let m = s.metrics;
      let vote: VoteResult | null = s.vote;
      let status: BillState['status'] = 'active';
      let stage = bs.stage + 1;

      if (VOTE_STAGES.includes(bs.stage)) {
        const v = simulateVote(s.metrics, bill.controversy, whip);
        vote = { bill: bill.name, stage: STAGES[bs.stage], whip, ...v };
        m = applyEffects(m, WHIP_COST[whip]);
        if (!v.passed) {
          status = 'failed';
          stage = bs.stage;
          m = applyEffects(m, bill.failEffects);
        }
      }
      if (status === 'active' && stage === STAGES.length - 1) {
        status = 'passed';
        m = applyEffects(m, bill.passEffects);
      }
      return {
        ...s,
        metrics: m,
        vote,
        acted: true,
        bills: s.bills.map((b) => (b.id === billId ? { ...b, stage, status } : b)),
        ended: checkEnd(m),
      };
    });
  }

  function resolveNoConfidence(whip: Whip) {
    setState((s) => {
      if (!s.noConfidence || s.ended) return s;
      const v = simulateVote(s.metrics, 50, whip);
      const vote: VoteResult = { bill: 'Motion of no confidence', stage: 'Vote in the House', whip, ...v };
      if (!v.passed) {
        return { ...s, vote, noConfidence: false, ended: 'You lose a vote of no confidence in the House of Commons. Your government falls.' };
      }
      const m = applyEffects(applyEffects(s.metrics, WHIP_COST[whip]), [-2, 8, 0, 3]);
      return { ...s, vote, metrics: m, noConfidence: false, ended: checkEnd(m) };
    });
  }

  const restart = () => setState(fresh());

  return { state, current, choose, nextWeek, advanceBill, resolveNoConfidence, restart };
}
