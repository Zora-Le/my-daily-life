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

export function isRewardUnlocked(
  items: ConfigItem[],
  records: Record<string, ProgressRecord>,
) {
  const active = items.filter(item => !item.archivedAt);
  return active.length > 0 && active.every(item => records[item.id]?.completed);
}
