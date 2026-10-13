import type { LifeState, MonthlyMoney } from '@/hooks/useLifeStore';
import { safeCalculate } from '@/lib/lifeUtils';
import { X } from 'lucide-react';
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

type Saving = LifeState['savings'][number];
export function MoneyPage({
  savings,
  monthlyMoney,
  onSavings,
  onMonthlyMoney,
  notify,
}: {
  savings: Saving[];
  monthlyMoney: MonthlyMoney[];
  onSavings: (items: Saving[]) => void;
  onMonthlyMoney: (items: MonthlyMoney[]) => void;
  notify: (text: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [moneyEditor, setMoneyEditor] = useState(false);
  const matchedIndex = monthlyMoney.findIndex(
    item => item.month === `${new Date().getMonth() + 1}月`,
  );
  const resolvedIndex =
    matchedIndex >= 0 ? matchedIndex : monthlyMoney.length - 1;
  const current = monthlyMoney[resolvedIndex];
  const [incomeDraft, setIncomeDraft] = useState('');
  const [expenseDraft, setExpenseDraft] = useState('');
  const chartData = monthlyMoney.map(item => ({
    ...item,
    income: item.income / 1000,
    expense: item.expense / 1000,
  }));
  const commitSaving = (item: Saving) => {
    try {
      const value = safeCalculate(draft);
      onSavings(
        savings.map(saving =>
          saving.id === item.id
            ? { ...saving, expression: draft, value }
            : saving,
        ),
      );
      setEditing(null);
    } catch (error) {
      notify((error as Error).message);
    }
  };
  const openMoneyEditor = () => {
    setIncomeDraft(String(current.income));
    setExpenseDraft(String(current.expense));
    setMoneyEditor(true);
  };
  const parseAmount = (value: string, label: string) => {
    const normalized = value.trim().replace(/,/g, '');
    if (!normalized) throw new Error(`${label}不能为空`);
    if (!/^\d+(\.\d{1,2})?$/.test(normalized))
      throw new Error(`${label}格式不正确`);
    const amount = Number(normalized);
    if (!Number.isFinite(amount) || amount < 0)
      throw new Error(`${label}不能为负数`);
    return amount;
  };
  const saveMoney = () => {
    try {
      const income = parseAmount(incomeDraft, '收入');
      const expense = parseAmount(expenseDraft, '支出');
      onMonthlyMoney(
        monthlyMoney.map((item, index) =>
          index === resolvedIndex ? { ...item, income, expense } : item,
        ),
      );
      setMoneyEditor(false);
    } catch (error) {
      notify((error as Error).message);
    }
  };
  const total = savings.reduce((sum, item) => sum + item.value, 0);
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
          {savings.map((item, index) => (
            <article
              className={`paper-island island-${['one', 'two', 'three'][index]}`}
              key={item.id}
              onClick={() => {
                setEditing(item.id);
                setDraft(item.expression);
              }}
            >
              {editing === item.id ? (
                <input
                  value={draft}
                  inputMode="decimal"
                  onChange={event => setDraft(event.target.value)}
                  onBlur={() => commitSaving(item)}
                  onKeyDown={event =>
                    event.key === 'Enter' && event.currentTarget.blur()
                  }
                  onClick={event => event.stopPropagation()}
                />
              ) : (
                <b>¥ {item.value.toLocaleString()}</b>
              )}
              <span>{item.detail}</span>
            </article>
          ))}
        </div>
        <p className="savings-total">
          总储蓄 <strong>{total.toLocaleString()}</strong> 元
        </p>
      </section>
      <section className="life-section">
        <div className="section-heading">
          <div>
            <h2>月度收支</h2>
            <p>单位：千元</p>
          </div>
          <span className="bar-legend">
            <i />
            收入
            <i />
            支出
          </span>
        </div>
        <div className="money-chart">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={chartData}
              barGap={4}
              margin={{ top: 10, right: 4, left: -24, bottom: 0 }}
            >
              <CartesianGrid stroke="#ece9e3" vertical={false} />
              <XAxis
                dataKey="month"
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
                formatter={value => `¥${Number(value).toFixed(1)}k`}
                contentStyle={{
                  border: '1px solid #ddd8cf',
                  borderRadius: 12,
                  fontSize: 11,
                }}
              />
              <Bar
                dataKey="income"
                name="收入"
                fill="#8797a0"
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
      <button className="money-footnote" onClick={openMoneyEditor}>
        <span>{current.month}</span>
        <p>
          <b>{current.income.toLocaleString()}</b> 元收入
        </p>
        <i />
        <p>
          <b>{current.expense.toLocaleString()}</b> 元支出
        </p>
      </button>
      {moneyEditor && (
        <div className="modal-mask" onPointerDown={() => setMoneyEditor(false)}>
          <div
            className="modal-sheet money-editor"
            onPointerDown={event => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span>{current.month}</span>
                <h2>编辑月度收支</h2>
              </div>
              <button onClick={() => setMoneyEditor(false)}>
                <X size={18} />
              </button>
            </div>
            <label>
              本月收入
              <input
                inputMode="decimal"
                value={incomeDraft}
                onChange={event => setIncomeDraft(event.target.value)}
              />
            </label>
            <label>
              本月支出
              <input
                inputMode="decimal"
                value={expenseDraft}
                onChange={event => setExpenseDraft(event.target.value)}
              />
            </label>
            <div className="money-actions">
              <button onClick={() => setMoneyEditor(false)}>取消</button>
              <button className="primary-action" onClick={saveMoney}>
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
