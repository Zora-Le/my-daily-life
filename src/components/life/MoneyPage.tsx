import type {
  AnnualMoneyEntry,
  LifeState,
  MoneyTransaction,
  MonthlyMoney,
  PendingExpense,
} from '@/hooks/useLifeStore';
import {
  allRecordedMonthlySummary,
  annualExpenseSummary,
  createSavingsIsland,
  deleteSavingsIsland,
  renameSavingsIsland,
} from '@/lib/lifeRules';
import { safeCalculate } from '@/lib/lifeUtils';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AnnualMoneyList } from './AnnualMoneyList';
import { MoneyCalendar } from './MoneyCalendar';
import { MonthlyMoneyEditor } from './MonthlyMoneyEditor';
import { PendingExpenses } from './PendingExpenses';
import { SavingsIsland } from './SavingsIsland';

type Saving = LifeState['savings'][number];
interface Props {
  savings: Saving[];
  transactions: MoneyTransaction[];
  monthlyMoney: MonthlyMoney[];
  incomeEntries: AnnualMoneyEntry[];
  largeExpenseEntries: AnnualMoneyEntry[];
  pendingExpenses: PendingExpense[];
  onSavings: (items: Saving[]) => void;
  onTransactions: (items: MoneyTransaction[]) => void;
  onMonthlyMoney: (items: MonthlyMoney[]) => void;
  onIncomeEntries: (items: AnnualMoneyEntry[]) => void;
  onLargeExpenseEntries: (items: AnnualMoneyEntry[]) => void;
  onPendingExpenses: (items: PendingExpense[]) => void;
  notify: (text: string) => void;
}

export function MoneyPage({
  savings,
  transactions,
  monthlyMoney,
  incomeEntries,
  largeExpenseEntries,
  pendingExpenses,
  onSavings,
  onTransactions,
  onMonthlyMoney,
  onIncomeEntries,
  onLargeExpenseEntries,
  onPendingExpenses,
  notify,
}: Props) {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editingSavings, setEditingSavings] = useState(false);
  const [summaryYear, setSummaryYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [choosingYear, setChoosingYear] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const chartScrollRef = useRef<HTMLDivElement | null>(null);
  const visibleChart = allRecordedMonthlySummary(
    transactions,
    monthlyMoney,
  ).map(item => ({
    label:
      item.month.slice(0, 4) === String(new Date().getFullYear())
        ? `${Number(item.month.slice(5))}月`
        : `${item.month.slice(2, 4)}/${Number(item.month.slice(5))}`,
    expense: item.expense / 100,
    budget: item.budget / 100,
  }));
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const element = chartScrollRef.current;
      if (element) element.scrollLeft = element.scrollWidth;
    });
    return () => cancelAnimationFrame(frame);
  }, [visibleChart.length]);
  const availableYears = Array.from(
    new Set([
      new Date().getFullYear(),
      ...transactions.map(item => Number(item.date.slice(0, 4))),
      ...monthlyMoney.map(item => Number(item.month.slice(0, 4))),
      ...largeExpenseEntries.map(item => item.year),
    ]),
  )
    .filter(Number.isFinite)
    .sort((a, b) => b - a);
  const annualExpense = annualExpenseSummary(
    transactions,
    monthlyMoney,
    summaryYear,
    largeExpenseEntries,
  );
  const cancelLongPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  };
  return (
    <>
      <div className="money-card-stack" aria-label="收支概览卡片">
        <section className="savings-card narrow money-swipe-card">
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
                    onSavings(
                      renameSavingsIsland(savings, item.id, displayName),
                    )
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
        <div className="money-swipe-card income-record-card">
          <AnnualMoneyList
            title="每月收入记录"
            overline="MONTHLY INCOME"
            tone="income"
            items={incomeEntries}
            onChange={onIncomeEntries}
            notify={notify}
          />
        </div>
      </div>

      <MoneyCalendar
        transactions={transactions}
        onChange={onTransactions}
        notify={notify}
      />

      <section className="life-section money-chart-section">
        <div className="section-heading">
          <div>
            <div className="money-title-row">
              <h2>月支出</h2>
              <MonthlyMoneyEditor
                items={monthlyMoney}
                onChange={onMonthlyMoney}
                notify={notify}
              />
            </div>
            <p>日明细整月优先 · 单位：元</p>
          </div>
          <span className="bar-legend">
            <i className="expense" />
            支出
            <i className="budget" />
            定额
          </span>
        </div>
        <div className="money-chart-scroll" ref={chartScrollRef}>
          <div
            className="money-chart"
            style={{ width: `${Math.max(visibleChart.length * 72, 320)}px` }}
          >
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
                  dataKey="expense"
                  name="支出"
                  fill="#d4a99e"
                  radius={[5, 5, 2, 2]}
                  maxBarSize={16}
                />
                <Bar
                  dataKey="budget"
                  name="本月定额"
                  fill="#8fae8f"
                  radius={[5, 5, 2, 2]}
                  maxBarSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <AnnualMoneyList
          title="大额支出"
          overline="LARGE EXPENSES"
          tone="large"
          compact
          items={largeExpenseEntries}
          onChange={onLargeExpenseEntries}
          notify={notify}
        />
        <div className="annual-expense-strip">
          <button
            type="button"
            className="annual-year"
            aria-label="长按切换年度汇总年份"
            onPointerDown={() => {
              cancelLongPress();
              longPressTimer.current = setTimeout(() => {
                setChoosingYear(true);
                longPressTimer.current = null;
              }, 550);
            }}
            onPointerUp={cancelLongPress}
            onPointerLeave={cancelLongPress}
            onPointerCancel={cancelLongPress}
            onContextMenu={event => event.preventDefault()}
          >
            {summaryYear}年
          </button>
          <span>年度支出</span>
          <strong>
            ¥
            {(annualExpense / 100).toLocaleString('zh-CN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </strong>
          {choosingYear && (
            <div className="annual-year-picker">
              {availableYears.map(year => (
                <button
                  type="button"
                  className={year === summaryYear ? 'active' : ''}
                  key={year}
                  onClick={() => {
                    setSummaryYear(year);
                    setChoosingYear(false);
                  }}
                >
                  {year}年
                </button>
              ))}
            </div>
          )}
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
