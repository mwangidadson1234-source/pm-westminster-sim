import type { GameEvent } from '../types';

// Effects order: [approval, loyalty, integrity, hostility]
// Hostility is BAD when it rises. No option is free: every choice costs something.
export const EVENTS: GameEvent[] = [
  {
    id: 'rebels-1',
    from: 'Duncan Reyes',
    role: 'Chief Whip',
    subject: 'Fourteen backbenchers are wobbling',
    body:
      "Prime Minister, a group of backbenchers is angry about the Rural Services Bill. They say you ignored them in the manifesto. I can bring them back in line, but it will cost you something. Which way do you want to play it?",
    choices: [
      { label: 'Invite the rebels to Downing Street for a private dinner', result: 'The dinner is warm and expensive. The rebels leave flattered, but the press hears about the guest list.', effects: [-3, 8, -4, 4] },
      { label: 'Let the Whips threaten their local funding', result: 'The rebels fall silent, but they will remember this. One of them leaks it to a friendly journalist.', effects: [-2, 5, -9, 10] },
      { label: 'Make a public concession in the Bill', result: 'Voters like the compromise. Your own wing calls it weak.', effects: [6, -6, 3, -2] },
    ],
  },
  {
    id: 'bonds-1',
    from: 'Priya Anand',
    role: 'Chancellor of the Exchequer',
    subject: 'The markets are getting nervous',
    body:
      "Prime Minister, gilt yields rose again overnight. Traders think our borrowing plans are too loose. I can announce a spending freeze, or we can ride it out and hope the mood passes. I need your decision before the markets open.",
    choices: [
      { label: 'Announce a three-month spending freeze', result: 'The markets calm down. Ministers are furious that their budgets are frozen.', effects: [-4, -7, 4, 6] },
      { label: 'Ride it out and say nothing', result: 'Yields keep climbing for two days. The papers call you complacent.', effects: [-6, 3, -2, 2] },
      { label: 'Blame the previous government in a broadcast', result: 'Your base cheers. The opposition calls you evasive, and the facts are not on your side.', effects: [3, 6, -8, 9] },
    ],
  },
  {
    id: 'prisons-1',
    from: 'Marcus Okafor',
    role: 'Home Secretary',
    subject: 'Prisons are full by Friday',
    body:
      "Prime Minister, we run out of cells this week. I can release low-risk prisoners early, open emergency cells in police stations, or ask the Defence Secretary for temporary military sites. Each one will be a headline.",
    choices: [
      { label: 'Release low-risk prisoners early', result: 'The crisis eases. The opposition calls you soft on crime.', effects: [-6, -3, 2, 8] },
      { label: 'Use emergency police station cells', result: 'It works for now. Police unions warn this cannot last.', effects: [1, 4, -3, 5] },
      { label: 'Ask for temporary military sites', result: 'It looks decisive. Rights groups and several of your own MPs object loudly.', effects: [4, 2, -6, 7] },
    ],
  },
  {
    id: 'leak-1',
    from: 'Amelia Strand',
    role: 'Political Editor, The Daily Courier',
    subject: 'Comment on a leaked memo',
    body:
      "Prime Minister, we have a leaked internal memo that suggests Number 10 knew about the school repairs overspend three months ago. We run at 6pm. Do you want to comment?",
    choices: [
      { label: 'Admit it and promise a review', result: 'The story is bad, but the honesty softens it. Your MPs wince.', effects: [-2, -4, 9, -3] },
      { label: 'Deny it and attack the paper', result: 'You survive the day. The memo is real, and everyone in the Cabinet knows it.', effects: [2, 5, -12, 11] },
      { label: 'Refuse to comment', result: 'The paper runs the story with a "No comment" line. The silence looks guilty.', effects: [-5, 1, -3, 4] },
    ],
  },
];
