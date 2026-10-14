import type { ConfigItem } from '@/hooks/useLifeStore';
import { Archive, Plus, RotateCcw, Save, X } from 'lucide-react';
import { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';
import { LifeIcon, lifeIconIds } from './LifeIcon';

interface Props {
  title: string;
  items: ConfigItem[];
  onChange: (items: ConfigItem[]) => void;
  notify: (text: string) => void;
}

type Draft = Pick<ConfigItem, 'name' | 'iconId' | 'unit' | 'tone'> & {
  id?: string;
};
const blank: Draft = { name: '', iconId: 'sparkles', unit: '次', tone: 'sage' };
const tones: NonNullable<ConfigItem['tone']>[] = [
  'sage',
  'rose',
  'ochre',
  'slate',
];

export function ItemConfigPanel({ title, items, onChange, notify }: Props) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pendingArchive, setPendingArchive] = useState<ConfigItem | null>(null);
  const active = items.filter(item => !item.archivedAt);
  const archived = items.filter(item => item.archivedAt);
  const save = () => {
    if (!draft?.name.trim()) return notify('请填写名称');
    if (!draft.unit.trim()) return notify('请填写单位');
    if (draft.id) {
      onChange(
        items.map(item =>
          item.id === draft.id
            ? {
                ...item,
                ...draft,
                name: draft.name.trim(),
                unit: draft.unit.trim(),
              }
            : item,
        ),
      );
    } else {
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      onChange([
        ...items,
        { ...draft, id, name: draft.name.trim(), unit: draft.unit.trim() },
      ]);
    }
    setDraft(null);
  };
  const archive = () => {
    if (!pendingArchive) return;
    onChange(
      items.map(value =>
        value.id === pendingArchive.id
          ? { ...value, archivedAt: new Date().toISOString() }
          : value,
      ),
    );
    setPendingArchive(null);
  };
  const restore = (id: string) =>
    onChange(
      items.map(item =>
        item.id === id ? { ...item, archivedAt: undefined } : item,
      ),
    );
  return (
    <section className="item-config-panel">
      <div className="config-panel-head">
        <div>
          <h3>{title}</h3>
          <small>{active.length} 个活跃项</small>
        </div>
        <button onClick={() => setDraft(blank)}>
          <Plus size={14} />
          新增
        </button>
      </div>
      <div className="config-active-list">
        {active.map(item => (
          <div className="config-item" key={item.id}>
            <span className={`config-icon ${item.tone ?? 'sage'}`}>
              <LifeIcon id={item.iconId} size={18} />
            </span>
            <button
              className="config-name"
              onClick={() =>
                setDraft({
                  id: item.id,
                  name: item.name,
                  iconId: item.iconId,
                  unit: item.unit,
                  tone: item.tone,
                })
              }
            >
              <b>{item.name}</b>
              <small>{item.unit}</small>
            </button>
            <button
              className="config-archive"
              onClick={() => setPendingArchive(item)}
              aria-label={`归档${item.name}`}
            >
              <Archive size={14} />
            </button>
          </div>
        ))}
      </div>
      {archived.length > 0 && (
        <details className="config-archive-list">
          <summary>归档 · {archived.length}</summary>
          {archived.map(item => (
            <div key={item.id}>
              <span>
                <LifeIcon id={item.iconId} size={15} />
                {item.name}
              </span>
              <button onClick={() => restore(item.id)}>
                <RotateCcw size={13} />
                恢复
              </button>
            </div>
          ))}
        </details>
      )}
      {draft && (
        <div className="config-editor">
          <div className="config-editor-head">
            <b>{draft.id ? '编辑项目' : '新增项目'}</b>
            <button onClick={() => setDraft(null)}>
              <X size={15} />
            </button>
          </div>
          <div className="config-fields">
            <label>
              名称
              <input
                value={draft.name}
                onChange={event =>
                  setDraft({ ...draft, name: event.target.value })
                }
              />
            </label>
            <label>
              单位
              <input
                value={draft.unit}
                onChange={event =>
                  setDraft({ ...draft, unit: event.target.value })
                }
              />
            </label>
          </div>
          <span className="config-field-label">图标</span>
          <div className="icon-picker">
            {lifeIconIds.map(id => (
              <button
                className={draft.iconId === id ? 'selected' : ''}
                key={id}
                onClick={() => setDraft({ ...draft, iconId: id })}
                aria-label={`选择 ${id} 图标`}
              >
                <LifeIcon id={id} size={17} />
              </button>
            ))}
          </div>
          <span className="config-field-label">颜色</span>
          <div className="config-tone-picker">
            {tones.map(tone => (
              <button
                className={`${tone} ${draft.tone === tone ? 'selected' : ''}`}
                key={tone}
                onClick={() => setDraft({ ...draft, tone })}
                aria-label={`选择${tone}颜色`}
              />
            ))}
          </div>
          <button className="config-save" onClick={save}>
            <Save size={14} />
            保存
          </button>
        </div>
      )}
      <ConfirmModal
        open={pendingArchive !== null}
        title="归档项目"
        message={`归档“${pendingArchive?.name ?? ''}”后，历史打卡会继续保留。`}
        confirmLabel="归档"
        onCancel={() => setPendingArchive(null)}
        onConfirm={archive}
      />
    </section>
  );
}
