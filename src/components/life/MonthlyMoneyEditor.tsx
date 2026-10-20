import type { MonthlyMoney } from '@/hooks/useLifeStore';
import { upsertMonthlyMoney } from '@/lib/lifeRules';
import { Pencil, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  items: MonthlyMoney[];
  onChange: (items: MonthlyMoney[]) => void;
  notify: (text: string) => void;
}

const currentMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
};
const validAmount = (value: string) =>
  value === '' || /^(?:0|[1-9]\d*)(?:\.\d{0,2})?$/.test(value);

export function MonthlyMoneyEditor({ items, onChange, notify }: Props) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(currentMonth);
  const [expense, setExpense] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    const saved = items.find(item => item.month === month);
    setExpense(saved ? String(saved.expense) : '');
    setBudget(saved?.budget ? String(saved.budget) : '');
  }, [items, month]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  const save = () => {
    if (!/^\d{4}-\d{2}$/.test(month) || month > currentMonth()) {
      notify('请选择当前或更早的月份');
      return;
    }
    if (!validAmount(expense) || !validAmount(budget)) {
      notify('金额需为非负数，最多保留两位小数');
      return;
    }
    onChange(
      upsertMonthlyMoney(items, {
        month,
        income: items.find(item => item.month === month)?.income ?? 0,
        expense: Number(expense || 0),
        budget: Number(budget || 0),
      }),
    );
    setOpen(false);
    notify('月支出已保存');
  };

  return (
    <>
      <button
        type="button"
        className="monthly-edit-button"
        onClick={() => setOpen(true)}
        aria-label="编辑历史月支出"
      >
        <Pencil size={12} />
        编辑历史
      </button>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="monthly-money-mask"
            role="presentation"
            onPointerDown={() => setOpen(false)}
          >
            <dialog
              open
              className="monthly-money-dialog"
              aria-labelledby="monthly-money-title"
              onPointerDown={event => event.stopPropagation()}
            >
              <div className="monthly-money-head">
                <div>
                  <span>MONTHLY RECORD</span>
                  <h2 id="monthly-money-title">编辑历史月支出</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="关闭"
                >
                  <X size={17} />
                </button>
              </div>
              <p className="monthly-money-tip">
                仅在该月没有任何日明细时用于图表；清空金额会按 0 元保存。
              </p>
              <label>
                月份
                <input
                  type="month"
                  max={currentMonth()}
                  value={month}
                  onChange={event => setMonth(event.target.value)}
                />
              </label>
              <div className="monthly-money-fields">
                <label>
                  月支出（元）
                  <input
                    type="text"
                    inputMode="decimal"
                    value={expense}
                    placeholder="0.00"
                    onChange={event => setExpense(event.target.value.trim())}
                  />
                </label>
                <label>
                  本月定额（元）
                  <input
                    type="text"
                    inputMode="decimal"
                    value={budget}
                    placeholder="0.00"
                    onChange={event => setBudget(event.target.value.trim())}
                  />
                </label>
              </div>
              <div className="monthly-money-actions">
                <button type="button" onClick={() => setOpen(false)}>
                  取消
                </button>
                <button type="button" onClick={save}>
                  保存记录
                </button>
              </div>
            </dialog>
          </div>,
          document.body,
        )}
    </>
  );
}
