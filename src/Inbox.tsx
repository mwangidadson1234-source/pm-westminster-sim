import { EVENTS } from '../data/events';
import type { Choice, GameEvent, GameState } from '../types';

const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);

interface Props {
  state: GameState;
  current: GameEvent;
  onChoose: (c: Choice) => void;
  onNext: () => void;
}

export default function Inbox({ state, current, onChoose, onNext }: Props) {
  const labels: [string, number][] = state.lastResult
    ? [
        ['Approval', state.lastResult.deltas.approval],
        ['Loyalty', state.lastResult.deltas.loyalty],
        ['Integrity', state.lastResult.deltas.integrity],
        ['Hostility', state.lastResult.deltas.hostility],
      ]
    : [];

  return (
    <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
      <aside className="border border-paper/20 bg-slate/60">
        <h2 className="border-b border-paper/20 px-4 py-2 font-head text-lg">Inbox</h2>
        <ul>
          <li className="border-l-4 border-brass bg-ink/50 px-4 py-3 text-sm">
            <div className="font-semibold">{current.from}</div>
            <div className="opacity-80">{current.subject}</div>
          </li>
          {[...state.history].reverse().map((h, i) => {
            const e = EVENTS.find((x) => x.id === h.id);
            return (
              <li key={i} className="border-t border-paper/10 px-4 py-3 text-sm opacity-60">
                <div>Week {h.week}: {e?.from}</div>
                <div>{e?.subject}</div>
              </li>
            );
          })}
        </ul>
      </aside>

      <article className="border border-paper/20 bg-slate/60 p-6">
        <div className="text-sm opacity-70">{current.role}</div>
        <h2 className="mt-1 font-head text-2xl font-bold leading-tight">{current.subject}</h2>
        <div className="mt-1 text-sm italic opacity-70">From {current.from}</div>
        <p className="mt-5 max-w-prose">{current.body}</p>

        {!state.lastResult && (
          <div className="mt-6 space-y-3">
            {current.choices.map((c) => (
              <button
                key={c.label}
                onClick={() => onChoose(c)}
                className="block w-full border border-paper/30 px-4 py-3 text-left transition hover:border-brass hover:bg-ink/60"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {state.lastResult && (
          <div className="mt-6 border-t border-paper/20 pt-5">
            <p className="max-w-prose italic">{state.lastResult.text}</p>
            <p className="mt-4 flex flex-wrap gap-x-5 text-sm">
              {labels.map(([name, v]) => (
                <span key={name}>{name} {sign(v)}</span>
              ))}
            </p>
            {!state.ended && (
              <button onClick={onNext} className="mt-5 bg-brass px-5 py-2 font-semibold text-ink hover:bg-paper">
                Go to next week
              </button>
            )}
          </div>
        )}
      </article>
    </div>
  );
}
