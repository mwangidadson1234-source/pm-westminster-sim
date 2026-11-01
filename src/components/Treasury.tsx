import { useState } from 'react';
import { GDP, revenue, spending } from '../logic/economy';
import type { Budget, GameState } from '../types';

const FIELDS: { key: keyof Budget; label: string; min: number; max: number; unit: string }[] = [
  { key: 'income', label: 'Income tax', min: 10, max: 60, unit: '%' },
  { key: 'corp', label: 'Corporation tax', min: 15, max: 45, unit: '%' },
  { key: 'vat', label: 'VAT', min: 10, max: 30, unit: '%' },
  { key: 'nhs', label: 'NHS', min: 120, max: 260, unit: 'bn' },
  { key: 'education', label: 'Education', min: 70, max: 160, unit: 'bn' },
  { key: 'defence', label: 'Defence', min: 30, max: 100, unit: 'bn' },
  { key: 'infra', label: 'Infrastructure', min: 20, max: 100, unit: 'bn' },
];

export default function Treasury({ state, onBudget }: { state: GameState; onBudget: (b: Budget) => void }) {
  const [draft, setDraft] = useState<Budget>(state.budget);
  const e = state.economy;
  const unchanged = (Object.keys(draft) as (keyof Budget)[]).every((k) => draft[k] === state.budget[k]);
  const rev = revenue(draft), spend = spending(draft), def = ((spend - rev) / GDP) * 100;
  const stat = (label: string, value: string, bad: boolean) => (
    <div><div className="text-sm opacity-70">{label}</div><div className={`font-head text-xl font-bold ${bad ? 'text-rust' : ''}`}>{value}</div></div>
  );

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 border border-paper/20 bg-slate/60 p-5 md:grid-cols-3">
        {stat('Growth', `${e.growth.toFixed(1)}%`, e.growth < 0)}
        {stat('Deficit', `${e.deficit.toFixed(1)}% of GDP`, e.deficit > 4)}
        {stat('National debt', `${e.debt.toFixed(1)}% of GDP`, e.debt > 105)}
        {stat('Bond yield', `${e.yield.toFixed(1)}%`, e.yield > 6)}
        {stat('NHS waiting list', `${e.waiting.toFixed(1)} million`, e.waiting > 9)}
        {stat('Public services', `${Math.round(e.services)} / 100`, e.services < 92)}
      </section>

      <section className="border border-paper/20 bg-slate/60 p-5">
        <h2 className="font-head text-2xl font-bold">The Budget</h2>
        <p className="text-sm italic opacity-70">
          {state.cooldown > 0 ? `You can present another Budget in ${state.cooldown} week(s).` : 'You can present one Budget every 4 weeks. Raising taxes costs approval. Cutting services costs loyalty.'}
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {FIELDS.map((f) => (
            <label key={f.key} className="block text-sm">
              <span className="flex justify-between"><span>{f.label}</span><span className="font-semibold">{draft[f.key]}{f.unit === '%' ? '%' : ' bn'}</span></span>
              <input type="range" min={f.min} max={f.max} value={draft[f.key]} className="w-full accent-[#c9a24b]"
                onChange={(ev) => setDraft({ ...draft, [f.key]: Number(ev.target.value) })} />
            </label>
          ))}
        </div>
        <p className="mt-4 text-sm">
          Projected: raises {Math.round(rev)} bn, spends {Math.round(spend)} bn, deficit {def.toFixed(1)}% of GDP.
          {def > 5 && <span className="text-rust"> The bond markets will panic at this level.</span>}
        </p>
        <button disabled={state.cooldown > 0 || unchanged} onClick={() => onBudget(draft)}
          className="mt-4 bg-brass px-5 py-2 font-semibold text-ink hover:bg-paper disabled:opacity-40">
          Present the Budget
        </button>
      </section>
    </div>
  );
}
