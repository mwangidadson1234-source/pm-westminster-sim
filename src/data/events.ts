import type { GameEvent } from '../types';

// Story rules: minWeek, when(), followUp and followUpOnly are explained in types.ts

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
      { label: 'Let the Whips threaten their local funding', result: 'The rebels fall silent, but they will remember this. One of them leaks it to a friendly journalist.', effects: [-2, 5, -9, 10], followUp: 'rebels-leak' },
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
      { label: 'Ride it out and say nothing', result: 'Yields keep climbing for two days. The papers call you complacent.', effects: [-6, 3, -2, 2], followUp: 'bonds-2' },
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

  {
    id: 'rebels-leak', followUpOnly: true,
    from: 'Amelia Strand', role: 'Political Editor, The Daily Courier',
    subject: 'Your Whips threatened MPs\' constituencies',
    body: "Prime Minister, three MPs have told us the Whips threatened their local funding. We publish tomorrow. Will you respond?",
    choices: [
      { label: 'Apologise and sack the Whip responsible', result: 'The story dies in two days. The Whips\' Office is bitter.', effects: [2, -5, 7, -4] },
      { label: 'Say it was a misunderstanding', result: 'Nobody believes you, but nobody can prove it.', effects: [-4, 2, -8, 6] },
      { label: 'Attack the MPs for leaking', result: 'Your loyalists applaud. The rebels now have a cause.', effects: [-3, -4, -3, 12] },
    ],
  },
  {
    id: 'bonds-2', followUpOnly: true,
    from: 'Priya Anand', role: 'Chancellor of the Exchequer',
    subject: 'Yields have jumped again',
    body: "Prime Minister, the markets punished our silence. Borrowing costs are up sharply and the pound is falling. We need emergency action now.",
    choices: [
      { label: 'Cancel a major spending plan', result: 'Calm returns to the markets. Your Cabinet is furious.', effects: [-5, -8, 3, 9] },
      { label: 'Raise taxes on high earners', result: 'The markets steady. Your donors are angry.', effects: [2, -3, 1, 7] },
      { label: 'Ask the central bank to step in quietly', result: 'It works this time, but critics say you are hiding the problem.', effects: [-2, 1, -5, 4] },
    ],
  },
  {
    id: 'nhs-1', minWeek: 3,
    from: 'Dr Samir Baig', role: 'Health Secretary',
    subject: 'Winter pressure on hospitals',
    body: "Prime Minister, A&E waits are at a record high and nurses are threatening to strike. I need emergency funds or I need you to back me in a fight with the Treasury.",
    choices: [
      { label: 'Release emergency funds from reserves', result: 'Wards are staffed through winter. The Chancellor is not pleased.', effects: [7, 1, 3, 5] },
      { label: 'Back the Health Secretary against the Treasury', result: 'A Cabinet row leaks. You look strong on the NHS but divided.', effects: [4, -5, 0, 8] },
      { label: 'Tell hospitals to find efficiencies', result: 'The waiting lists keep growing. Headlines turn cruel.', effects: [-9, 3, -2, 3] },
    ],
  },
  {
    id: 'strike-1', minWeek: 4,
    from: 'Gwen Pryce', role: 'Transport Secretary',
    subject: 'Rail strike deadline',
    body: "Prime Minister, the rail union has set a strike date. They want a 9% pay rise. The operators offer 4%. We have 48 hours.",
    choices: [
      { label: 'Fund the gap to avoid a strike', result: 'Trains keep running. The Chancellor calls it reckless.', effects: [5, -2, 1, 6] },
      { label: 'Hold firm and let the strike happen', result: 'Chaos for commuters. Your base respects your resolve.', effects: [-6, 6, 0, 9] },
      { label: 'Bring in a mediator with a deadline', result: 'A deal is reached, but it satisfies no one.', effects: [1, 0, 2, 3] },
    ],
  },
  {
    id: 'summit-1', minWeek: 5,
    from: 'Helena Voss', role: 'Foreign Secretary',
    subject: 'Invitation to the Brussels summit',
    body: "Prime Minister, allies want a joint statement on sanctions. Supporting it will cost us trade deals. Refusing will isolate us. Which way do we go?",
    choices: [
      { label: 'Sign the joint statement', result: 'You look principled. Some exporters panic.', effects: [3, 1, 5, 6] },
      { label: 'Refuse and protect trade deals', result: 'Business is relieved. Allies lose faith in you.', effects: [-3, 3, -5, 4] },
      { label: 'Sign a watered-down version', result: 'Everyone is mildly disappointed.', effects: [0, 0, 0, 2] },
    ],
  },
  {
    id: 'scandal-1', when: (m) => m.integrity < 40,
    from: 'Duncan Reyes', role: 'Chief Whip',
    subject: 'A minister has been caught',
    body: "Prime Minister, the Industry Minister has been caught using official funds for private flights. After your recent troubles, this will look like a pattern. What do we do?",
    choices: [
      { label: 'Sack the minister now', result: 'You act fast. The minister becomes a bitter backbencher.', effects: [3, -4, 8, 6] },
      { label: 'Stand by the minister', result: 'The papers call the government sleazy.', effects: [-7, 3, -10, 5] },
      { label: 'Order an inquiry and delay', result: 'The story cools, then flares up again next month.', effects: [-2, 0, 1, 3] },
    ],
  },
  {
    id: 'challenge-1', when: (m) => m.loyalty < 35,
    from: 'Duncan Reyes', role: 'Chief Whip',
    subject: 'Letters are going in',
    body: "Prime Minister, backbenchers are sending letters of no confidence. I count nineteen. You need to give them a reason to stop.",
    choices: [
      { label: 'Reshuffle the Cabinet to reward critics', result: 'Some critics are bought off. Some of your allies are bitter.', effects: [-2, 9, -2, 9] },
      { label: 'Give a rousing speech to the backbench committee', result: 'It works if you are a good speaker. The mood lifts.', effects: [2, 7, 2, 3] },
      { label: 'Call their bluff', result: 'A few back down. Others declare open war.', effects: [-3, -2, 0, 14] },
    ],
  },
  {
    id: 'popular-1', when: (m) => m.approval > 65,
    from: 'Rowan Hale', role: 'Deputy Prime Minister',
    subject: 'A word about the future',
    body: "Prime Minister, you are popular right now. People are saying you should call an early election. People are also saying a younger face could lead us for years. Where do you stand?",
    choices: [
      { label: 'Rule out an early election', result: 'You look steady. Your rivals smell weakness.', effects: [-2, 4, 3, 7] },
      { label: 'Hint at an early election', result: 'Markets wobble and your MPs panic about their seats.', effects: [4, -7, -1, 5] },
      { label: 'Promote the Deputy Prime Minister', result: 'You buy peace today and create a rival for tomorrow.', effects: [2, 5, 2, 9] },
    ],
  },
  {
    id: 'triumph-1', minWeek: 6, when: (m) => m.approval > 60 && m.loyalty > 60 && m.integrity > 55,
    from: 'Rowan Hale', role: 'Deputy Prime Minister',
    subject: 'A chance to define your premiership',
    body: "Prime Minister, you have the numbers, the party and the public. This is the moment for a landmark reform. A big win will make you. A failure will be remembered.",
    choices: [
      { label: 'Push the bold reform', result: 'It takes a year of work, but history remembers it. You pay for it now.', effects: [10, 5, 4, 18] },
      { label: 'Pick a safe reform', result: 'It passes easily. Nobody remembers it.', effects: [3, 3, 0, 1] },
      { label: 'Put it off until after the next election', result: 'The party relaxes. The public gets bored.', effects: [-4, 2, -3, 0] },
    ],
  },
];
