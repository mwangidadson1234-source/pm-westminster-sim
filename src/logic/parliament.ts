import type { Difficulty, Effects, Metrics, Whip } from '../types';

// 650 seats. A government needs 326 for a majority.
export const SEATS = { gov: 345, opp: 240, other: 65 };

export const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function applyEffects(m: Metrics, e: Effects): Metrics {
  return {
    approval: clamp(m.approval + e[0]),
    loyalty: clamp(m.loyalty + e[1]),
    integrity: clamp(m.integrity + e[2]),
    hostility: clamp(m.hostility + e[3]),
  };
}

// Low loyalty and controversial bills create rebels. A whip reduces them, at a cost.
export function simulateVote(m: Metrics, controversy: number, whip: Whip) {
  let rebels =
    (SEATS.gov * Math.max(0, 72 - m.loyalty) / 100) * 0.45 +
    (SEATS.gov * controversy / 100) * 0.08;
  if (whip === 'three-line') rebels *= 0.6;
  if (whip === 'concession') rebels *= 0.5;
  rebels = Math.round(Math.max(0, Math.min(SEATS.gov, rebels + (Math.random() * 10 - 5))));

  const othersFor = Math.round((SEATS.other * m.approval) / 150);
  const forVotes = SEATS.gov - rebels + othersFor;
  const against = SEATS.opp + (SEATS.other - othersFor) + rebels;
  return { forVotes, against, rebels, passed: forVotes > against };
}

// Difficulty makes bad news hit harder (hard) or softer (easy)
export function applyScaled(m: Metrics, e: Effects, d: Difficulty): Metrics {
  const k = d === 'easy' ? 0.75 : d === 'hard' ? 1.3 : 1;
  const bad = (v: number, goodWhenPositive: boolean) => ((goodWhenPositive ? v < 0 : v > 0) ? Math.round(v * k) : v);
  return applyEffects(m, [bad(e[0], true), bad(e[1], true), bad(e[2], true), bad(e[3], false)]);
}
