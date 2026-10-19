import type {
  LifeState,
  MoneyTransaction,
  MonthlyMoney,
  PendingExpense,
} from '@/hooks/useLifeStore';
import {
  createSavingsIsland,
  deleteSavingsIsland,
  mergeMonthlyMoneySummary,
  renameSavingsIsland,
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
import { MonthlyMoneyEditor } from './MonthlyMoneyEditor';
import { PendingExpenses } from './PendingExpenses';
import { SavingsIsland } from './SavingsIsland';

type Saving = LifeState['savings'][number];
interface Props {
  savings: Saving[];
  transactions: MoneyTransaction[];
  monthlyMoney: MonthlyMoney[];
  pendingExpenses: PendingExpense[];
  onSavings: (items: Saving[]) => void;
  onTransactions: (items: MoneyTransaction[]) => void;
  onMonthlyMoney: (items: MonthlyMoney[]) => void;
  onPendingExpenses: (items: PendingExpense[]) => void;
  notify: (text: string) => void;
}

export function MoneyPage({
  savings,
  transactions,
  monthlyMoney,
  pendingExpenses,
  onSavings,
  onTransactions,
  onMonthlyMoney,
  onPendingExpenses,
  notify,
}: Props) {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editingSavings, setEditingSavings] = useState(false);
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
    setEditingSavings(true);
    setEditingName(id);
  };
  const total = savings.reduce((sum, item) => sum + item.value, 0);
  const visibleChart = mergeMonthlyMoneySummary(transactions, monthlyMoney).map(
    item => ({
      label: `${Number(item.month.slice(5))}月`,
      income: item.income / 100,
      expense: item.expense / 100,
    }),
  );
  return (
    <>
      <section className="savings-card narrow">
        <div className="savings-top">
          <div>
            <span className="overline">PLATFORM SAVINGS</span>
            <h2>平台储蓄</h2>
          </div>
          <button
            type="button"
            className="savings-edit-toggle"
            aria-pressed={editingSavings}
            onClick={() => {
              setEditingSavings(active => !active);
              setEditingName(null);
            }}
          >
            {editingSavings ? '完成' : '编辑'}
          </button>
        </div>
        <div className="island-map">
          <div className="wave wave-one" />
          <div className="wave wave-two" />
          <div className="island-list">
            {savings.map(item => (
              <SavingsIsland
                item={item}
                key={item.id}
                editMode={editingSavings}
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
            {!savings.length && !editingSavings && (
              <button className="add-island" onClick={addIsland}>
                <Plus size={13} />
                添加第一个储蓄岛
              </button>
            )}
            {editingSavings && (
              <button className="add-island" onClick={addIsland}>
                <Plus size={13} />
                添加岛屿
              </button>
            )}
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
            <div className="money-title-row">
              <h2>月度收支</h2>
              <MonthlyMoneyEditor
                items={monthlyMoney}
                onChange={onMonthlyMoney}
                notify={notify}
              />
            </div>
            <p>日明细整月优先 · 单位：元</p>
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
      </section>

      <PendingExpenses
        items={pendingExpenses}
        onChange={onPendingExpenses}
        notify={notify}
      />
    </>
  );
}
