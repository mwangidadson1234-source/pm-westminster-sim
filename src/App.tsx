import { useState } from 'react';
import Inbox from './components/Inbox';
import Meters from './components/Meters';
import Parliament from './components/Parliament';
import { useGame } from './hooks/useGame';

export default function App() {
  const { state, current, choose, nextWeek, advanceBill, resolveNoConfidence, restart } = useGame();
  const [tab, setTab] = useState<'inbox' | 'parliament'>('inbox');
  const showTab = state.noConfidence ? 'parliament' : tab;

  const tabBtn = (id: 'inbox' | 'parliament', label: string) => (
    <button
      onClick={() => setTab(id)}
      className={`px-4 py-2 font-head text-lg ${showTab === id ? 'border-b-2 border-brass' : 'opacity-60 hover:opacity-100'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="border-y-4 border-double border-paper/40 py-4 text-center">
        <h1 className="font-head text-3xl font-black md:text-5xl">Prime Minister: Westminster Simulator</h1>
        <p className="mt-1 text-sm italic opacity-70">Week {state.week} in office</p>
      </header>

      <section className="my-6">
        <Meters metrics={state.metrics} />
      </section>

      {state.ended ? (
        <div className="border border-rust p-8 text-center">
          <h2 className="font-head text-3xl font-bold">Your premiership is over</h2>
          <p className="mx-auto mt-3 max-w-prose">{state.ended}</p>
          <p className="mt-2 text-sm opacity-70">You lasted {state.week} weeks.</p>
          <button onClick={restart} className="mt-6 bg-brass px-5 py-2 font-semibold text-ink hover:bg-paper">
            Start a new premiership
          </button>
        </div>
      ) : (
        <>
          <nav className="mb-5 flex gap-2 border-b border-paper/20">
            {tabBtn('inbox', 'Inbox')}
            {tabBtn('parliament', state.noConfidence ? 'Parliament (vote called)' : 'Parliament')}
          </nav>
          {showTab === 'inbox' ? (
            <Inbox state={state} current={current} onChoose={choose} onNext={nextWeek} />
          ) : (
            <Parliament state={state} onAdvance={advanceBill} onConfidence={resolveNoConfidence} />
          )}
        </>
      )}
    </div>
  );
}
