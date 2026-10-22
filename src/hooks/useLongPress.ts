import { useEffect, useRef } from 'react';
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';

const interactiveSelector = 'button, input, textarea, select, a';

export function useLongPress<T>(onLongPress: (value: T) => void, delay = 550) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPoint = useRef({ x: 0, y: 0 });
  const triggered = useRef(false);

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => cancel, []);

  return (value: T) => ({
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if ((event.target as HTMLElement).closest(interactiveSelector)) return;
      cancel();
      triggered.current = false;
      startPoint.current = { x: event.clientX, y: event.clientY };
      timer.current = setTimeout(() => {
        triggered.current = true;
        onLongPress(value);
      }, delay);
    },
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
      if (
        Math.abs(event.clientX - startPoint.current.x) > 10 ||
        Math.abs(event.clientY - startPoint.current.y) > 10
      ) {
        cancel();
      }
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    onContextMenu: (event: ReactMouseEvent<HTMLElement>) => {
      event.preventDefault();
      cancel();
      onLongPress(value);
    },
    onClickCapture: (event: ReactMouseEvent<HTMLElement>) => {
      if (!triggered.current) return;
      event.preventDefault();
      event.stopPropagation();
      triggered.current = false;
    },
  });
}
