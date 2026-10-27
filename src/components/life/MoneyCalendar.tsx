import type { MoneyTransaction } from '@/hooks/useLifeStore';
import { useLongPress } from '@/hooks/useLongPress';
import {
  calendarCells,
  createMoneyTransaction,
  formatCents,
  summarizeTransactions,
} from '@/lib/lifeRules';
import { Check, ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmModal } from './ConfirmModal';

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
  const [expenseType, setExpenseType] = useState<
    'daily' | 'special' | 'reimbursement'
  >('daily');
  const [amount, setAmount] = useState('');
  const [detail, setDetail] = useState('');
  const [pendingRemoval, setPendingRemoval] = useState<number | null>(null);
  const [editingTransaction, setEditingTransaction] =
    useState<MoneyTransaction | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDetail, setEditDetail] = useState('');
  const bindLongPress = useLongPress((item: MoneyTransaction) => {
    setEditingTransaction(item);
    setEditAmount(formatCents(item.amountCents));
    setEditDetail(item.detail);
  });
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
  const remove = () => {
    if (pendingRemoval === null) return;
    onChange(transactions.filter(item => item.id !== pendingRemoval));
    setPendingRemoval(null);
  };
  const saveTransaction = () => {
    if (!editingTransaction) return;
    try {
      const updated = createMoneyTransaction(
        editingTransaction.date,
        editingTransaction.kind,
        editAmount,
        editDetail,
      );
      onChange(
        transactions.map(item =>
          item.id === editingTransaction.id
            ? {
                ...item,
                amountCents: updated.amountCents,
                detail: updated.detail,
              }
            : item,
        ),
      );
      setEditingTransaction(null);
      notify('收支明细已更新');
    } catch (error) {
      notify((error as Error).message);
    }
  };
  const submit = () => {
    try {
      const transaction = {
        ...createMoneyTransaction(selected, 'expense', amount, detail),
        expenseType,
      };
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
          <h2>每日记账</h2>
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
          const dayItems = byDay.get(iso) ?? [];
          const expense = summarizeTransactions(
            dayItems.filter(
              item =>
                item.kind === 'expense' && item.expenseType !== 'reimbursement',
            ),
          ).expense;
          const hasSpecial = dayItems.some(
            item => item.expenseType === 'special',
          );
          const reimbursement = summarizeTransactions(
            dayItems.filter(item => item.expenseType === 'reimbursement'),
          ).expense;
          return (
            <button
              className={`money-day ${selected === iso ? 'selected' : ''}`}
              key={iso}
              onClick={() => setSelected(iso)}
            >
              <b>{cell.day}</b>
              <small
                className={hasSpecial ? 'day-special-expense' : 'day-expense'}
              >
                {expense ? `-${formatCents(expense)}` : ''}
              </small>
              <small className="day-reimbursement">
                {reimbursement ? `-${formatCents(reimbursement)}` : ''}
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
            <div
              className={`transaction-row ${
                item.expenseType === 'special'
                  ? 'special-expense'
                  : item.expenseType === 'reimbursement'
                    ? 'reimbursement-expense'
                    : ''
              }`}
              key={item.id}
              {...bindLongPress(item)}
            >
              <i className={item.kind} />
              <span>
                <b>{item.detail}</b>
                <small>
                  {item.kind === 'income'
                    ? '收入'
                    : item.expenseType === 'reimbursement'
                      ? '报销支出'
                      : item.expenseType === 'special'
                        ? '特殊支出'
                        : '日常支出'}
                </small>
              </span>
              <strong className={item.kind}>
                {item.kind === 'income' ? '+' : '-'}¥
                {formatCents(item.amountCents)}
              </strong>
              <button
                onClick={() => setPendingRemoval(item.id)}
                aria-label={`删除${item.detail}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        ) : (
          <p className="empty-money-day">这天还没有明细</p>
        )}
        <div className="money-inline-entry expense">
          <div className="expense-entry-label">支出</div>
          <fieldset className="expense-category" aria-label="支出类别">
            <span>支出类别</span>
            <button
              className={expenseType === 'daily' ? 'active' : ''}
              onClick={() => setExpenseType('daily')}
            >
              日常
            </button>
            <button
              className={expenseType === 'special' ? 'active special' : ''}
              onClick={() => setExpenseType('special')}
            >
              特殊
            </button>
            <button
              className={
                expenseType === 'reimbursement' ? 'active reimbursement' : ''
              }
              onClick={() => setExpenseType('reimbursement')}
            >
              报销
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
      {editingTransaction && (
        <div
          className="modal-mask"
          onPointerDown={() => setEditingTransaction(null)}
        >
          <section
            className="modal-sheet money-edit-modal"
            onPointerDown={event => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span>EDIT TRANSACTION</span>
                <h2>编辑收支明细</h2>
              </div>
              <button
                onClick={() => setEditingTransaction(null)}
                aria-label="关闭编辑"
              >
                <X size={18} />
              </button>
            </div>
            <label>
              明细
              <textarea
                value={editDetail}
                onChange={event => setEditDetail(event.target.value)}
                placeholder="收支明细"
              />
            </label>
            <label>
              金额
              <input
                inputMode="decimal"
                value={editAmount}
                onChange={event =>
                  setEditAmount(event.target.value.replace(/[^\d.]/g, ''))
                }
                onKeyDown={event => event.key === 'Enter' && saveTransaction()}
              />
            </label>
            <button className="primary-action" onClick={saveTransaction}>
              保存修改
            </button>
          </section>
        </div>
      )}
      <ConfirmModal
        open={pendingRemoval !== null}
        title="删除记账明细"
        message="删除后无法恢复，确定移除这条收支明细吗？"
        confirmLabel="删除"
        onCancel={() => setPendingRemoval(null)}
        onConfirm={remove}
      />
    </section>
  );
}