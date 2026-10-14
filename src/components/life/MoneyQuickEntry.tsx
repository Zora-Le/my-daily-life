import type { MoneyTransaction } from '@/hooks/useLifeStore';
import { parseMoneyToCents } from '@/lib/lifeRules';
import { TODAY } from '@/lib/lifeUtils';
import { Check } from 'lucide-react';
import { useState } from 'react';

interface Props {
  transactions: MoneyTransaction[];
  onChange: (items: MoneyTransaction[]) => void;
  notify: (text: string) => void;
}

export function MoneyQuickEntry({ transactions, onChange, notify }: Props) {
  const [date, setDate] = useState(TODAY);
  const [kind, setKind] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [detail, setDetail] = useState('');
  const submit = () => {
    try {
      const amountCents = parseMoneyToCents(amount);
      onChange([
        {
          id: Date.now(),
          date,
          kind,
          amountCents,
          detail: detail.trim() || (kind === 'income' ? '收入' : '支出'),
        },
        ...transactions,
      ]);
      setAmount('');
      setDetail('');
      notify('已记入当天收支');
    } catch (error) {
      notify((error as Error).message);
    }
  };
  return (
    <section className={`money-quick-entry ${kind}`}>
      <div className="money-quick-top">
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
        <input
          aria-label="收支日期"
          type="date"
          value={date}
          onChange={event => setDate(event.target.value)}
        />
      </div>
      <div className="money-amount-line">
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
      </div>
      <div className="money-detail-line">
        <input
          aria-label="明细"
          value={detail}
          onChange={event => setDetail(event.target.value)}
          onKeyDown={event => event.key === 'Enter' && submit()}
          placeholder="记一笔明细"
        />
        <button onClick={submit} aria-label="完成记账">
          <Check size={17} />
        </button>
      </div>
    </section>
  );
}
