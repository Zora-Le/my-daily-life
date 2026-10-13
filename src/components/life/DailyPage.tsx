import type { DayRecord, LifeTask, Meal } from '@/hooks/useLifeStore';
import { TODAY, compressImage, formatShort, weekStart } from '@/lib/lifeUtils';
import { Camera, Crown, Flame, Flower2, RotateCcw, X } from 'lucide-react';
import { useRef } from 'react';
import type { Phase } from './LineArt';
import { SportIcon } from './LineArt';
import { WeekPlanner } from './WeekPlanner';

const moods = [
  { name: '平静', tone: 'calm', mouth: '⌣' },
  { name: '开心', tone: 'happy', mouth: '⌣' },
  { name: '疲惫', tone: 'tired', mouth: '﹏' },
  { name: '低落', tone: 'low', mouth: '︵' },
  { name: '暴躁', tone: 'angry', mouth: '⌁' },
];
const mealMeta = [
  { key: 'breakfast', label: '早餐' },
  { key: 'lunch', label: '午餐' },
  { key: 'dinner', label: '晚餐' },
] as const;
interface Props {
  date: string;
  week: string;
  day: DayRecord;
  tasks: LifeTask[];
  phases: Record<string, Phase>;
  onDate: (date: string) => void;
  onWeek: (date: string) => void;
  onDay: (day: DayRecord) => void;
  onTasks: (tasks: LifeTask[]) => void;
  onPhase: (date: string, phase: Phase) => void;
  openTask: (start: string, end: string) => void;
  notify: (text: string) => void;
}
export function DailyPage(props: Props) {
  const {
    date,
    week,
    day,
    tasks,
    phases,
    onDate,
    onWeek,
    onDay,
    onTasks,
    onPhase,
    openTask,
    notify,
  } = props;
  const uploads = useRef<Record<string, HTMLInputElement | null>>({});
  const setMeal = (key: keyof DayRecord['meals'], patch: Partial<Meal>) =>
    onDay({
      ...day,
      meals: { ...day.meals, [key]: { ...day.meals[key], ...patch } },
    });
  const selectDate = (next: string) => {
    onDate(next);
    onWeek(weekStart(next));
  };
  return (
    <>
      <div className="date-toolbar">
        <label>
          <span>正在记录</span>
          <input
            type="date"
            value={date}
            onChange={e => selectDate(e.target.value)}
          />
        </label>
        {date !== TODAY && (
          <button onClick={() => selectDate(TODAY)}>
            <RotateCcw size={13} />
            回到今天
          </button>
        )}
      </div>
      <WeekPlanner
        tasks={tasks}
        week={week}
        selectedDate={date}
        phasesByDate={phases}
        onWeekChange={onWeek}
        onSelectDate={onDate}
        onPhase={onPhase}
        onTasks={onTasks}
        openTask={openTask}
      />
      <section className="life-section">
        <div className="section-heading">
          <div>
            <h2>daily diet</h2>
            <p>{formatShort(date)}</p>
          </div>
        </div>
        <div className="meal-row">
          {mealMeta.map(({ key, label }) => (
            <article
              className={
                day.meals[key].text || day.meals[key].image ? 'recorded' : ''
              }
              key={key}
            >
              <div className="meal-top">
                <span>{label}</span>
                {day.meals[key].image && (
                  <button
                    className="mini-remove"
                    onClick={() => setMeal(key, { image: undefined })}
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
              <textarea
                value={day.meals[key].text}
                onChange={e => setMeal(key, { text: e.target.value })}
                placeholder="吃了什么？"
                rows={2}
              />
              {day.meals[key].image ? (
                <button
                  className="meal-thumb"
                  onClick={() => uploads.current[key]?.click()}
                >
                  <img src={day.meals[key].image} alt={`${label}记录`} />
                </button>
              ) : (
                <button
                  className="meal-add"
                  onClick={() => uploads.current[key]?.click()}
                >
                  <Camera size={15} />
                  <small>添图</small>
                </button>
              )}
              <input
                ref={node => {
                  uploads.current[key] = node;
                }}
                hidden
                type="file"
                accept="image/*"
                onChange={async e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setMeal(key, {
                      image: await compressImage(file, 520, 0.65),
                    });
                    notify('图片已压缩并保存');
                  } catch (err) {
                    notify((err as Error).message);
                  }
                }}
              />
            </article>
          ))}
        </div>
      </section>
      <section className="life-section">
        <div className="section-heading">
          <h2>运动</h2>
        </div>
        <div className="exercise-list">
          {(['cardio', 'strength'] as const).map(key => (
            <button
              className={`exercise-row ${day.exercise[key] ? 'completed' : ''}`}
              key={key}
              onClick={() =>
                onDay({
                  ...day,
                  exercise: { ...day.exercise, [key]: !day.exercise[key] },
                })
              }
            >
              <span className="sport-icon">
                <SportIcon strength={key === 'strength'} />
              </span>
              <span className="sport-copy">
                <b>{key === 'cardio' ? '有氧 · 游泳' : '无氧 · 力量'}</b>
              </span>
              <strong>{day.exercise[key] ? '已完成' : '待完成'}</strong>
            </button>
          ))}
        </div>
      </section>
      <section className="life-section mood-section">
        <div className="section-heading">
          <h2>这一天感觉怎样？</h2>
        </div>
        <div className="mood-row">
          {moods.map(item => {
            const selected = day.mood === item.name;
            return (
              <button
                className={`pixel-mood ${item.tone} ${selected ? 'selected' : ''}`}
                key={item.name}
                onClick={() => onDay({ ...day, mood: item.name })}
              >
                <span className="pixel-face">
                  <i />
                  <i />
                  <b>{item.mouth}</b>
                  {selected && item.tone === 'calm' && (
                    <Crown className="mood-crown" />
                  )}
                  {selected && item.tone === 'happy' && (
                    <span className="mood-flowers">
                      <Flower2 />
                      <Flower2 />
                      <Flower2 />
                      <Flower2 />
                    </span>
                  )}
                  {selected && item.tone === 'tired' && (
                    <span className="mood-zzz">
                      <i>z</i>
                      <i>z</i>
                      <i>z</i>
                    </span>
                  )}
                  {selected && item.tone === 'angry' && (
                    <Flame className="mood-fire" fill="currentColor" />
                  )}
                </span>
                <small>{item.name}</small>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
