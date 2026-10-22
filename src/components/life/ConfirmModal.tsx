import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  open,
  title = '确认操作',
  message,
  confirmLabel = '确定',
  onCancel,
  onConfirm,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="confirm-modal-mask" onPointerDown={onCancel}>
      <section
        className="confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        onPointerDown={event => event.stopPropagation()}
      >
        <span className="confirm-modal-icon" aria-hidden="true">
          <AlertTriangle size={18} />
        </span>
        <h2 id="confirm-modal-title">{title}</h2>
        <p id="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button type="button" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
