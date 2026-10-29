import { useMemo } from 'react';
import { BILLS, STAGES, VOTE_STAGES } from '../data/bills';
import { SEATS } from '../logic/parliament';
import type { GameState, Whip } from '../types';

const TOTAL = 650;

function Chamber({ rebels }: { rebels: number }) {
  const seats = useMemo(() => {
    const rows = 9, r0 = 60, dr = 16;
    const radii = Array.from({ length: rows }, (_, i) => r0 + i * dr);
    const sum = radii.reduce((a, b) => a + b, 0);
    const counts = radii.map((r) => Math.round((TOTAL * r) / sum));
    counts[rows - 1] += TOTAL - counts.reduce((a, b) => a + b, 0);
    const pts: { x: number; y: number; a: number }[] = [];
    radii.forEach((r, i) => {
      for (let k = 0; k < counts[i]; k++) {
        const a = Math.PI * (1 - k / (counts[i] - 1));
        pts.push({ x: 200 + r * Math.cos(a), y: 200 - r * Math.sin(a), a });
      }
    });
    return pts.sort((p, q) => q.a - p.a);
  }, []);

  const color = (i: number) => {
    if (i < SEATS.gov - rebels) return '#3d7a5c';
    if (i < SEATS.gov) return '#c9a24b';
    if (i < SEATS.gov + SEATS.other) return '#8a8a82';
    return '#c0583f';
  };

  return (
    <svg viewBox="0 0 400 210" role="img" aria-label="The House of Commons, 650 seats" className="w-full">
      {seats.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={2.2} fill={color(i)} />)}
      <text x="200" y="196" textAnchor="middle" fill="#e8e2d0" fontSize="14" fontFamily="Playfair Display, serif">650 seats</text>
    </svg>
  );
}

interface Props {
  state: GameState;
  onAdvance: (billId: string, whip: Whip) => void;
  onConfidence: (whip: Whip) => void;
}

const btn = 'border border-paper/30 px-3 py-2 text-left text-sm transition hover:border-brass hover:bg-ink/60 disabled:opacity-40 disabled:hover:border-paper/30';

export default function Parliament({ state, onAdvance, onConfidence }: Props) {
  const v = state.vote;
  return (
    <div className="space-y-6">
      <section className="border border-paper/20 bg-slate/60 p-5">
        <Chamber rebels={v && v.passed !== undefined ? v.rebels : 0} />
        <p className="mt-2 flex flex-wrap justify-center gap-x-5 text-sm">
          <span><span className="text-bench">&#9679;</span> Your party {SEATS.gov}</span>
          <span><span className="text-rust">&#9679;</span> Opposition {SEATS.opp}</span>
          <span><span className="opacity-60">&#9679;</span> Others {SEATS.other}</span>
          <span><span className="text-brass">&#9679;</span> Rebels (last vote)</span>
        </p>
        <p className="mt-1 text-center text-xs italic opacity-70">You need 326 seats for a majority.</p>
      </section>

      {v && (
        <section className={`border p-5 ${v.passed ? 'border-bench' : 'border-rust'}`}>
          <h2 className="font-head text-xl font-bold">{v.bill}: {v.passed ? 'Passed' : 'Defeated'}</h2>
          <p className="text-sm opacity-80">{v.stage}. For {v.forVotes}, against {v.against}. {v.rebels} of your MPs rebelled.</p>
        </section>
      )}

      {state.noConfidence ? (
        <section className="border border-rust bg-slate/60 p-6">
          <h2 className="font-head text-2xl font-bold">A vote of no confidence has been called</h2>
          <p className="mt-2 max-w-prose">The opposition has tabled a motion. You must face the House before the week can go on. Lose, and your government falls.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <button className={btn} onClick={() => onConfidence('normal')}>Face the House as normal</button>
            <button className={btn} onClick={() => onConfidence('three-line')}>Issue a three-line whip (loyalty -4, hostility +5)</button>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <h2 className="font-head text-2xl font-bold">Bills before the House</h2>
          <p className="text-sm italic opacity-70">
            {state.acted ? 'You have used this week\u2019s parliamentary time.' : 'You can move one bill forward each week. Votes happen at Second Reading and Third Reading.'}
          </p>
          {BILLS.map((bill) => {
            const bs = state.bills.find((b) => b.id === bill.id)!;
            const isVote = VOTE_STAGES.includes(bs.stage);
            return (
              <article key={bill.id} className="border border-paper/20 bg-slate/60 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-head text-lg font-bold">{bill.name}</h3>
                  <span className="text-sm opacity-80">
                    {bs.status === 'passed' ? 'Became law' : bs.status === 'failed' ? 'Defeated' : STAGES[bs.stage]}
                  </span>
                </div>
                <p className="text-sm opacity-80">{bill.summary}</p>
                <div className="mt-2 h-1 w-full bg-ink">
                  <div className={`h-full ${bs.status === 'failed' ? 'bg-rust' : 'bg-brass'}`} style={{ width: `${(bs.stage / (STAGES.length - 1)) * 100}%` }} />
                </div>
                {bs.status === 'active' && (
                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    {isVote ? (
                      <>
                        <button className={btn} disabled={state.acted} onClick={() => onAdvance(bill.id, 'normal')}>Hold the vote</button>
                        <button className={btn} disabled={state.acted} onClick={() => onAdvance(bill.id, 'three-line')}>Three-line whip (loyalty -4, integrity -2, hostility +5)</button>
                        <button className={btn} disabled={state.acted} onClick={() => onAdvance(bill.id, 'concession')}>Offer a concession (approval -2, hostility -3)</button>
                      </>
                    ) : (
                      <button className={btn} disabled={state.acted} onClick={() => onAdvance(bill.id, 'normal')}>Move to {STAGES[bs.stage + 1]}</button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
