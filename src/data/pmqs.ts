import { PLEDGES } from './pledges';
import type { Effects, Metrics } from '../types';

export interface Reply { label: string; effects: Effects; headline: string; needs?: (m: Metrics) => boolean; }
export interface Jab { id: string; text: string; replies: Reply[]; }

// A reply with a "needs" rule becomes a disaster if your numbers cannot back it up
export const DISASTER: Effects = [-8, -3, -3, 4];
export const DISASTER_HEADLINE = 'PM humiliated at the Despatch Box';

export const JABS: Jab[] = [
  { id: 'cost', text: 'Families are struggling while the Prime Minister lectures them. When will the PM admit the government is out of touch?', replies: [
    { label: 'Quote the latest growth and wage figures', effects: [3, 2, 1, 2], headline: 'PM defends record on living costs', needs: (m) => m.approval > 45 },
    { label: 'Blame global prices', effects: [0, 3, -2, 4], headline: 'PM blames world markets' },
    { label: 'Offer the Leader of the Opposition a private meeting', effects: [-3, -2, 2, -2], headline: 'PM offers talks, seen as weak' } ] },
  { id: 'nhs', text: 'Waiting lists are climbing. Will the PM guarantee that every patient is seen on time?', replies: [
    { label: 'Promise a guarantee', effects: [4, 2, -3, 3], headline: 'PM makes bold NHS guarantee', needs: (m) => m.integrity > 50 },
    { label: 'Point to record NHS funding', effects: [2, 3, 0, 3], headline: 'PM stands on NHS record' },
    { label: 'Accuse the opposition of scaremongering', effects: [-1, 4, -2, 7], headline: 'PM trades blows over NHS' } ] },
  { id: 'lead', text: 'Is the Prime Minister in charge, or is the Cabinet?', replies: [
    { label: 'Say your party is united behind you', effects: [2, 3, 0, 3], headline: 'PM insists party is united', needs: (m) => m.loyalty > 45 },
    { label: 'Make a joke at the opposition leader\u2019s expense', effects: [3, 4, -2, 6], headline: 'PM wins laughs in the Commons' },
    { label: 'Give a long, serious answer', effects: [-2, -1, 3, -2], headline: 'PM gives dull answer' } ] },
  { id: 'sleaze', text: 'Will the Prime Minister promise there will be no more scandals in this government?', replies: [
    { label: 'Promise a full public inquiry', effects: [3, -2, 4, -2], headline: 'PM promises scandal inquiry', needs: (m) => m.integrity > 45 },
    { label: 'Say the government has nothing to hide', effects: [1, 3, -4, 5], headline: 'PM says nothing to hide' },
    { label: 'Change the subject to the economy', effects: [-3, 1, -3, 3], headline: 'PM dodges the question' } ] },
];

export const pledgeJab = (text: string): Jab => ({
  id: 'pledge',
  text: `You promised "${text}". Why did the Prime Minister break that promise?`,
  replies: [
    { label: 'Admit it and explain why', effects: [-2, 0, 3, 0], headline: 'PM admits broken promise' },
    { label: 'Insist nothing was broken', effects: [2, 2, -4, 5], headline: 'PM denies broken promise', needs: (m) => m.integrity > 55 },
    { label: 'Attack the opposition\u2019s record', effects: [1, 4, -2, 8], headline: 'PM hits back in noisy exchange' },
  ],
});

export const getJab = (id: string): Jab =>
  id.startsWith('pledge:') ? pledgeJab(PLEDGES.find((p) => p.id === id.slice(7))?.text ?? 'your manifesto') : JABS.find((j) => j.id === id) ?? JABS[0];
