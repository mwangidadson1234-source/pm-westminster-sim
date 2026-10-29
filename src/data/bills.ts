import type { Bill, Effects, Whip } from '../types';

export const STAGES = ['First Reading', 'Second Reading', 'Committee', 'Report Stage', 'Third Reading', 'Royal Assent'];
export const VOTE_STAGES = [1, 4]; // stages where MPs vote

// What each whipping style costs you: [approval, loyalty, integrity, hostility]
export const WHIP_COST: Record<Whip, Effects> = {
  normal: [0, 0, 0, 0],
  'three-line': [0, -4, -2, 5],
  concession: [-2, 0, 0, -3],
};

// Effects order: [approval, loyalty, integrity, hostility]
export const BILLS: Bill[] = [
  { id: 'nhs', name: 'NHS Funding Bill', summary: 'More money for hospitals. Few MPs object.', controversy: 25, passEffects: [8, 3, 2, 3], failEffects: [-6, -4, 0, 4] },
  { id: 'rural', name: 'Rural Services Bill', summary: 'Buses and broadband for villages. Popular, but costly.', controversy: 35, passEffects: [5, 4, 2, -2], failEffects: [-4, -5, 0, 5] },
  { id: 'energy', name: 'Energy Security Bill', summary: 'Long-term energy supply. Splits the party on costs.', controversy: 45, passEffects: [5, 2, 1, 4], failEffects: [-3, -4, 0, 3] },
  { id: 'police', name: 'Police Powers Bill', summary: 'Tougher powers for police. Liberals in your party object.', controversy: 55, passEffects: [4, 5, -4, 8], failEffects: [-2, -5, 0, 3] },
  { id: 'housing', name: 'Housing Reform Bill', summary: 'Faster planning approvals. MPs in green belt seats hate it.', controversy: 60, passEffects: [7, -3, 0, 6], failEffects: [-3, -6, 0, 4] },
];
