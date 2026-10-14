import type {
  LifeState,
  MoneyTransaction,
  PendingExpense,
} from '@/hooks/useLifeStore';
import {
  createSavingsIsland,
  deleteSavingsIsland,
  formatCents,
  monthlyTransactionSummary,
  renameSavingsIsland,
  summarizeTransactions,
} from '@/lib/lifeRules';
import { safeCalculate } from '@/lib/lifeUtils';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MoneyCalendar } from './MoneyCalendar';
import { PendingExpenses } from './PendingExpenses';
import { SavingsIsland } from './SavingsIsland';

type Saving = LifeState['savings'][number];
interface Props {
  savings: Saving[];
  transactions: MoneyTransaction[];
  pendingExpenses: PendingExpense[];
  onSavings: (items: Saving[]) => void;
  onTransactions: (items: MoneyTransaction[]) => void;
  onPendingExpenses: (items: PendingExpense[]) => void;
  notify: (text: string) => void;
}

export function MoneyPage({
  savings,
  transactions,
  pendingExpenses,
  onSavings,
  onTransactions,
  onPendingExpenses,
  notify,
}: Props) {
  const [editingName, setEditingName] = useState<string | null>(null);
  const commitSaving = (item: Saving, expression: string) => {
    try {
      const value = safeCalculate(expression);
      onSavings(
        savings.map(saving =>
          saving.id === item.id
            ? {
                ...saving,
                expression,
                value,
                updatedAt: new Date().toISOString(),
              }
            : saving,
        ),
      );
      return true;
    } catch (error) {
      notify((error as Error).message);
      return false;
    }
  };
  const addIsland = () => {
    const id = `island-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    onSavings([...savings, createSavingsIsland(id, savings.length + 1)]);
    setEditingName(id);
  };
  const total = savings.reduce((sum, item) => sum + item.value, 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const visibleChart = monthlyTransactionSummary(transactions).map(item => ({
    label: `${Number(item.month.slice(5))}月`,
    income: item.income / 100,
    expense: item.expense / 100,
  }));
  const currentTotals = summarizeTransactions(
    transactions.filter(item => item.date.startsWith(currentMonth)),
  );
  return (
    <>
      <section className="savings-card narrow">
        <div className="savings-top">
          <div>
            <span className="overline">PLATFORM SAVINGS</span>
            <h2>平台储蓄</h2>
          </div>
        </div>
        <div className="island-map">
          <div className="wave wave-one" />
          <div className="wave wave-two" />
          <div className="island-list">
            {savings.map(item => (
              <SavingsIsland
                item={item}
                key={item.id}
                editingName={editingName === item.id}
                onEditingName={active =>
                  setEditingName(active ? item.id : null)
                }
                onName={displayName =>
                  onSavings(renameSavingsIsland(savings, item.id, displayName))
                }
                onAmount={expression => commitSaving(item, expression)}
                onDelete={() =>
                  onSavings(deleteSavingsIsland(savings, item.id))
                }
              />
            ))}
            <button className="add-island" onClick={addIsland}>
              <Plus size={15} />
              添加岛屿
            </button>
          </div>
        </div>
        <p className="savings-total">
          总储蓄 <strong>{total.toLocaleString()}</strong> 元
        </p>
      </section>

      <MoneyCalendar
        transactions={transactions}
        onChange={onTransactions}
        notify={notify}
      />

      <section className="life-section money-chart-section">
        <div className="section-heading">
          <div>
            <h2>月度收支</h2>
            <p>日明细汇总 · 单位：元</p>
          </div>
          <span className="bar-legend">
            <i />
            收入
            <i />
            支出
          </span>
        </div>
        <div className="money-chart">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={visibleChart}
              barGap={4}
              margin={{ top: 10, right: 4, left: -12, bottom: 0 }}
            >
              <CartesianGrid stroke="#ece9e3" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#85827d', fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#aaa59d', fontSize: 9 }}
              />
              <Tooltip
                cursor={{ fill: '#f6f3ed' }}
                formatter={value => `¥${Number(value).toFixed(2)}`}
                contentStyle={{
                  border: '1px solid #ddd8cf',
                  borderRadius: 12,
                  fontSize: 11,
                }}
              />
              <Bar
                dataKey="income"
                name="收入"
                fill="#91aaa0"
                radius={[5, 5, 2, 2]}
                maxBarSize={16}
              />
              <Bar
                dataKey="expense"
                name="支出"
                fill="#d4a99e"
                radius={[5, 5, 2, 2]}
                maxBarSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="money-month-total">
          <span>{Number(currentMonth.slice(5))} 月</span>
          <p>
            <b>{formatCents(currentTotals.income)}</b> 元收入
          </p>
          <i />
          <p>
            <b>{formatCents(currentTotals.expense)}</b> 元支出
          </p>
        </div>
      </section>

      <PendingExpenses
        items={pendingExpenses}
        onChange={onPendingExpenses}
        notify={notify}
      />
    </>
  );
}
