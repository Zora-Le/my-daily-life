import assert from 'node:assert/strict';
import { normalizeLifeState } from '../src/hooks/lifeSchema.ts';
import {
  isRewardUnlocked,
  parseMoneyToCents,
  summarizeTransactions,
} from '../src/lib/lifeRules.ts';

assert.equal(parseMoneyToCents('0.10'), 10);
assert.equal(parseMoneyToCents('12.34'), 1234);
assert.throws(() => parseMoneyToCents('1.234'));
assert.deepEqual(
  summarizeTransactions([
    { id: 1, date: '2026-10-14', kind: 'income', amountCents: 10, detail: 'a' },
    { id: 2, date: '2026-10-14', kind: 'income', amountCents: 20, detail: 'b' },
    { id: 3, date: '2026-10-14', kind: 'expense', amountCents: 7, detail: 'c' },
  ]),
  { income: 30, expense: 7 },
);
const items = [
  { id: 'a', name: 'A', iconId: 'sun', unit: '分钟' },
  { id: 'b', name: 'B', iconId: 'moon', unit: '次', archivedAt: '2026-10-14' },
];
assert.equal(
  isRewardUnlocked(items, { a: { planned: 10, completed: true } }),
  true,
);
assert.equal(
  isRewardUnlocked(items, { a: { planned: 10, completed: false } }),
  false,
);
assert.equal(isRewardUnlocked([{ ...items[0], archivedAt: 'x' }], {}), false);
assert.equal(items[1].name, 'B');

const migrated = normalizeLifeState({
  version: 2,
  monthlyMoney: [{ month: '10月', income: 100, expense: 20 }],
  progressItems: [{ ...items[0] }, { ...items[1] }],
  days: {
    '2026-10-14': {
      meals: {
        breakfast: { text: '面包', image: 'data:image/jpeg;base64,old' },
        lunch: { text: '' },
        dinner: { text: '' },
      },
      english: { listening: 35, speaking: 18 },
      exercise: { cardio: true, strength: false },
    },
  },
});
assert.equal(migrated.monthlyMoney[0].expense, 20);
assert.equal(migrated.progressItems[1].archivedAt, '2026-10-14');
assert.equal(migrated.days['2026-10-14'].meals.breakfast.images.length, 1);
assert.equal(
  migrated.days['2026-10-14'].progress['progress-listening'].planned,
  35,
);
assert.equal(migrated.days['2026-10-14'].habits['habit-cardio'], true);
console.log('lifeRules assertions passed');
