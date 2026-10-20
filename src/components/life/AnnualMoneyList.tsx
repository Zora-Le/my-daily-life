import type { AnnualMoneyEntry } from '@/hooks/useLifeStore';
import { formatCents, parseMoneyToCents } from '@/lib/lifeRules';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Props {
  title: string;
  overline: string;
  tone: 'income' | 'large';
  items: AnnualMoneyEntry[];
  onChange: (items: AnnualMoneyEntry[]) => void;
  notify: (text: string) => void;
  compact?: boolean;
}

export function AnnualMoneyList({
  title,
  overline,
  tone,
  items,
  onChange,
  notify,
  compact = false,
}: Props) {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const visible = useMemo(
    () => items.filter(item => item.year === year),
    [items, year],
  );
  const total = visible.reduce((sum, item) => sum + item.amountCents, 0);

  const add = () => {
    try {
      if (!month.trim()) throw new Error('请填写月份');
      if (!name.trim())
        throw new Error(`请填写${tone === 'income' ? '收入名称' : '项目名称'}`);
      onChange([
        ...items,
        {
          id: Date.now(),
          year,
          month: month.trim(),
          name: name.trim(),
          amountCents: parseMoneyToCents(amount),
        },
      ]);
      setMonth('');
      setName('');
      setAmount('');
    } catch (error) {
      notify((error as Error).message);
    }
  };

  return (
    <section
      className={`annual-money-list ${tone} ${compact ? 'compact' : ''}`}
    >
      <div className="annual-list-head">
        <div>
          <span>{overline}</span>
          <h2>{title}</h2>
        </div>
        <div className="annual-list-year">
          <button
            onClick={() => setYear(value => value - 1)}
            aria-label="上一年"
          >
            <ChevronLeft size={13} />
          </button>
          <b>{year}年</b>
          <button
            onClick={() => setYear(value => value + 1)}
            aria-label="下一年"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
      {tone === 'large' && (
        <p className="annual-list-total top-total">
          年度大额支出合计 <strong>¥{formatCents(total)}</strong>
        </p>
      )}
      <div className="annual-entry-compose">
        <input
          value={month}
          onChange={event => setMonth(event.target.value)}
          placeholder="月份"
          aria-label="月份"
        />
        <input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder={tone === 'income' ? '收入名称' : '项目名称'}
          aria-label={tone === 'income' ? '收入名称' : '项目名称'}
        />
        <input
          value={amount}
          inputMode="decimal"
          onChange={event =>
            setAmount(event.target.value.replace(/[^\d.]/g, ''))
          }
          placeholder="金额"
          aria-label="金额"
          onKeyDown={event => event.key === 'Enter' && add()}
        />
        <button onClick={add} aria-label="添加条目">
          <Plus size={14} />
        </button>
      </div>
      <div className="annual-entry-rows">
        {visible.map(item => (
          <div key={item.id}>
            <span>{item.month}</span>
            <b>{item.name}</b>
            <strong>¥{formatCents(item.amountCents)}</strong>
            <button
              onClick={() =>
                onChange(items.filter(entry => entry.id !== item.id))
              }
              aria-label={`删除${item.name}`}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {!visible.length && <p>这一年还没有记录</p>}
      </div>
      {tone === 'income' && (
        <p className="annual-list-total">
          年度收入合计 <strong>¥{formatCents(total)}</strong>
        </p>
      )}
    </section>
  );
}
