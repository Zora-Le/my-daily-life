import type {
  LifeState,
  MoneyTransaction,
  MonthlyMoney,
} from '@/hooks/useLifeStore';
import { TODAY, safeCalculate } from '@/lib/lifeUtils';
import { Plus, X } from 'lucide-react';
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
  transactions,
  onSavings,
  onMonthlyMoney,
  onTransactions,
  notify,
}: {
  savings: Saving[];
  monthlyMoney: MonthlyMoney[];
  transactions: MoneyTransaction[];
  onSavings: (items: Saving[]) => void;
  onMonthlyMoney: (items: MonthlyMoney[]) => void;
  onTransactions: (items: MoneyTransaction[]) => void;
  notify: (text: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [moneyEditor, setMoneyEditor] = useState(false);
  const [date, setDate] = useState(TODAY);
  const [kind, setKind] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [detail, setDetail] = useState('');
  const currentMonth = `${new Date().getMonth() + 1}月`;
  const matchedIndex = monthlyMoney.findIndex(
    item => item.month === currentMonth,
  );
  const resolvedIndex =
    matchedIndex >= 0 ? matchedIndex : monthlyMoney.length - 1;
  const current = monthlyMoney[resolvedIndex];
  const [incomeDraft, setIncomeDraft] = useState('');
  const [expenseDraft, setExpenseDraft] = useState('');
  const detailsFor = (month: string, targetKind: 'income' | 'expense') => {
    const monthNumber = String(Number(month.replace('月', ''))).padStart(
      2,
      '0',
    );
    const prefix = `${new Date().getFullYear()}-${monthNumber}`;
    return transactions
      .filter(item => item.date.startsWith(prefix) && item.kind === targetKind)
      .reduce((sum, item) => sum + item.amount, 0);
  };
  const chartData = monthlyMoney.map(item => ({
    month: item.month,
    income: (item.income + detailsFor(item.month, 'income')) / 1000,
    expense: (item.expense + detailsFor(item.month, 'expense')) / 1000,
  }));
  const currentIncome = current.income + detailsFor(current.month, 'income');
  const currentExpense = current.expense + detailsFor(current.month, 'expense');
  const parseAmount = (value: string, label: string) => {
    const normalized = value.trim().replace(/,/g, '');
    if (!/^\d+(\.\d{1,2})?$/.test(normalized))
      throw new Error(`${label}格式不正确`);
    const result = Number(normalized);
    if (!Number.isFinite(result) || result <= 0)
      throw new Error(`${label}需大于 0`);
    return result;
  };
  const addTransaction = () => {
    try {
      const value = parseAmount(amount, '金额');
      onTransactions([
        {
          id: Date.now(),
          date,
          kind,
          amount: value,
          detail: detail.trim() || (kind === 'income' ? '收入' : '支出'),
        },
        ...transactions,
      ]);
      setAmount('');
      setDetail('');
      notify('日明细已计入月度图表');
    } catch (error) {
      notify((error as Error).message);
    }
  };
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
  const saveMoney = () => {
    try {
      const income = parseAmount(incomeDraft, '收入基数');
      const expense = parseAmount(expenseDraft, '支出基数');
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
      <section className="daily-money-entry">
        <div className="daily-money-head">
          <b>日收支</b>
          <input
            type="date"
            value={date}
            onChange={event => setDate(event.target.value)}
          />
        </div>
        <div className="money-kind">
          <button
            className={kind === 'expense' ? 'active' : ''}
            onClick={() => setKind('expense')}
          >
            支出
          </button>
          <button
            className={kind === 'income' ? 'active' : ''}
            onClick={() => setKind('income')}
          >
            收入
          </button>
        </div>
        <div className="money-entry-fields">
          <input
            inputMode="decimal"
            value={amount}
            onChange={event => setAmount(event.target.value)}
            placeholder="金额"
          />
          <input
            value={detail}
            onChange={event => setDetail(event.target.value)}
            placeholder="明细"
          />
          <button onClick={addTransaction} aria-label="添加日收支">
            <Plus size={16} />
          </button>
        </div>
        {transactions[0] && (
          <p className="latest-transaction">
            <span>
              {transactions[0].date.slice(5)} · {transactions[0].detail}
            </span>
            <b>
              {transactions[0].kind === 'income' ? '+' : '-'}¥
              {transactions[0].amount}
            </b>
          </p>
        )}
      </section>
      <section className="life-section money-chart-section">
        <div className="section-heading">
          <div>
            <h2>月度收支</h2>
            <p>月度基数 + 日明细 · 单位：千元</p>
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
          <b>{currentIncome.toLocaleString()}</b> 元收入
        </p>
        <i />
        <p>
          <b>{currentExpense.toLocaleString()}</b> 元支出
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
                <h2>编辑月度基数</h2>
              </div>
              <button onClick={() => setMoneyEditor(false)}>
                <X size={18} />
              </button>
            </div>
            <label>
              收入基数
              <input
                inputMode="decimal"
                value={incomeDraft}
                onChange={event => setIncomeDraft(event.target.value)}
              />
            </label>
            <label>
              支出基数
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
