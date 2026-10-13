import type { DayRecord, ReadingItem, ReadingNote } from '@/hooks/useLifeStore';
import { formatShort } from '@/lib/lifeUtils';
import { BookOpen, Headphones, Mic2, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface Props {
  date: string;
  day: DayRecord;
  books: ReadingItem[];
  notes: ReadingNote[];
  onDay: (day: DayRecord) => void;
  onBooks: (items: ReadingItem[]) => void;
  onNotes: (items: ReadingNote[]) => void;
  notify: (text: string) => void;
}
const bookColors = ['sage', 'rose', 'ochre', 'slate', 'lilac', 'sand'];

export function ProgressPage({
  date,
  day,
  books,
  notes,
  onDay,
  onBooks,
  onNotes,
  notify,
}: Props) {
  const [bookTitle, setBookTitle] = useState('');
  const [shelf, setShelf] = useState<1 | 2>(1);
  const [pressing, setPressing] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<ReadingItem | null>(null);
  const [showFinished, setShowFinished] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [previewNote, setPreviewNote] = useState<ReadingNote | null>(null);
  const holdTimer = useRef<number | null>(null);
  const english = day.english;
  const setMinutes = (key: 'listening' | 'speaking', value: number) =>
    onDay({
      ...day,
      english: { ...english, [key]: Math.max(0, Math.min(999, value || 0)) },
    });
  const waiting = books.filter(book => !book.finishedAt);
  const finished = books.filter(book => book.finishedAt);
  const clearHold = () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setPressing(null);
  };
  const startHold = (book: ReadingItem) => {
    clearHold();
    setPressing(book.id);
    holdTimer.current = window.setTimeout(() => {
      setPressing(null);
      setSelectedBook(book);
      holdTimer.current = null;
    }, 5000);
  };
  const addBook = () => {
    if (!bookTitle.trim()) return notify('请输入读物名称');
    onBooks([
      ...books,
      { id: Date.now(), title: bookTitle.trim(), shelf, createdAt: date },
    ]);
    setBookTitle('');
  };
  const addNote = () => {
    if (!noteTitle.trim() && !noteText.trim()) return notify('请输入阅读内容');
    onNotes([
      ...notes,
      {
        id: Date.now(),
        title: noteTitle.trim() || '阅读随记',
        text: noteText.trim(),
        createdAt: date,
      },
    ]);
    setNoteTitle('');
    setNoteText('');
  };
  return (
    <>
      <section className="progress-intro">
        <span className="overline">{formatShort(date)}</span>
        <h2>my progress</h2>
      </section>
      <section className="life-section">
        <div className="english-cards">
          {[
            { key: 'listening' as const, name: '听力', Icon: Headphones },
            { key: 'speaking' as const, name: '口语', Icon: Mic2 },
          ].map(({ key, name, Icon }) => (
            <article className={english[key] > 0 ? 'active' : ''} key={key}>
              <Icon />
              <b>{name}</b>
              <label>
                <input
                  inputMode="numeric"
                  type="number"
                  min="0"
                  value={english[key]}
                  onChange={event =>
                    setMinutes(key, Number(event.target.value))
                  }
                />
                <span>分钟</span>
              </label>
              <div>
                {[10, 20, 45].map(value => (
                  <button key={value} onClick={() => setMinutes(key, value)}>
                    {value}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="life-section bookshelf-section">
        <div className="section-heading">
          <h2>每日阅读</h2>
          <button
            className="outline-action"
            onClick={() => setShowFinished(true)}
          >
            <BookOpen size={14} />
            已读 + {finished.length}
          </button>
        </div>
        <div className="add-reading">
          <input
            value={bookTitle}
            onChange={event => setBookTitle(event.target.value)}
            placeholder="读物名称"
          />
          <select
            value={shelf}
            onChange={event => setShelf(Number(event.target.value) as 1 | 2)}
          >
            <option value={1}>上层</option>
            <option value={2}>下层</option>
          </select>
          <button onClick={addBook} aria-label="添加读物">
            <Plus size={15} />
          </button>
        </div>
        <div className="bookcase">
          {[1, 2].map(level => (
            <div className="book-shelf" key={level}>
              <div className="book-row">
                {waiting
                  .filter(book => book.shelf === level)
                  .map((book, index) => (
                    <button
                      className={`book-spine ${bookColors[(book.id + index) % bookColors.length]} ${pressing === book.id ? 'pressing' : ''}`}
                      key={book.id}
                      onPointerDown={() => startHold(book)}
                      onPointerUp={clearHold}
                      onPointerCancel={clearHold}
                      onPointerLeave={clearHold}
                    >
                      <span>{book.title}</span>
                      <i />
                    </button>
                  ))}
              </div>
              <i />
            </div>
          ))}
        </div>
        <div className="note-compose">
          <input
            value={noteTitle}
            onChange={event => setNoteTitle(event.target.value)}
            placeholder="书名"
          />
          <textarea
            value={noteText}
            onChange={event => setNoteText(event.target.value)}
            placeholder="阅读便签"
            rows={2}
          />
          <button onClick={addNote}>
            <Plus size={14} />
            添加便签
          </button>
        </div>
        <div className="reading-note-stack">
          {notes.map((note, index) => (
            <button
              key={note.id}
              style={{ '--note-order': index } as React.CSSProperties}
              onClick={() => setPreviewNote(note)}
            >
              <small>{note.title}</small>
              <p>{note.text}</p>
              <time>{note.createdAt}</time>
            </button>
          ))}
        </div>
      </section>
      {selectedBook && (
        <div className="modal-mask" onPointerDown={() => setSelectedBook(null)}>
          <div
            className="book-actions"
            onPointerDown={event => event.stopPropagation()}
          >
            <b>{selectedBook.title}</b>
            <button
              onClick={() => {
                onBooks(
                  books.map(book =>
                    book.id === selectedBook.id
                      ? { ...book, finishedAt: date }
                      : book,
                  ),
                );
                setSelectedBook(null);
              }}
            >
              已读完
            </button>
            <button
              className="danger"
              onClick={() => {
                onBooks(books.filter(book => book.id !== selectedBook.id));
                setSelectedBook(null);
              }}
            >
              删除
            </button>
            <button onClick={() => setSelectedBook(null)}>取消</button>
          </div>
        </div>
      )}
      {showFinished && (
        <div
          className="modal-mask"
          onPointerDown={() => setShowFinished(false)}
        >
          <div
            className="reading-modal"
            onPointerDown={event => event.stopPropagation()}
          >
            <div className="modal-head">
              <h2>已读书目</h2>
              <button onClick={() => setShowFinished(false)}>
                <X size={18} />
              </button>
            </div>
            {finished.length ? (
              finished.map(book => (
                <div key={book.id}>
                  <span>{book.title}</span>
                  <time>{book.finishedAt}</time>
                </div>
              ))
            ) : (
              <small>暂无记录</small>
            )}
          </div>
        </div>
      )}
      {previewNote && (
        <div className="modal-mask" onPointerDown={() => setPreviewNote(null)}>
          <article
            className="note-preview"
            onPointerDown={event => event.stopPropagation()}
          >
            <button onClick={() => setPreviewNote(null)}>
              <X size={18} />
            </button>
            <small>
              {previewNote.title} · {previewNote.createdAt}
            </small>
            <p>{previewNote.text}</p>
          </article>
        </div>
      )}
    </>
  );
}
