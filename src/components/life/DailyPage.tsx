import type {
  DayRecord,
  JournalEntry,
  LifeTask,
  Meal,
} from '@/hooks/useLifeStore';
import { TODAY, compressImage, formatShort, weekStart } from '@/lib/lifeUtils';
import { Camera, RotateCcw, X } from 'lucide-react';
import { useRef } from 'react';
import { JournalDrawer } from './JournalDrawer';
import type { Phase } from './LineArt';
import { SportIcon } from './LineArt';
import { MoodPanel } from './MoodPanel';
import { WeekPlanner } from './WeekPlanner';

const mealMeta = [
  { key: 'breakfast', label: '早餐' },
  { key: 'lunch', label: '午餐' },
  { key: 'dinner', label: '晚餐' },
] as const;
interface Props {
  date: string;
  week: string;
  day: DayRecord;
  days: Record<string, DayRecord>;
  tasks: LifeTask[];
  phases: Record<string, Phase>;
  journals: JournalEntry[];
  onDate: (date: string) => void;
  onWeek: (date: string) => void;
  onDay: (day: DayRecord) => void;
  onTasks: (tasks: LifeTask[]) => void;
  onJournals: (items: JournalEntry[]) => void;
  onPhase: (date: string, phase: Phase) => void;
  openTask: (start: string, end: string) => void;
  notify: (text: string) => void;
}
export function DailyPage(props: Props) {
  const {
    date,
    week,
    day,
    days,
    tasks,
    phases,
    journals,
    onDate,
    onWeek,
    onDay,
    onTasks,
    onJournals,
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
            onChange={event => selectDate(event.target.value)}
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
        <div className="section-heading diet-heading">
          <div>
            <h2>daily diet</h2>
            <p>{formatShort(date)}</p>
          </div>
          <label className="weight-input">
            <input
              inputMode="decimal"
              aria-label="体重"
              value={day.weight ?? ''}
              onChange={event =>
                onDay({
                  ...day,
                  weight: event.target.value.replace(/[^\d.]/g, ''),
                })
              }
            />
            <span>kg</span>
          </label>
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
                onChange={event => setMeal(key, { text: event.target.value })}
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
                onChange={async event => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    setMeal(key, {
                      image: await compressImage(file, 520, 0.65),
                    });
                    notify('图片已压缩并保存');
                  } catch (error) {
                    notify((error as Error).message);
                  }
                }}
              />
            </article>
          ))}
        </div>
      </section>
      <section className="life-section">
        <div className="section-heading">
          <h2>Exercise</h2>
        </div>
        <div className="exercise-list">
          {(['strength', 'cardio'] as const).map(key => (
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
                <b>{key === 'strength' ? '力量' : '有氧'}</b>
              </span>
              <strong>{day.exercise[key] ? '已完成' : '待完成'}</strong>
            </button>
          ))}
        </div>
      </section>
      <MoodPanel date={date} day={day} days={days} onDay={onDay} />
      <JournalDrawer
        entries={journals}
        onEntries={onJournals}
        notify={notify}
      />
    </>
  );
}
