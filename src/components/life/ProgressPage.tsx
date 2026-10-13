import {
  ChevronDown,
  Clock3,
  Headphones,
  Mic2,
  Plus,
  Users,
} from 'lucide-react';
import { useState } from 'react';

type Note = { title: string; page: string; quote: string };
const initialNotes: Note[] = [
  { title: '《悉达多》', page: 'P.86', quote: '读得慢一点，句子才会留下。' },
  {
    title: '《设计心理学》',
    page: 'P.124',
    quote: '好的设计，让正确的行动自然发生。',
  },
  { title: '《山茶文具店》', page: 'P.52', quote: '把心意放进每一个字里。' },
  { title: '《日日是好日》', page: 'P.18', quote: '雨天，就听雨。' },
];

export function ProgressPage({ notify }: { notify: (text: string) => void }) {
  const [checks, setChecks] = useState<string[]>(['听力']);
  const [minutes, setMinutes] = useState(25);
  const [notes, setNotes] = useState(initialNotes);
  const [expanded, setExpanded] = useState(false);
  const check = (name: string) => {
    setChecks(
      checks.includes(name)
        ? checks.filter(x => x !== name)
        : [...checks, name],
    );
    notify(`${name}打卡已更新`);
  };
  return (
    <>
      <section className="progress-intro">
        <span className="overline">A LITTLE BETTER</span>
        <h2>一点点积累，也是在向前。</h2>
      </section>
      <section className="life-section">
        <div className="section-heading">
          <div>
            <h2>英语打卡</h2>
            <p>听说练习与真实交流</p>
          </div>
          <span className="minutes">
            <Clock3 size={13} />
            {minutes} min
          </span>
        </div>
        <div className="quick-checks">
          <button
            className={checks.includes('听力') ? 'active' : ''}
            onClick={() => check('听力')}
          >
            <Headphones />
            <span>听力</span>
            <small>10 min</small>
          </button>
          <button
            className={checks.includes('口语') ? 'active' : ''}
            onClick={() => check('口语')}
          >
            <Mic2 />
            <span>口语</span>
            <small>跟读 5 句</small>
          </button>
        </div>
        <div className="time-stepper">
          <span>今日学习时长</span>
          <div>
            <button onClick={() => setMinutes(Math.max(0, minutes - 5))}>
              −
            </button>
            <b>{minutes} 分钟</b>
            <button onClick={() => setMinutes(minutes + 5)}>＋</button>
          </div>
        </div>
        <div className="goal-list">
          <button
            className={checks.includes('工作交流') ? 'done' : ''}
            onClick={() => check('工作交流')}
          >
            <Users size={16} />
            <span>
              <b>工作交流</b>
              <small>在会议里主动表达一个观点</small>
            </span>
            <i />
          </button>
          <button
            className={checks.includes('日常交流') ? 'done' : ''}
            onClick={() => check('日常交流')}
          >
            <Mic2 size={16} />
            <span>
              <b>日常交流</b>
              <small>自然聊满 3 分钟</small>
            </span>
            <i />
          </button>
        </div>
      </section>
      <section className="life-section notes-section">
        <div className="section-heading">
          <div>
            <h2>阅读便签</h2>
            <p>{notes.length} 张小小的阅读痕迹</p>
          </div>
          <button
            className="outline-action"
            onClick={() => {
              setNotes([
                ...notes,
                {
                  title: '未命名读物',
                  page: '新便签',
                  quote: '写下一句刚刚打动你的话。',
                },
              ]);
              setExpanded(true);
              notify('新便签已放进卡堆');
            }}
          >
            <Plus size={14} />
            新增
          </button>
        </div>
        <div className={`note-stack ${expanded ? 'expanded' : ''}`}>
          {notes.map((note, i) => (
            <article
              key={`${note.title}-${i}`}
              style={{ '--note-index': i } as React.CSSProperties}
            >
              <small>
                {note.title} · {note.page}
              </small>
              <p>{note.quote}</p>
              <span>READING NOTE · {String(i + 1).padStart(2, '0')}</span>
            </article>
          ))}
        </div>
        {notes.length > 2 && (
          <button
            className="stack-toggle"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '收起便签' : `展开其余 ${notes.length - 2} 张`}
            <ChevronDown size={14} />
          </button>
        )}
      </section>
    </>
  );
}
