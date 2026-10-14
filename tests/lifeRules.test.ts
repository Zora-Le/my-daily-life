import assert from 'node:assert/strict';
import { normalizeLifeState } from '../src/hooks/lifeSchema.ts';
import {
  calendarCells,
  createMoneyTransaction,
  createSavingsIsland,
  deleteSavingsIsland,
  isRewardUnlocked,
  monthlyTransactionSummary,
  parseMoneyToCents,
  renameSavingsIsland,
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
const sixMonths = monthlyTransactionSummary(
  [
    {
      id: 4,
      date: '2026-08-02',
      kind: 'expense',
      amountCents: 1250,
      detail: '午餐',
    },
  ],
  new Date(2026, 9, 14),
);
assert.deepEqual(
  sixMonths.map(item => item.month),
  ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'],
);
assert.equal(sixMonths[0].expense, 0);
assert.equal(sixMonths[3].expense, 1250);
const selectedDateEntry = createMoneyTransaction(
  '2026-09-21',
  'income',
  '88.06',
  '退款',
  99,
);
assert.equal(selectedDateEntry.date, '2026-09-21');
assert.equal(selectedDateEntry.amountCents, 8806);
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

assert.equal(calendarCells('2026-02').length, 28);
assert.equal(calendarCells('2026-10').length, 35);
assert.equal(calendarCells('2026-10').at(-1)?.day, 31);
assert.equal(calendarCells('2026-08').length, 42);
assert.equal(calendarCells('2026-08')[0].day, null);

const migratedSavings = normalizeLifeState({
  version: 2,
  savings: [
    {
      id: 'cash',
      name: '旧日常账户',
      detail: '现金',
      expression: '=100+20',
      value: 120,
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
  ] as never,
});
assert.equal(migratedSavings.savings[0].displayName, '旧日常账户');
assert.equal(migratedSavings.savings[0].expression, '=100+20');
assert.equal(migratedSavings.savings[0].value, 120);
assert.equal(migratedSavings.savings[0].updatedAt, '2026-09-01T00:00:00.000Z');

const migratedFixedSavings = normalizeLifeState({
  version: 2,
  platformSavings: {
    wechat: {
      name: '微信零钱',
      input: '=88+12',
      amount: 100,
      updatedAt: '2026-10-01',
    },
    bank: 250,
  },
});
assert.deepEqual(
  migratedFixedSavings.savings.map(item => [
    item.id,
    item.displayName,
    item.value,
  ]),
  [
    ['wechat', '微信零钱', 100],
    ['bank', '银行卡', 250],
  ],
);
assert.equal(migratedFixedSavings.savings[0].expression, '=88+12');

const addedIsland = createSavingsIsland('stable-id', 4);
assert.equal(addedIsland.displayName, '储蓄岛 4');
const renamedIslands = renameSavingsIsland(
  [addedIsland],
  'stable-id',
  '  旅行基金  ',
);
assert.equal(renamedIslands[0].displayName, '旅行基金');
assert.equal(renamedIslands[0].id, 'stable-id');
assert.equal(deleteSavingsIsland(renamedIslands, 'stable-id').length, 0);
console.log('lifeRules assertions passed');
