import type { SavingsIsland as SavingsIslandData } from '@/hooks/lifeSchema';
import { Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ConfirmModal } from './ConfirmModal';

interface Props {
  item: SavingsIslandData;
  editMode: boolean;
  editingName: boolean;
  onEditingName: (editing: boolean) => void;
  onName: (name: string) => void;
  onAmount: (expression: string) => boolean;
  onDelete: () => void;
}

export function SavingsIsland({
  item,
  editMode,
  editingName,
  onEditingName,
  onName,
  onAmount,
  onDelete,
}: Props) {
  const [nameDraft, setNameDraft] = useState(item.displayName);
  const [editingAmount, setEditingAmount] = useState(false);
  const [amountDraft, setAmountDraft] = useState(item.expression);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const amountInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName) nameInput.current?.focus();
  }, [editingName]);
  useEffect(() => {
    if (editingAmount) amountInput.current?.focus();
  }, [editingAmount]);
  const confirmDelete = () => {
    onDelete();
    setConfirmingDelete(false);
  };
  const saveName = () => {
    const value = nameDraft.trim();
    setNameDraft(value || item.displayName);
    if (value) onName(value);
    onEditingName(false);
  };
  const saveAmount = () => {
    if (onAmount(amountDraft)) setEditingAmount(false);
  };

  return (
    <article className={`paper-island ${editMode ? 'is-editing' : ''}`}>
      <div className="island-name">
        {editingName ? (
          <input
            aria-label="岛屿名称"
            ref={nameInput}
            value={nameDraft}
            onChange={event => setNameDraft(event.target.value)}
            onBlur={saveName}
            onKeyDown={event => {
              if (event.key === 'Enter') event.currentTarget.blur();
              if (event.key === 'Escape') {
                setNameDraft(item.displayName);
                onEditingName(false);
              }
            }}
            onClick={event => event.stopPropagation()}
          />
        ) : editMode ? (
          <button
            className="island-name-button editable"
            onClick={event => {
              event.stopPropagation();
              setNameDraft(item.displayName);
              onEditingName(true);
            }}
            aria-label={`重命名${item.displayName}`}
          >
            {item.displayName}
          </button>
        ) : (
          <span className="island-name-text">{item.displayName}</span>
        )}
      </div>
      {editingAmount ? (
        <input
          className="island-amount-input"
          aria-label={`${item.displayName}金额算式`}
          ref={amountInput}
          inputMode="decimal"
          value={amountDraft}
          onChange={event => setAmountDraft(event.target.value)}
          onBlur={saveAmount}
          onKeyDown={event => {
            if (event.key === 'Enter') event.currentTarget.blur();
            if (event.key === 'Escape') {
              setAmountDraft(item.expression);
              setEditingAmount(false);
            }
          }}
          onClick={event => event.stopPropagation()}
        />
      ) : (
        <button
          className="island-amount-button"
          onClick={() => {
            setAmountDraft(item.expression);
            setEditingAmount(true);
          }}
          aria-label={`编辑${item.displayName}金额`}
        >
          ¥ {item.value.toLocaleString()}
        </button>
      )}
      {item.detail && <span>{item.detail}</span>}
      {editMode && (
        <button
          type="button"
          className="island-delete"
          aria-label={`删除${item.displayName}`}
          title="删除岛屿"
          onClick={event => {
            event.stopPropagation();
            setConfirmingDelete(true);
          }}
        >
          <Trash2 size={12} />
        </button>
      )}
      <ConfirmModal
        open={confirmingDelete}
        title="删除储蓄岛屿"
        message={`删除“${item.displayName}”后，金额记录也会一并移除。`}
        confirmLabel="删除"
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={confirmDelete}
      />
    </article>
  );
}
