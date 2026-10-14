import type { MoneyTransaction } from '@/hooks/useLifeStore';
import {
  calendarCells,
  createMoneyTransaction,
  formatCents,
  summarizeTransactions,
} from '@/lib/lifeRules';
import { Check, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Props {
  transactions: MoneyTransaction[];
  onChange: (items: MoneyTransaction[]) => void;
  notify: (text: string) => void;
}

const monthLabel = (month: string) => {
  const [year, value] = month.split('-');
  return `${year} 年 ${Number(value)} 月`;
};

export function MoneyCalendar({ transactions, onChange, notify }: Props) {
  const [month, setMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [selected, setSelected] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [kind, setKind] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [detail, setDetail] = useState('');
  const byDay = useMemo(() => {
    const map = new Map<string, MoneyTransaction[]>();
    for (const item of transactions)
      map.set(item.date, [...(map.get(item.date) ?? []), item]);
    return map;
  }, [transactions]);
  const [year, monthNumber] = month.split('-').map(Number);
  const cells = calendarCells(month);
  const move = (offset: number) => {
    const next = new Date(year, monthNumber - 1 + offset, 1);
    const value = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
    setMonth(value);
    setSelected(`${value}-01`);
  };
  const selectedItems = byDay.get(selected) ?? [];
  const remove = (id: number) => {
    if (window.confirm('删除这条收支明细？'))
      onChange(transactions.filter(item => item.id !== id));
  };
  const submit = () => {
    try {
      const transaction = createMoneyTransaction(
        selected,
        kind,
        amount,
        detail,
      );
      onChange([transaction, ...transactions]);
      setAmount('');
      setDetail('');
      notify(`已记入 ${selected.slice(5).replace('-', ' 月 ')} 日`);
    } catch (error) {
      notify((error as Error).message);
    }
  };

  return (
    <section className="money-calendar-section">
      <div className="section-heading money-daily-heading">
        <div>
          <span className="overline">DAILY MONEY</span>
          <h2>日支出收入</h2>
        </div>
      </div>
      <div className="calendar-month-head">
        <button onClick={() => move(-1)} aria-label="上个月">
          <ChevronLeft size={17} />
        </button>
        <h3>{monthLabel(month)}</h3>
        <button onClick={() => move(1)} aria-label="下个月">
          <ChevronRight size={17} />
        </button>
      </div>
      <div className="money-weekdays">
        {['日', '一', '二', '三', '四', '五', '六'].map(item => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div className="money-calendar-grid">
        {cells.map(cell => {
          if (!cell.day)
            return <span className="money-day empty" key={cell.key} />;
          const iso = `${month}-${String(cell.day).padStart(2, '0')}`;
          const total = summarizeTransactions(byDay.get(iso) ?? []);
          return (
            <button
              className={`money-day ${selected === iso ? 'selected' : ''}`}
              key={iso}
              onClick={() => setSelected(iso)}
            >
              <b>{cell.day}</b>
              <small className="day-income">
                {total.income ? `+${formatCents(total.income)}` : ''}
              </small>
              <small className="day-expense">
                {total.expense ? `-${formatCents(total.expense)}` : ''}
              </small>
            </button>
          );
        })}
      </div>
      <div className="day-transactions">
        <div className="selected-date">
          <b>{selected.slice(5).replace('-', ' / ')}</b>
          <span>{selectedItems.length} 笔</span>
        </div>
        {selectedItems.length ? (
          selectedItems.map(item => (
            <div className="transaction-row" key={item.id}>
              <i className={item.kind} />
              <span>
                <b>{item.detail}</b>
                <small>{item.kind === 'income' ? '收入' : '支出'}</small>
              </span>
              <strong className={item.kind}>
                {item.kind === 'income' ? '+' : '-'}¥
                {formatCents(item.amountCents)}
              </strong>
              <button
                onClick={() => remove(item.id)}
                aria-label={`删除${item.detail}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        ) : (
          <p className="empty-money-day">这天还没有明细</p>
        )}
        <div className={`money-inline-entry ${kind}`}>
          <fieldset className="money-kind" aria-label="收支类型">
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
          </fieldset>
          <div className="money-inline-fields">
            <label>
              <span>¥</span>
              <input
                aria-label="金额"
                inputMode="decimal"
                value={amount}
                onChange={event =>
                  setAmount(event.target.value.replace(/[^\d.]/g, ''))
                }
                placeholder="0.00"
              />
            </label>
            <input
              aria-label="明细"
              value={detail}
              onChange={event => setDetail(event.target.value)}
              onKeyDown={event => event.key === 'Enter' && submit()}
              placeholder="明细"
            />
            <button onClick={submit} aria-label="添加到选中日期">
              <Check size={16} />
            </button>
          </div>
          <small>新增记录将保存到 {selected}</small>
        </div>
      </div>
    </section>
  );
}
