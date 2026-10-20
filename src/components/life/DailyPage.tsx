import type {
  ConfigItem,
  DayRecord,
  JournalEntry,
  LifeTask,
  Meal,
  MenstrualRecord,
} from '@/hooks/useLifeStore';
import { TODAY, formatLong, formatShort, weekStart } from '@/lib/lifeUtils';
import { RotateCcw } from 'lucide-react';
import { HabitCheckins } from './HabitCheckins';
import { JournalDrawer } from './JournalDrawer';
import { MealGallery } from './MealGallery';
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
  menstrualRecords: MenstrualRecord[];
  journals: JournalEntry[];
  habitItems: ConfigItem[];
  onDate: (date: string) => void;
  onWeek: (date: string) => void;
  onDay: (day: DayRecord) => void;
  onTasks: (tasks: LifeTask[]) => void;
  onEditTask: (task: LifeTask) => void;
  onDeleteTask: (taskId: number) => void;
  onJournals: (items: JournalEntry[]) => void;
  onMarkPeriodStart: (date: string) => void;
  onMarkPeriodEnd: (date: string) => void;
  onRemovePeriod: (date: string) => void;
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
    menstrualRecords,
    journals,
    habitItems,
    onDate,
    onWeek,
    onDay,
    onTasks,
    onEditTask,
    onDeleteTask,
    onJournals,
    onMarkPeriodStart,
    onMarkPeriodEnd,
    onRemovePeriod,
    openTask,
    notify,
  } = props;
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
          <span className="date-picker">
            <span className="date-display">{formatLong(date)}</span>
            <input
              type="date"
              aria-label="选择记录日期"
              value={date}
              onChange={event => selectDate(event.target.value)}
            />
          </span>
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
        menstrualRecords={menstrualRecords}
        onWeekChange={onWeek}
        onSelectDate={onDate}
        onMarkStart={onMarkPeriodStart}
        onMarkEnd={onMarkPeriodEnd}
        onRemovePeriod={onRemovePeriod}
        onTasks={onTasks}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        openTask={openTask}
      />
      <section className="life-section diet-section">
        <div className="section-heading diet-heading">
          <div className="diet-heading-copy">
            <h2>Daily diet</h2>
            <div className="diet-plan-row">
              <p>{formatShort(date)}</p>
              <input
                type="text"
                aria-label="今日体重目标和饮食规划"
                value={day.dietNote}
                onChange={event =>
                  onDay({ ...day, dietNote: event.target.value })
                }
                placeholder="今日体重目标 / 饮食规划"
              />
            </div>
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
          {mealMeta.map(({ key, label }) => {
            const meal = day.meals[key];
            return (
              <article
                className={meal.text || meal.images.length ? 'recorded' : ''}
                key={key}
              >
                <div className="meal-top">
                  <span>{label}</span>
                  <small>
                    {meal.images.length ? `${meal.images.length} 张` : ''}
                  </small>
                </div>
                <textarea
                  value={meal.text}
                  onChange={event => setMeal(key, { text: event.target.value })}
                  placeholder="吃了什么？"
                  rows={2}
                />
                <MealGallery
                  label={label}
                  images={meal.images}
                  onChange={images => setMeal(key, { images })}
                  notify={notify}
                />
              </article>
            );
          })}
        </div>
      </section>
      <HabitCheckins
        items={habitItems}
        records={day.habits}
        onChange={habits => onDay({ ...day, habits })}
      />
      <MoodPanel date={date} day={day} days={days} onDay={onDay} />
      <JournalDrawer
        entries={journals}
        onEntries={onJournals}
        notify={notify}
      />
    </>
  );
}
