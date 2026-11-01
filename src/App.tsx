import { useState } from 'react';
import Inbox from './components/Inbox';
import Meters from './components/Meters';
import { Manifesto, StartScreen } from './components/Manifesto';
import Parliament from './components/Parliament';
import Pmqs from './components/Pmqs';
import Treasury from './components/Treasury';
import { useGame } from './hooks/useGame';

type Tab = 'inbox' | 'parliament' | 'treasury' | 'manifesto';
const TABS: [Tab, string][] = [['inbox', 'Inbox'], ['parliament', 'Parliament'], ['treasury', 'Treasury'], ['manifesto', 'Manifesto']];

export default function App() {
  const g = useGame();
  const { state } = g;
  const [tab, setTab] = useState<Tab>('inbox');
  const showTab: Tab = state.noConfidence ? 'parliament' : tab;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="border-y-4 border-double border-paper/40 py-4 text-center">
        <h1 className="font-head text-3xl font-black md:text-5xl">Prime Minister: Westminster Simulator</h1>
        {state.started && <p className="mt-1 text-sm italic opacity-70">Week {state.week} of 52 until the election</p>}
      </header>

      {!state.started ? (
        <div className="mt-6"><StartScreen onStart={g.startGame} /></div>
      ) : (
        <>
          <section className="my-6"><Meters metrics={state.metrics} /></section>
          {state.report.length > 0 && !state.ended && (
            <ul className="mb-5 border-l-4 border-brass bg-slate/60 px-4 py-2 text-sm italic">
              {state.report.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          )}
          {state.ended ? (
            <div className={`border p-8 text-center ${state.victory ? 'border-bench' : 'border-rust'}`}>
              <h2 className="font-head text-3xl font-bold">{state.victory ? 'You have won the election' : 'Your premiership is over'}</h2>
              <p className="mx-auto mt-3 max-w-prose">{state.ended}</p>
              <p className="mt-2 text-sm opacity-70">
                You lasted {state.week} weeks. Bills passed: {state.bills.filter((b) => b.status === 'passed').length}.
                Pledges delivered: {state.pledges.filter((p) => p.status === 'delivered').length} of {state.pledges.length}.
              </p>
              <button onClick={g.restart} className="mt-6 bg-brass px-5 py-2 font-semibold text-ink hover:bg-paper">Start a new premiership</button>
            </div>
          ) : state.pmqs && !state.noConfidence ? (
            <Pmqs pmqs={state.pmqs} onAnswer={g.answerPmqs} />
          ) : (
            <>
              <nav className="mb-5 flex flex-wrap gap-2 border-b border-paper/20">
                {TABS.map(([id, label]) => (
                  <button key={id} onClick={() => setTab(id)}
                    className={`px-4 py-2 font-head text-lg ${showTab === id ? 'border-b-2 border-brass' : 'opacity-60 hover:opacity-100'}`}>
                    {id === 'parliament' && state.noConfidence ? 'Parliament (vote called)' : label}
                  </button>
                ))}
              </nav>
              {showTab === 'inbox' && <Inbox state={state} current={g.current} onChoose={g.choose} onNext={g.nextWeek} />}
              {showTab === 'parliament' && <Parliament state={state} onAdvance={g.advanceBill} onConfidence={g.resolveNoConfidence} />}
              {showTab === 'treasury' && <Treasury state={state} onBudget={g.setBudget} />}
              {showTab === 'manifesto' && <Manifesto state={state} />}
            </>
          )}
        </>
      )}
    </div>
  );
}
