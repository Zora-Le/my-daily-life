import { Camera, Check, Pencil, Save } from 'lucide-react';
import { useState } from 'react';
import { RunnerIcon } from './LineArt';
import { type Task, WeekPlanner } from './WeekPlanner';

interface Props {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  openTask: (start: string, end: string) => void;
  notify: (text: string) => void;
  mealDone: number;
  setMealDone: (count: number) => void;
}
const moods = [
  { name: '平静', tone: 'calm', mouth: '—' },
  { name: '开心', tone: 'happy', mouth: '⌣' },
  { name: '疲惫', tone: 'tired', mouth: '﹏' },
  { name: '低落', tone: 'low', mouth: '︵' },
  { name: '暴躁', tone: 'angry', mouth: '⌁' },
];

export function DailyPage({
  tasks,
  setTasks,
  openTask,
  notify,
  mealDone,
  setMealDone,
}: Props) {
  const [quote, setQuote] = useState('今天也要留一点时间，给风和自己。');
  const [draft, setDraft] = useState(quote);
  const [editing, setEditing] = useState(false);
  const [exercise, setExercise] = useState({ cardio: 1, strength: 0 });
  const [mood, setMood] = useState('平静');
  const bump = (key: 'cardio' | 'strength') =>
    setExercise({ ...exercise, [key]: (exercise[key] + 1) % 3 });
  return (
    <>
      <section className="daily-quote">
        <span className="color-block" />
        <div>
          {editing ? (
            <input value={draft} onChange={e => setDraft(e.target.value)} />
          ) : (
            <p>{quote}</p>
          )}
        </div>
        <button
          onClick={() => {
            if (editing) {
              setQuote(draft || quote);
              notify('今日一句已保存');
            }
            setEditing(!editing);
          }}
          aria-label={editing ? '保存每日一句' : '编辑每日一句'}
        >
          {editing ? <Save size={15} /> : <Pencil size={15} />}
        </button>
      </section>
      <WeekPlanner tasks={tasks} setTasks={setTasks} openTask={openTask} />
      <section className="life-section">
        <div className="section-heading">
          <div>
            <h2>daily diet</h2>
            <p>细嚼慢咽 + 七分饱</p>
          </div>
          <button
            className="text-action"
            onClick={() => notify('三餐记录已保存')}
          >
            保存
          </button>
        </div>
        <div className="meal-row">
          {['早餐', '午餐', '晚餐'].map((meal, i) => (
            <article className={i < mealDone ? 'recorded' : ''} key={meal}>
              <div className="meal-top">
                <span>{meal}</span>
                {i < mealDone && <Check size={13} />}
              </div>
              <button
                onClick={() => {
                  setMealDone(Math.max(mealDone, i + 1));
                  notify(`${meal}图片选择器已打开`);
                }}
              >
                <Camera size={18} />
                <small>
                  {i === 0
                    ? '酸奶与莓果'
                    : i === 1
                      ? '番茄牛腩饭'
                      : i < mealDone
                        ? '清炒时蔬'
                        : '添加图片'}
                </small>
              </button>
            </article>
          ))}
        </div>
      </section>
      <section className="life-section">
        <div className="section-heading">
          <div>
            <h2>运动</h2>
            <p>轻点进度条，每次完成一半</p>
          </div>
        </div>
        <div className="exercise-list">
          {(['cardio', 'strength'] as const).map(key => (
            <button
              className="exercise-row"
              key={key}
              onClick={() => bump(key)}
            >
              <span className="sport-icon">
                <RunnerIcon strength={key === 'strength'} />
              </span>
              <span className="sport-copy">
                <b>{key === 'cardio' ? '有氧' : '无氧'}</b>
                <small>{exercise[key]}/2 次 · 点击打卡</small>
                <span className="exercise-track">
                  <i style={{ width: `${exercise[key] * 50}%` }} />
                  <em />
                </span>
              </span>
              <strong>{exercise[key] * 50}%</strong>
            </button>
          ))}
        </div>
      </section>
      <section className="life-section mood-section">
        <div className="section-heading">
          <h2>今天感觉怎样？</h2>
        </div>
        <div className="mood-row">
          {moods.map(item => (
            <button
              className={`pixel-mood ${item.tone} ${mood === item.name ? 'selected' : ''}`}
              key={item.name}
              onClick={() => {
                setMood(item.name);
                notify(`已记下：${item.name}`);
              }}
            >
              <span className="pixel-face">
                <i />
                <i />
                <b>{item.mouth}</b>
              </span>
              <small>{item.name}</small>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
