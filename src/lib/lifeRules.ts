import type {
  ConfigItem,
  MoneyTransaction,
  ProgressRecord,
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

export function monthlyTransactionSummary(items: MoneyTransaction[]) {
  const grouped = new Map<string, { income: number; expense: number }>();
  for (const item of items) {
    const month = item.date.slice(0, 7);
    const current = grouped.get(month) ?? { income: 0, expense: 0 };
    current[item.kind] += transactionCents(item);
    grouped.set(month, current);
  }
  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, totals]) => ({ month, ...totals }));
}

export function isRewardUnlocked(
  items: ConfigItem[],
  records: Record<string, ProgressRecord>,
) {
  const active = items.filter(item => !item.archivedAt);
  return active.length > 0 && active.every(item => records[item.id]?.completed);
}
