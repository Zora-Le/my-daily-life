import type { SavingsIsland as SavingsIslandData } from '@/hooks/lifeSchema';
import { Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';

interface Props {
  item: SavingsIslandData;
  editingName: boolean;
  onEditingName: (editing: boolean) => void;
  onName: (name: string) => void;
  onAmount: (expression: string) => boolean;
  onDelete: () => void;
}

const LONG_PRESS_MS = 900;

export function SavingsIsland({
  item,
  editingName,
  onEditingName,
  onName,
  onAmount,
  onDelete,
}: Props) {
  const [nameDraft, setNameDraft] = useState(item.displayName);
  const [editingAmount, setEditingAmount] = useState(false);
  const [amountDraft, setAmountDraft] = useState(item.expression);
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const amountInput = useRef<HTMLInputElement>(null);
  const longPressTriggered = useRef(false);

  useEffect(() => {
    if (editingName) nameInput.current?.focus();
  }, [editingName]);
  useEffect(() => {
    if (editingAmount) amountInput.current?.focus();
  }, [editingAmount]);

  const confirmDelete = () => {
    if (window.confirm(`删除“${item.displayName}”？金额记录将一并移除。`)) {
      onDelete();
    }
  };
  const clearPress = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  };
  const startPress = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    longPressTriggered.current = false;
    setHolding(true);
    timer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setHolding(false);
      navigator.vibrate?.(35);
      confirmDelete();
    }, LONG_PRESS_MS);
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
    <article className="paper-island">
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
        ) : (
          <button
            className="island-name-button"
            onClick={event => {
              event.stopPropagation();
              setNameDraft(item.displayName);
              onEditingName(true);
            }}
            aria-label={`重命名${item.displayName}`}
          >
            {item.displayName}
          </button>
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
      <button
        className={`island-delete ${holding ? 'holding' : ''}`}
        aria-label={`长按删除${item.displayName}`}
        title="按住 0.9 秒删除"
        onContextMenu={event => event.preventDefault()}
        onPointerDown={startPress}
        onPointerUp={clearPress}
        onPointerCancel={clearPress}
        onLostPointerCapture={clearPress}
        onClick={event => {
          event.stopPropagation();
          if (event.detail === 0 && !longPressTriggered.current)
            confirmDelete();
        }}
      >
        <Trash2 size={13} />
        <span>长按</span>
      </button>
    </article>
  );
}
