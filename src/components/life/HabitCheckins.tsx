import type { ConfigItem } from '@/hooks/useLifeStore';
import { Check } from 'lucide-react';
import { LifeIcon } from './LifeIcon';

interface Props {
  items: ConfigItem[];
  records: Record<string, boolean>;
  onChange: (records: Record<string, boolean>) => void;
}

export function HabitCheckins({ items, records, onChange }: Props) {
  const active = items.filter(item => !item.archivedAt);
  return (
    <section className="life-section">
      <div className="section-heading">
        <h2>Daily Habits</h2>
      </div>
      <div className="habit-checkin-list">
        {active.map(item => {
          const completed = Boolean(records[item.id]);
          return (
            <button
              className={`habit-check-row ${item.tone ?? 'sage'} ${completed ? 'completed' : ''}`}
              key={item.id}
              onClick={() => onChange({ ...records, [item.id]: !completed })}
            >
              <span className="habit-icon">
                <LifeIcon id={item.iconId} size={21} />
              </span>
              <span>
                <b>{item.name}</b>
                <small>{item.unit}</small>
              </span>
              <i>
                <Check size={12} />
              </i>
            </button>
          );
        })}
      </div>
    </section>
  );
}
