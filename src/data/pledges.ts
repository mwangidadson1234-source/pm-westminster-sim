import { BASE_BUDGET } from '../logic/economy';
import type { GameState } from '../types';

export interface Pledge { id: string; text: string; check: (s: GameState) => 'delivered' | 'broken' | null; }
const bill = (s: GameState, id: string) => s.bills.find((b) => b.id === id)?.status;

// Pick 3 at the start. Delivered pledges help you. Broken pledges are used against you at PMQs.
export const PLEDGES: Pledge[] = [
  { id: 'income', text: 'No rise in income tax', check: (s) => (s.budget.income > BASE_BUDGET.income ? 'broken' : s.week >= 48 ? 'delivered' : null) },
  { id: 'vat', text: 'No rise in VAT', check: (s) => (s.budget.vat > BASE_BUDGET.vat ? 'broken' : s.week >= 48 ? 'delivered' : null) },
  { id: 'nhs', text: 'Protect NHS spending', check: (s) => (s.budget.nhs < BASE_BUDGET.nhs ? 'broken' : s.week >= 48 ? 'delivered' : null) },
  { id: 'deficit', text: 'Cut the deficit below 1.5% of GDP', check: (s) => (s.economy.deficit <= 1.5 ? 'delivered' : s.week >= 40 ? 'broken' : null) },
  { id: 'police', text: 'Pass the Police Powers Bill', check: (s) => (bill(s, 'police') === 'passed' ? 'delivered' : bill(s, 'police') === 'failed' ? 'broken' : null) },
  { id: 'housing', text: 'Pass the Housing Reform Bill', check: (s) => (bill(s, 'housing') === 'passed' ? 'delivered' : bill(s, 'housing') === 'failed' ? 'broken' : null) },
];
