import type { ConfigItem, ProgressRecord } from '@/hooks/useLifeStore';
import { Check } from 'lucide-react';
import { type PointerEvent, useEffect, useState } from 'react';
import { LifeIcon } from './LifeIcon';

interface Props {
  items: ConfigItem[];
  records: Record<string, ProgressRecord>;
  onChange: (records: Record<string, ProgressRecord>) => void;
}

interface CardProps {
  item: ConfigItem;
  record: ProgressRecord;
  onPatch: (value: Partial<ProgressRecord>) => void;
}

const stopPointer = (event: PointerEvent<HTMLElement>) =>
  event.stopPropagation();

function ProgressCard({ item, record, onPatch }: CardProps) {
  const [planned, setPlanned] = useState(String(record.planned));
  useEffect(() => setPlanned(String(record.planned)), [record.planned]);

  const savePlanned = () => {
    const value = Math.max(0, Math.min(9999, Number(planned) || 0));
    setPlanned(String(value));
    if (value !== record.planned) onPatch({ planned: value });
  };
  const toggle = () => onPatch({ completed: !record.completed });

  return (
    <article
      className={`progress-check-card ${item.tone ?? 'sage'} ${record.completed ? 'completed' : ''}`}
    >
      <button
        type="button"
        className="progress-card-main"
        aria-label={`${record.completed ? '取消' : '完成'}${item.name}`}
        aria-pressed={record.completed}
        onClick={toggle}
      >
        <span className="progress-card-icon">
          <LifeIcon id={item.iconId} />
        </span>
        <span className="progress-card-check">
          <Check size={13} />
        </span>
        <b>{item.name}</b>
      </button>
      <label
        onPointerDown={stopPointer}
        onClick={event => event.stopPropagation()}
      >
        <input
          aria-label={`${item.name}计划值`}
          inputMode="numeric"
          pattern="[0-9]*"
          type="text"
          value={planned}
          onFocus={event => event.currentTarget.select()}
          onClick={event => {
            event.stopPropagation();
            event.currentTarget.select();
          }}
          onPointerDown={event => event.stopPropagation()}
          onKeyDown={event => {
            event.stopPropagation();
            if (event.key === 'Enter') event.currentTarget.blur();
          }}
          onChange={event =>
            setPlanned(event.target.value.replace(/\D/g, '').slice(0, 4))
          }
          onBlur={savePlanned}
        />
        <span>{item.unit}</span>
      </label>
    </article>
  );
}

const DAILY_ENGLISH_IDS = new Set(['progress-listening', 'progress-speaking']);

export function ProgressCheckins({ items, records, onChange }: Props) {
  const active = items.filter(item => !item.archivedAt);
  const englishItems = active.filter(item => DAILY_ENGLISH_IDS.has(item.id));
  const otherItems = active.filter(item => !DAILY_ENGLISH_IDS.has(item.id));
  const recordFor = (id: string) =>
    records[id] ?? { planned: 0, completed: false };
  const patch = (id: string, value: Partial<ProgressRecord>) =>
    onChange({ ...records, [id]: { ...recordFor(id), ...value } });
  const renderCard = (item: ConfigItem) => (
    <ProgressCard
      key={item.id}
      item={item}
      record={recordFor(item.id)}
      onPatch={value => patch(item.id, value)}
    />
  );

  return (
    <section className="life-section progress-checkin-section">
      {englishItems.length > 0 && (
        <div className="progress-group">
          <h2 className="progress-module-title">每日英语</h2>
          <div className="progress-checkin-grid">
            {englishItems.map(renderCard)}
          </div>
        </div>
      )}
      {otherItems.length > 0 && (
        <div className="progress-checkin-grid progress-other-items">
          {otherItems.map(renderCard)}
        </div>
      )}
    </section>
  );
}
