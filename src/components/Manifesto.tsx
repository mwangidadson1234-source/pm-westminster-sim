import { useState } from 'react';
import { PLEDGES } from '../data/pledges';
import type { Difficulty, GameState } from '../types';

const LABEL = { progress: 'In progress', delivered: 'Delivered', broken: 'Broken' };
const COLOR = { progress: 'text-brass', delivered: 'text-bench', broken: 'text-rust' };

export function Manifesto({ state }: { state: GameState }) {
  return (
    <section className="space-y-3">
      <h2 className="font-head text-2xl font-bold">Your manifesto</h2>
      <p className="text-sm italic opacity-70">Delivered pledges raise your standing. Broken pledges cost integrity and are used against you at PMQs.</p>
      {state.pledges.map((p) => (
        <div key={p.id} className="flex items-baseline justify-between border border-paper/20 bg-slate/60 px-4 py-3">
          <span>{PLEDGES.find((d) => d.id === p.id)?.text}</span>
          <span className={`text-sm font-semibold ${COLOR[p.status]}`}>{LABEL[p.status]}</span>
        </div>
      ))}
    </section>
  );
}

export function StartScreen({ onStart }: { onStart: (ids: string[], d: Difficulty) => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [diff, setDiff] = useState<Difficulty>('normal');
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 3 ? [...p, id] : p));
  const opt = (on: boolean) => `block w-full border px-4 py-3 text-left ${on ? 'border-brass bg-ink/60' : 'border-paper/30 hover:border-brass'}`;

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-head text-2xl font-bold">Choose three manifesto pledges</h2>
        <p className="text-sm italic opacity-70">Every pledge you keep helps at the election. Every pledge you break will be thrown back at you.</p>
        <div className="mt-3 space-y-2">
          {PLEDGES.map((p) => <button key={p.id} className={opt(picked.includes(p.id))} onClick={() => toggle(p.id)}>{p.text}</button>)}
        </div>
      </section>
      <section>
        <h2 className="font-head text-2xl font-bold">Difficulty</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {(['easy', 'normal', 'hard'] as Difficulty[]).map((d) => (
            <button key={d} className={opt(diff === d)} onClick={() => setDiff(d)}>
              {d === 'easy' ? 'Easy: bad news hits softer' : d === 'normal' ? 'Normal' : 'Hard: bad news hits much harder'}
            </button>
          ))}
        </div>
      </section>
      <p className="text-sm italic opacity-70">You have 52 weeks until the general election. Survive, deliver, and win.</p>
      <button disabled={picked.length !== 3} onClick={() => onStart(picked, diff)}
        className="bg-brass px-5 py-2 font-semibold text-ink hover:bg-paper disabled:opacity-40">
        Enter Downing Street ({picked.length}/3 pledges)
      </button>
    </div>
  );
}
