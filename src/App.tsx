import Inbox from './components/Inbox';
import Meters from './components/Meters';
import { useGame } from './hooks/useGame';

export default function App() {
  const { state, current, choose, nextWeek, restart } = useGame();

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
        <Inbox state={state} current={current} onChoose={choose} onNext={nextWeek} />
      )}
    </div>
  );
}
