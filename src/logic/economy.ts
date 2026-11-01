import type { Budget, Economy, Effects } from '../types';

export const GDP = 2800;     // £bn
const FIXED = 260;           // welfare, debt interest and other fixed costs, £bn
export const BASE_BUDGET: Budget = { income: 20, corp: 25, vat: 20, nhs: 180, education: 110, defence: 60, infra: 50 };

const lim = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
// Laffer curve: past a point, higher rates raise less money
const laffer = (rate: number, start: number, k: number) => (rate > start ? Math.max(0.2, 1 - (rate - start) * k) : 1);

export const revenue = (b: Budget) =>
  14 * b.income * laffer(b.income, 45, 0.04) + 3.2 * b.corp * laffer(b.corp, 30, 0.05) + 12 * b.vat * laffer(b.vat, 25, 0.05);
export const spending = (b: Budget) => b.nhs + b.education + b.defence + b.infra + FIXED;
export const deficitPct = (b: Budget) => ((spending(b) - revenue(b)) / GDP) * 100;
export const servicesIndex = (b: Budget) =>
  lim(100 * ((b.nhs / 180) * 0.4 + (b.education / 110) * 0.3 + (b.defence / 60) * 0.15 + (b.infra / 50) * 0.15), 0, 130);
const yieldOf = (debt: number, deficit: number) => 3 + Math.max(0, debt - 85) * 0.08 + Math.max(0, deficit - 2) * 0.7;

export const START_ECONOMY: Economy = {
  growth: 1.5, deficit: deficitPct(BASE_BUDGET), debt: 95, yield: yieldOf(95, deficitPct(BASE_BUDGET)), waiting: 7.5, services: 100,
};

// One week passes
export function nextEconomy(e: Economy, b: Budget): Economy {
  const services = servicesIndex(b);
  const growth = lim(
    1.5 + (b.infra - 50) * 0.02 - (b.income - 20) * 0.08 - (b.corp - 25) * 0.06 - (b.vat - 20) * 0.05 +
      (services - 100) * 0.02 + (Math.random() - 0.5) * 0.6, -3, 4);
  const deficit = deficitPct(b);
  const debt = e.debt + (deficit - (growth * e.debt) / 100) / 52;
  const waiting = lim(e.waiting + (190 - b.nhs) * 0.004, 4, 14);
  return { growth, deficit, debt, yield: yieldOf(debt, deficit), waiting, services };
}

// The weekly news: how the economy pushes on your four metrics
export function weeklyPressure(e: Economy, b: Budget): { fx: Effects; notes: string[] } {
  let a = 0, h = 0;
  const notes: string[] = [];
  if (e.growth > 2.5) { a += 1; notes.push('Strong growth lifts the national mood.'); }
  if (e.growth < 0) { a -= 2; notes.push('The economy is shrinking and voters are worried.'); }
  if (e.yield > 6) { a -= 2; h += 2; notes.push('Bond market panic: government borrowing costs are soaring.'); }
  if (e.waiting > 9) { a -= 1; notes.push('NHS waiting lists hit a new high.'); }
  if (e.services < 92) { a -= 1; h += 1; notes.push('Underfunded public services are causing unrest.'); }
  if (b.income > 40 || b.vat > 25) { a -= 1; notes.push('Voters are angry about high taxes.'); }
  if (b.income > 45) notes.push('Laffer curve: very high income tax rates are raising less money.');
  return { fx: [a, 0, 0, h], notes };
}
