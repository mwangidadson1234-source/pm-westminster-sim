import { useEffect, useState } from 'react';
import { EVENTS } from '../data/events';
import { BILLS, STAGES, VOTE_STAGES, WHIP_COST } from '../data/bills';
import { PLEDGES } from '../data/pledges';
import { DISASTER, DISASTER_HEADLINE, JABS, getJab } from '../data/pmqs';
import { BASE_BUDGET, START_ECONOMY, deficitPct, nextEconomy, weeklyPressure } from '../logic/economy';
import { applyScaled, simulateVote } from '../logic/parliament';
import type { BillState, Budget, Choice, Difficulty, Effects, GameState, Metrics, PmqsState, VoteResult, Whip } from '../types';

const KEY = 'pm-westminster-save-v4';

const fresh = (): GameState => ({
  started: false, difficulty: 'normal', victory: false,
  week: 1, metrics: { approval: 50, loyalty: 55, integrity: 60, hostility: 25 },
  currentId: EVENTS[0].id, seen: [EVENTS[0].id], queue: [], history: [],
  bills: BILLS.map((b) => ({ id: b.id, stage: 0, status: 'active' as const })),
  vote: null, noConfidence: false, acted: false,
  budget: { ...BASE_BUDGET }, economy: { ...START_ECONOMY }, cooldown: 0,
  pledges: [], pmqs: null, report: [], lastResult: null, ended: null,
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
  if (s.queue.length > 0) return { id: s.queue[0], seen: s.seen, queue: s.queue.slice(1) };
  const ok = (id: string, seen: string[]) => {
    const e = EVENTS.find((x) => x.id === id)!;
    return !e.followUpOnly && !seen.includes(id) && id !== s.currentId && s.week + 1 >= (e.minWeek ?? 1) && (!e.when || e.when(s.metrics));
  };
  let seen = s.seen;
  let pool = EVENTS.filter((e) => ok(e.id, seen));
  if (pool.length === 0) { seen = []; pool = EVENTS.filter((e) => ok(e.id, seen)); }
  if (pool.length === 0) pool = [EVENTS[0]];
  const reactive = pool.filter((e) => e.when);
  const from = reactive.length > 0 && Math.random() < 0.7 ? reactive : pool;
  const next = from[Math.floor(Math.random() * from.length)];
  return { id: next.id, seen: [...seen, next.id], queue: [] };
}

// Checks every manifesto pledge you chose
function evalPledges(s: GameState): GameState {
  let m = s.metrics;
  const notes: string[] = [];
  const pledges = s.pledges.map((p) => {
    if (p.status !== 'progress') return p;
    const def = PLEDGES.find((d) => d.id === p.id)!;
    const r = def.check(s);
    if (!r) return p;
    m = applyScaled(m, r === 'delivered' ? [4, 3, 0, -2] : [-4, -3, -8, 6], s.difficulty);
    notes.push(r === 'delivered' ? `Pledge delivered: ${def.text}.` : `Pledge broken: ${def.text}. The opposition will use it.`);
    return { ...p, status: r };
  });
  return { ...s, pledges, metrics: m, report: [...s.report, ...notes] };
}

function startPmqs(s: GameState): PmqsState {
  const pool = JABS.map((j) => j.id).sort(() => Math.random() - 0.5);
  const broken = s.pledges.find((p) => p.status === 'broken');
  return { round: 0, jabs: broken ? [pool[0], pool[1], 'pledge:' + broken.id] : pool.slice(0, 3), headlines: [] };
}

function election(s: GameState): GameState {
  const m = s.metrics;
  const delivered = s.pledges.filter((p) => p.status === 'delivered').length;
  const broken = s.pledges.filter((p) => p.status === 'broken').length;
  const score = Math.round(
    m.approval * 0.45 + m.loyalty * 0.15 + m.integrity * 0.15 + (100 - m.hostility) * 0.1 +
    delivered * 5 - broken * 6 + (s.economy.growth < 0 ? -4 : s.economy.growth > 2 ? 3 : 0));
  const text = score >= 60
    ? `Election night: a landslide. You are returned with a large majority. Final score ${score}.`
    : score >= 50
    ? `Election night: a narrow win. You scrape back in with a small majority. Final score ${score}.`
    : `Election night: the voters have had enough. You lose the election. Final score ${score}.`;
  return { ...s, ended: text, victory: score >= 50 };
}

export function useGame() {
  const [state, setState] = useState<GameState>(() => {
    try { const saved = localStorage.getItem(KEY); return saved ? (JSON.parse(saved) as GameState) : fresh(); } catch { return fresh(); }
  });
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ } }, [state]);

  const current = EVENTS.find((e) => e.id === state.currentId) ?? EVENTS[0];

  function startGame(ids: string[], difficulty: Difficulty) {
    setState((s) => ({ ...s, started: true, difficulty, pledges: ids.map((id) => ({ id, status: 'progress' as const })) }));
  }

  function choose(choice: Choice) {
    setState((s) => {
      if (s.lastResult || s.ended || s.noConfidence || s.pmqs) return s;
      const metrics = applyScaled(s.metrics, choice.effects, s.difficulty);
      const [a, l, i, h] = choice.effects;
      return {
        ...s, metrics,
        queue: choice.followUp ? [...s.queue, choice.followUp] : s.queue,
        history: [...s.history, { id: s.currentId, week: s.week, choice: choice.label }],
        lastResult: { text: choice.result, deltas: { approval: a, loyalty: l, integrity: i, hostility: h } },
        ended: checkEnd(metrics),
      };
    });
  }

  function nextWeek() {
    setState((s) => {
      if (s.ended || !s.lastResult || s.noConfidence || s.pmqs) return s;
      const next = pickNext(s);
      const week = s.week + 1;
      const economy = nextEconomy(s.economy, s.budget);
      const p = weeklyPressure(economy, s.budget);
      const metrics = applyScaled(s.metrics, p.fx, s.difficulty);
      const noConfidence = (metrics.loyalty < 25 && Math.random() < 0.5) || (metrics.integrity < 20 && Math.random() < 0.3);
      let ns: GameState = {
        ...s, week, economy, metrics, report: p.notes, currentId: next.id,
        seen: [...next.seen, next.id].filter((v, i, a) => a.indexOf(v) === i),
        queue: next.queue, lastResult: null, acted: false, noConfidence, cooldown: Math.max(0, s.cooldown - 1), pmqs: null,
      };
      ns = evalPledges(ns);
      if (week % 6 === 0) ns.pmqs = startPmqs(ns);
      ns.ended = checkEnd(ns.metrics);
      if (!ns.ended && week >= 52) ns = election(ns);
      return ns;
    });
  }

  function advanceBill(billId: string, whip: Whip) {
    setState((s) => {
      if (s.acted || s.ended || s.noConfidence || s.pmqs) return s;
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
        m = applyScaled(m, WHIP_COST[whip], s.difficulty);
        if (!v.passed) { status = 'failed'; stage = bs.stage; m = applyScaled(m, bill.failEffects, s.difficulty); }
      }
      if (status === 'active' && stage === STAGES.length - 1) { status = 'passed'; m = applyScaled(m, bill.passEffects, s.difficulty); }
      let ns: GameState = { ...s, metrics: m, vote, acted: true, bills: s.bills.map((b) => (b.id === billId ? { ...b, stage, status } : b)) };
      ns = evalPledges(ns);
      return { ...ns, ended: checkEnd(ns.metrics) };
    });
  }

  function resolveNoConfidence(whip: Whip) {
    setState((s) => {
      if (!s.noConfidence || s.ended) return s;
      const v = simulateVote(s.metrics, 50, whip);
      const vote: VoteResult = { bill: 'Motion of no confidence', stage: 'Vote in the House', whip, ...v };
      if (!v.passed) return { ...s, vote, noConfidence: false, ended: 'You lose a vote of no confidence in the House of Commons. Your government falls.' };
      const m = applyScaled(applyScaled(s.metrics, WHIP_COST[whip], s.difficulty), [-2, 8, 0, 3], s.difficulty);
      return { ...s, vote, metrics: m, noConfidence: false, ended: checkEnd(m) };
    });
  }

  // Present a new Budget. You can do this once every 4 weeks.
  function setBudget(nb: Budget) {
    setState((s) => {
      if (s.cooldown > 0 || s.ended) return s;
      const d = (k: keyof Budget) => nb[k] - s.budget[k];
      const spend = d('nhs') + d('education') + d('defence') + d('infra');
      const fx: Effects = [
        Math.round(-(d('income') * 1.2 + d('vat') * 0.8 + d('corp') * 0.2) + (d('nhs') + d('education')) * 0.05),
        Math.round(spend * 0.05), 0, Math.round(Math.max(0, d('income') + d('vat')) * 0.5),
      ];
      let ns: GameState = { ...s, budget: nb, cooldown: 4, metrics: applyScaled(s.metrics, fx, s.difficulty), economy: { ...s.economy, deficit: deficitPct(nb) } };
      ns = evalPledges(ns);
      return { ...ns, ended: checkEnd(ns.metrics) };
    });
  }

  function answerPmqs(i: number) {
    setState((s) => {
      if (!s.pmqs || s.ended) return s;
      const reply = getJab(s.pmqs.jabs[s.pmqs.round]).replies[i];
      const fail = reply.needs ? !reply.needs(s.metrics) : false;
      const metrics = applyScaled(s.metrics, fail ? DISASTER : reply.effects, s.difficulty);
      const headlines = [...s.pmqs.headlines, fail ? DISASTER_HEADLINE : reply.headline];
      const done = s.pmqs.round + 1 >= s.pmqs.jabs.length;
      return {
        ...s, metrics, ended: checkEnd(metrics),
        pmqs: done ? null : { ...s.pmqs, round: s.pmqs.round + 1, headlines },
        report: done ? ['Front pages after PMQs: ' + headlines.join('; ') + '.'] : s.report,
      };
    });
  }

  const restart = () => setState(fresh());
  return { state, current, startGame, choose, nextWeek, advanceBill, resolveNoConfidence, setBudget, answerPmqs, restart };
}
