import type { ConfigItem, ProgressRecord } from '@/hooks/useLifeStore';
import { Check } from 'lucide-react';
import { LifeIcon } from './LifeIcon';

interface Props {
  items: ConfigItem[];
  records: Record<string, ProgressRecord>;
  onChange: (records: Record<string, ProgressRecord>) => void;
}

export function ProgressCheckins({ items, records, onChange }: Props) {
  const active = items.filter(item => !item.archivedAt);
  const recordFor = (id: string) =>
    records[id] ?? { planned: 0, completed: false };
  const patch = (id: string, value: Partial<ProgressRecord>) =>
    onChange({ ...records, [id]: { ...recordFor(id), ...value } });
  const toggle = (id: string) =>
    patch(id, { completed: !recordFor(id).completed });
  return (
    <section className="life-section progress-checkin-section">
      <div className="progress-checkin-grid">
        {active.map(item => {
          const record = recordFor(item.id);
          return (
            <div
              key={item.id}
              className={`progress-check-card ${item.tone ?? 'sage'} ${record.completed ? 'completed' : ''}`}
            >
              <button
                className="progress-card-toggle"
                onClick={() => toggle(item.id)}
                aria-label={`${record.completed ? '取消' : '完成'}${item.name}`}
                aria-pressed={record.completed}
              />
              <div className="progress-card-icon">
                <LifeIcon id={item.iconId} />
              </div>
              <span className="progress-card-check">
                <Check size={13} />
              </span>
              <b>{item.name}</b>
              <label
                onClick={event => event.stopPropagation()}
                onPointerDown={event => event.stopPropagation()}
              >
                <input
                  aria-label={`${item.name}计划值`}
                  inputMode="numeric"
                  type="number"
                  min="0"
                  max="9999"
                  value={record.planned}
                  onChange={event =>
                    patch(item.id, {
                      planned: Math.max(
                        0,
                        Math.min(9999, Number(event.target.value) || 0),
                      ),
                    })
                  }
                />
                <span>{item.unit}</span>
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
}
