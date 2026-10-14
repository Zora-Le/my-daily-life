import type { PendingExpense } from '@/hooks/useLifeStore';
import { formatCents, parseMoneyToCents } from '@/lib/lifeRules';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';

interface Props {
  items: PendingExpense[];
  onChange: (items: PendingExpense[]) => void;
  notify: (text: string) => void;
}

export function PendingExpenses({ items, onChange, notify }: Props) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [pendingRemoval, setPendingRemoval] = useState<number | null>(null);
  const add = () => {
    try {
      if (!name.trim()) throw new Error('请填写待支出名称');
      onChange([
        ...items,
        {
          id: Date.now(),
          name: name.trim(),
          amountCents: parseMoneyToCents(amount),
        },
      ]);
      setName('');
      setAmount('');
    } catch (error) {
      notify((error as Error).message);
    }
  };
  const remove = () => {
    if (pendingRemoval === null) return;
    onChange(items.filter(item => item.id !== pendingRemoval));
    setPendingRemoval(null);
  };
  return (
    <section className="pending-expenses">
      <div className="section-heading">
        <div>
          <span className="overline">UPCOMING</span>
          <h2>待支出</h2>
        </div>
      </div>
      <div className="pending-compose">
        <input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="名称"
        />
        <input
          inputMode="decimal"
          value={amount}
          onChange={event =>
            setAmount(event.target.value.replace(/[^\d.]/g, ''))
          }
          placeholder="预计金额"
        />
        <button onClick={add} aria-label="添加待支出">
          <Plus size={15} />
        </button>
      </div>
      <div className="pending-list">
        {items.map(item => (
          <div key={item.id}>
            <span>{item.name}</span>
            <b>¥{formatCents(item.amountCents)}</b>
            <button
              onClick={() => setPendingRemoval(item.id)}
              aria-label={`删除${item.name}`}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <ConfirmModal
        open={pendingRemoval !== null}
        title="删除待支出"
        message="确定删除这项待支出吗？"
        confirmLabel="删除"
        onCancel={() => setPendingRemoval(null)}
        onConfirm={remove}
      />
    </section>
  );
}
