import { getJab } from '../data/pmqs';
import type { PmqsState } from '../types';

export default function Pmqs({ pmqs, onAnswer }: { pmqs: PmqsState; onAnswer: (i: number) => void }) {
  const jab = getJab(pmqs.jabs[pmqs.round]);
  return (
    <section className="border border-brass bg-slate/60 p-6">
      <h2 className="font-head text-2xl font-bold">Prime Minister’s Questions</h2>
      <p className="text-sm italic opacity-70">Question {pmqs.round + 1} of {pmqs.jabs.length}. Careful: a reply your numbers cannot back up becomes a front-page disaster.</p>
      <p className="mt-4 max-w-prose font-semibold">{jab.text}</p>
      <div className="mt-4 space-y-3">
        {jab.replies.map((r, i) => (
          <button key={r.label} onClick={() => onAnswer(i)} className="block w-full border border-paper/30 px-4 py-3 text-left hover:border-brass hover:bg-ink/60">{r.label}</button>
        ))}
      </div>
      {pmqs.headlines.length > 0 && (
        <ul className="mt-5 border-t border-paper/20 pt-3 text-sm italic opacity-80">
          {pmqs.headlines.map((h, i) => <li key={i}>Headline: {h}</li>)}
        </ul>
      )}
    </section>
  );
}
