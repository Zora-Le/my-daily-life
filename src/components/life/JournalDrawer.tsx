import type { JournalEntry } from '@/hooks/useLifeStore';
import { Feather, Send, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  const publish = () => {
    if (!text.trim()) return notify('先写下一点此刻');
    const next = {
      id: Date.now(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    onEntries([next, ...entries]);
    setText('');
    notify('这一刻已收进时间轴');
  };
  return (
    <>
      <button
        className="journal-handle"
        onClick={() => setOpen(true)}
        aria-label="打开时光日记本"
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
                <h2>时光日记本</h2>
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
              <button className="journal-publish" onClick={publish}>
                <Send size={15} />
                <span>发布</span>
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
