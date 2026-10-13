import type { DayRecord, ReadingItem, ReadingNote } from '@/hooks/useLifeStore';
import { compressImage, formatShort } from '@/lib/lifeUtils';
import {
  BookOpen,
  Camera,
  Check,
  Headphones,
  Mic2,
  Plus,
  Users,
  X,
} from 'lucide-react';
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
  const [showAll, setShowAll] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const noteUpload = useRef<HTMLInputElement>(null);
  const english = day.english;
  const setMinutes = (key: keyof DayRecord['english'], value: number) =>
    onDay({
      ...day,
      english: { ...english, [key]: Math.max(0, Math.min(999, value || 0)) },
    });
  const waiting = books.filter(book => !book.finishedAt);
  const addBook = () => {
    if (!bookTitle.trim()) return notify('先写下书、论文或文章名称');
    onBooks([
      ...books,
      { id: Date.now(), title: bookTitle.trim(), shelf, createdAt: date },
    ]);
    setBookTitle('');
    notify('已放入待读书柜');
  };
  const finishBook = (id: number) =>
    onBooks(
      books.map(book =>
        book.id === id ? { ...book, finishedAt: date } : book,
      ),
    );
  const addNote = () => {
    if (!noteTitle.trim() && !noteText.trim())
      return notify('先写一点阅读内容');
    onNotes([
      ...notes,
      {
        id: Date.now(),
        title: noteTitle.trim() || '阅读随记',
        text: noteText.trim(),
        images: [],
        createdAt: date,
      },
    ]);
    setNoteTitle('');
    setNoteText('');
  };
  return (
    <>
      <section className="progress-intro">
        <span className="overline">ENGLISH · {formatShort(date)}</span>
        <h2>英语 my progress</h2>
        <p>每张卡都能直接填写这一天投入的分钟数。</p>
      </section>
      <section className="life-section">
        <div className="section-heading">
          <h2>英语打卡</h2>
          <span className="minutes">自动保存</span>
        </div>
        <div className="english-cards">
          {[
            { key: 'listening' as const, name: '听力', Icon: Headphones },
            { key: 'speaking' as const, name: '口语', Icon: Mic2 },
            { key: 'work' as const, name: '工作交流', Icon: Users },
            { key: 'daily' as const, name: '日常交流', Icon: Mic2 },
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
                  onChange={e => setMinutes(key, Number(e.target.value))}
                />
                <span>分钟</span>
              </label>
              <div>
                {[10, 20, 45].map(n => (
                  <button key={n} onClick={() => setMinutes(key, n)}>
                    {n}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="life-section bookshelf-section">
        <div className="section-heading">
          <div>
            <h2>待读书柜</h2>
            <p>书、论文与文章都可以放进来</p>
          </div>
          <button
            className="outline-action"
            onClick={() => setShowAll(!showAll)}
          >
            <BookOpen size={14} />
            全部 {books.length}
          </button>
        </div>
        <div className="add-reading">
          <input
            value={bookTitle}
            onChange={e => setBookTitle(e.target.value)}
            placeholder="输入想读的名称"
          />
          <select
            value={shelf}
            onChange={e => setShelf(Number(e.target.value) as 1 | 2)}
          >
            <option value={1}>上层</option>
            <option value={2}>下层</option>
          </select>
          <button onClick={addBook}>
            <Plus size={15} />
          </button>
        </div>
        {[1, 2].map(level => (
          <div className="book-shelf" key={level}>
            <div className="book-row">
              {waiting
                .filter(book => book.shelf === level)
                .map(book => (
                  <button
                    className="book-spine"
                    key={book.id}
                    title="点击标记完成"
                    onClick={() => finishBook(book.id)}
                  >
                    <span>{book.title}</span>
                    <Check size={11} />
                  </button>
                ))}
              {!waiting.some(book => book.shelf === level) && (
                <small>这一层还有位置</small>
              )}
            </div>
            <i />
          </div>
        ))}
        <button
          className="finished-link"
          onClick={() => setShowFinished(!showFinished)}
        >
          已读记录 · {books.filter(b => b.finishedAt).length}
        </button>
        {(showAll || showFinished) && (
          <div className="reading-list">
            {books
              .filter(b => showAll || b.finishedAt)
              .map(book => (
                <div key={book.id}>
                  <span>{book.title}</span>
                  <small>
                    {book.finishedAt
                      ? `完成于 ${book.finishedAt}`
                      : `${book.shelf === 1 ? '上' : '下'}层 · 待读`}
                  </small>
                </div>
              ))}
          </div>
        )}
      </section>
      <section className="life-section notes-section">
        <div className="section-heading">
          <div>
            <h2>阅读便签</h2>
            <p>左右滑动浏览，轻点图片放大</p>
          </div>
        </div>
        <div className="note-compose">
          <input
            value={noteTitle}
            onChange={e => setNoteTitle(e.target.value)}
            placeholder="读物名称"
          />
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="写下一句打动你的话"
            rows={2}
          />
          <button onClick={addNote}>
            <Plus size={14} />
            新增文字便签
          </button>
        </div>
        <div className="note-gallery">
          {notes.map(note => (
            <article key={note.id}>
              <small>
                {note.title} · {note.createdAt}
              </small>
              <p>{note.text}</p>
              <div className="note-images">
                {note.images.map((image, i) => (
                  <button
                    key={`${note.id}-${i}`}
                    onClick={() => setPreview(image)}
                  >
                    <img src={image} alt="阅读便签" />
                  </button>
                ))}
                {note.images.length < 4 && (
                  <button
                    className="note-image-add"
                    onClick={() => {
                      noteUpload.current?.setAttribute(
                        'data-note',
                        String(note.id),
                      );
                      noteUpload.current?.click();
                    }}
                  >
                    <Camera size={15} />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
        <input
          ref={noteUpload}
          hidden
          type="file"
          accept="image/*"
          multiple
          onChange={async e => {
            const id = Number(e.currentTarget.getAttribute('data-note'));
            const files = Array.from(e.target.files ?? []).slice(0, 4);
            const target = notes.find(n => n.id === id);
            if (!target) return;
            if (target.images.length + files.length > 4)
              return notify('每张便签最多保存 4 张图');
            try {
              const images = await Promise.all(
                files.map(file => compressImage(file, 720, 0.64)),
              );
              onNotes(
                notes.map(note =>
                  note.id === id
                    ? {
                        ...note,
                        images: [...note.images, ...images].slice(0, 4),
                      }
                    : note,
                ),
              );
              notify('图片已压缩保存');
            } catch (err) {
              notify((err as Error).message);
            }
          }}
        />
      </section>
      {preview && (
        <div className="image-preview" onClick={() => setPreview(null)}>
          <button>
            <X />
          </button>
          <img src={preview} alt="大图预览" />
        </div>
      )}
    </>
  );
}
