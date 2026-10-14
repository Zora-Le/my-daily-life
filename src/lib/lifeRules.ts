import type {
  ConfigItem,
  MoneyTransaction,
  ProgressRecord,
  SavingsIsland,
} from '@/hooks/lifeSchema';

export function parseMoneyToCents(raw: string): number {
  const value = raw.trim().replace(/,/g, '');
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value)) {
    throw new Error('金额最多保留两位小数');
  }
  const [yuan, decimal = ''] = value.split('.');
  const cents = Number(yuan) * 100 + Number(decimal.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents <= 0) {
    throw new Error('金额需大于 0');
  }
  return cents;
}

export const formatCents = (cents: number) => (cents / 100).toFixed(2);

export const transactionCents = (item: MoneyTransaction) =>
  Number.isSafeInteger(item.amountCents)
    ? item.amountCents
    : Math.round(Number(item.amount || 0) * 100);

export function summarizeTransactions(items: MoneyTransaction[]) {
  return items.reduce(
    (sum, item) => {
      sum[item.kind] += transactionCents(item);
      return sum;
    },
    { income: 0, expense: 0 },
  );
}

export function createMoneyTransaction(
  date: string,
  kind: MoneyTransaction['kind'],
  amount: string,
  detail: string,
  id = Date.now(),
): MoneyTransaction {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('记账日期无效');
  return {
    id,
    date,
    kind,
    amountCents: parseMoneyToCents(amount),
    detail: detail.trim() || (kind === 'income' ? '收入' : '支出'),
  };
}

export function monthlyTransactionSummary(
  items: MoneyTransaction[],
  anchor = new Date(),
) {
  const grouped = new Map<string, { income: number; expense: number }>();
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(anchor.getFullYear(), anchor.getMonth() - offset, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    grouped.set(month, { income: 0, expense: 0 });
  }
  for (const item of items) {
    const month = item.date.slice(0, 7);
    if (!grouped.has(month)) continue;
    const current = grouped.get(month)!;
    current[item.kind] += transactionCents(item);
  }
  return [...grouped.entries()].map(([month, totals]) => ({
    month,
    ...totals,
  }));
}

export function calendarCells(month: string) {
  const [year, monthNumber] = month.split('-').map(Number);
  const firstWeekday = new Date(year, monthNumber - 1, 1).getDay();
  const days = new Date(year, monthNumber, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + days) / 7) * 7;
  return Array.from({ length: cellCount }, (_, position) => {
    const day = position - firstWeekday + 1;
    return {
      key: `${month}-cell-${position - firstWeekday}`,
      day: day > 0 && day <= days ? day : null,
    };
  });
}

export function createSavingsIsland(
  id: string,
  position: number,
): SavingsIsland {
  return {
    id,
    displayName: `储蓄岛 ${position}`,
    detail: '',
    expression: '=0',
    value: 0,
  };
}

export function renameSavingsIsland(
  items: SavingsIsland[],
  id: string,
  displayName: string,
) {
  const nextName = displayName.trim();
  if (!nextName) return items;
  return items.map(item =>
    item.id === id ? { ...item, displayName: nextName } : item,
  );
}

export const deleteSavingsIsland = (items: SavingsIsland[], id: string) =>
  items.filter(item => item.id !== id);

export function isRewardUnlocked(
  items: ConfigItem[],
  records: Record<string, ProgressRecord>,
) {
  const active = items.filter(item => !item.archivedAt);
  return active.length > 0 && active.every(item => records[item.id]?.completed);
}
