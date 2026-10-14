import type { JournalEntry } from '@/hooks/useLifeStore';
import { Feather, Send, X } from 'lucide-react';
import { useRef, useState } from 'react';

export function JournalDrawer({
  entries,
  onEntries,
  notify,
}: {
  entries: JournalEntry[];
  onEntries: (entries: JournalEntry[]) => void;
  notify: (text: string) => void;
}) {
  const preview =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('preview')
      : '';
  const [open, setOpen] = useState(preview === 'journal');
  const [text, setText] = useState('');
  const [pressing, setPressing] = useState(false);
  const timer = useRef<number | null>(null);
  const stopPress = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setPressing(false);
  };
  const startPress = () => {
    if (!text.trim()) return notify('先写下一点此刻');
    stopPress();
    setPressing(true);
    timer.current = window.setTimeout(() => {
      const next = {
        id: Date.now(),
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };
      onEntries([next, ...entries]);
      setText('');
      setPressing(false);
      timer.current = null;
      notify('这一刻已收进时间轴');
    }, 1400);
  };
  return (
    <>
      <button
        className="journal-handle"
        onClick={() => setOpen(true)}
        aria-label="打开日记"
      >
        <Feather />
      </button>
      {open && (
        <div className="journal-mask" onPointerDown={() => setOpen(false)}>
          <aside
            className="journal-drawer"
            onPointerDown={event => event.stopPropagation()}
          >
            <header>
              <div>
                <span>PRIVATE TIMELINE</span>
                <h2>只写给自己的片刻</h2>
              </div>
              <button onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </header>
            <div className="journal-compose">
              <textarea
                value={text}
                onChange={event => setText(event.target.value)}
                placeholder="此刻想记下……"
              />
              <button
                className={`hold-publish ${pressing ? 'pressing' : ''}`}
                onPointerDown={startPress}
                onPointerUp={stopPress}
                onPointerCancel={stopPress}
                onPointerLeave={stopPress}
              >
                <i />
                <Send size={15} />
                <span>按住发布</span>
              </button>
            </div>
            <div className="journal-timeline">
              {entries.length ? (
                entries.map(entry => (
                  <article key={entry.id}>
                    <time>
                      {new Intl.DateTimeFormat('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(entry.createdAt))}
                    </time>
                    <p>{entry.text}</p>
                  </article>
                ))
              ) : (
                <p className="journal-empty">时间轴还很安静。</p>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
