import type {
  ConfigItem,
  MoneyTransaction,
  MonthlyMoney,
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
    { income: 0, expense: 0, 'large-expense': 0 },
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
    detail:
      detail.trim() ||
      (kind === 'income'
        ? '收入'
        : kind === 'large-expense'
          ? '大额支出'
          : '支出'),
  };
}

export function monthlyTransactionSummary(
  items: MoneyTransaction[],
  anchor = new Date(),
) {
  const grouped = new Map<
    string,
    { income: number; expense: number; largeExpense: number }
  >();
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(anchor.getFullYear(), anchor.getMonth() - offset, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    grouped.set(month, { income: 0, expense: 0, largeExpense: 0 });
  }
  for (const item of items) {
    const month = item.date.slice(0, 7);
    if (!grouped.has(month)) continue;
    const current = grouped.get(month)!;
    if (item.kind === 'large-expense') {
      current.largeExpense += transactionCents(item);
    } else {
      current[item.kind] += transactionCents(item);
    }
  }
  return [...grouped.entries()].map(([month, totals]) => ({
    month,
    ...totals,
  }));
}

/**
 * 合并图表月度汇总。monthlyMoney 沿用历史存储语义：income/expense 为元；
 * 返回值与 monthlyTransactionSummary 一致，income/expense 均为分。
 */
export function mergeMonthlyMoneySummary(
  transactions: MoneyTransaction[],
  manual: MonthlyMoney[],
  anchorMonth: Date | string = new Date(),
) {
  const anchor =
    typeof anchorMonth === 'string'
      ? new Date(`${anchorMonth.slice(0, 7)}-01T00:00:00`)
      : anchorMonth;
  const summary = monthlyTransactionSummary(transactions, anchor);
  const transactionMonths = new Set(
    transactions.map(item => item.date.slice(0, 7)),
  );
  const manualByMonth = new Map(manual.map(item => [item.month, item]));

  return summary.map(item => {
    if (transactionMonths.has(item.month)) return item;
    const saved = manualByMonth.get(item.month);
    return saved
      ? {
          month: item.month,
          income: Math.round(Number(saved.income || 0) * 100),
          expense: Math.round(Number(saved.expense || 0) * 100),
          largeExpense: 0,
        }
      : item;
  });
}

export function annualExpenseSummary(
  transactions: MoneyTransaction[],
  manual: MonthlyMoney[],
  year: number,
) {
  const months = Array.from(
    { length: 12 },
    (_, index) => `${year}-${String(index + 1).padStart(2, '0')}`,
  );
  const transactionMonths = new Set(
    transactions.map(item => item.date.slice(0, 7)),
  );
  const manualByMonth = new Map(manual.map(item => [item.month, item]));
  const transactionTotals = new Map<string, number>();

  for (const item of transactions) {
    if (item.kind === 'income' || !item.date.startsWith(`${year}-`)) continue;
    const month = item.date.slice(0, 7);
    transactionTotals.set(
      month,
      (transactionTotals.get(month) ?? 0) + transactionCents(item),
    );
  }

  return months.reduce((total, month) => {
    if (transactionMonths.has(month)) {
      return total + (transactionTotals.get(month) ?? 0);
    }
    return (
      total + Math.round(Number(manualByMonth.get(month)?.expense || 0) * 100)
    );
  }, 0);
}

export function upsertMonthlyMoney(
  items: MonthlyMoney[],
  next: MonthlyMoney,
): MonthlyMoney[] {
  const index = items.findIndex(item => item.month === next.month);
  if (index < 0) return [...items, next];
  return items.map((item, itemIndex) => (itemIndex === index ? next : item));
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
