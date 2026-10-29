import type { Metrics, MetricKey } from '../types';

const ROWS: { key: MetricKey; label: string; color: string; note: string }[] = [
  { key: 'approval', label: 'Public approval', color: 'bg-brass', note: '' },
  { key: 'loyalty', label: 'Party loyalty', color: 'bg-bench', note: '' },
  { key: 'integrity', label: 'Personal integrity', color: 'bg-paper', note: '' },
  { key: 'hostility', label: 'Faction hostility', color: 'bg-rust', note: 'lower is better' },
];

export default function Meters({ metrics }: { metrics: Metrics }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
      {ROWS.map((r) => (
        <div key={r.key}>
          <div className="flex items-baseline justify-between text-sm">
            <span>{r.label}</span>
            <span className="font-semibold">{metrics[r.key]}</span>
          </div>
          <div className="mt-1 h-1.5 w-full bg-slate">
            <div className={`h-full ${r.color} transition-all duration-500`} style={{ width: `${metrics[r.key]}%` }} />
          </div>
          {r.note && <div className="mt-0.5 text-xs italic opacity-60">{r.note}</div>}
        </div>
      ))}
    </div>
  );
}
