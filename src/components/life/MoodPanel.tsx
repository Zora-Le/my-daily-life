import type { DayRecord } from '@/hooks/useLifeStore';
import { fromIso, toIso } from '@/lib/lifeUtils';
import {
  CalendarRange,
  Cloud,
  Crown,
  Flame,
  Flower2,
  Hammer,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

const moods = [
  { name: '平静', tone: 'calm', mouth: '⌣' },
  { name: '开心', tone: 'happy', mouth: '⌣' },
  { name: '疲惫', tone: 'tired', mouth: '﹏' },
  { name: '低落', tone: 'low', mouth: '︵' },
  { name: '焦虑', tone: 'anxious', mouth: '﹏' },
  { name: '暴躁', tone: 'angry', mouth: '⌁' },
] as const;

function Face({ mood, active = false }: { mood: string; active?: boolean }) {
  const item = moods.find(value => value.name === mood) ?? moods[0];
  return (
    <span className={`pixel-face ${item.tone} ${active ? 'is-active' : ''}`}>
      <i />
      <i />
      <b>{item.mouth}</b>
      {active && item.tone === 'calm' && <Crown className="mood-crown" />}
      {active && item.tone === 'happy' && <Flower2 className="mood-flower" />}
      {active && item.tone === 'tired' && (
        <span className="mood-zzz">
          <em>z</em>
          <em>z</em>
          <em>z</em>
        </span>
      )}
      {active && item.tone === 'low' && <Cloud className="mood-cloud" />}
      {active && item.tone === 'anxious' && <Hammer className="mood-hammer" />}
      {active && item.tone === 'angry' && (
        <Flame className="mood-fire" fill="currentColor" />
      )}
    </span>
  );
}

function MonthOverview({
  date,
  days,
  onClose,
}: { date: string; days: Record<string, DayRecord>; onClose: () => void }) {
  const base = fromIso(date);
  const year = base.getFullYear();
  const month = base.getMonth();
  const total = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="modal-mask mood-modal-mask" onPointerDown={onClose}>
      <div
        className="mood-month"
        onPointerDown={event => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span>MOOD CALENDAR</span>
            <h2>
              {year} 年 {month + 1} 月
            </h2>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="mood-calendar-scroll">
          <div className="mood-weekdays">
            {['一', '二', '三', '四', '五', '六', '日'].map(item => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="mood-calendar-grid">
            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
              .slice(0, offset)
              .map(dayName => (
                <i key={`blank-${dayName}`} />
              ))}
            {Array.from({ length: total }, (_, index) => {
              const iso = toIso(new Date(year, month, index + 1, 12));
              const mood = days[iso]?.mood;
              return (
                <div key={iso}>
                  <small>{index + 1}</small>
                  {mood ? (
                    <Face mood={mood} />
                  ) : (
                    <span className="empty-face" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function MoodPanel({
  date,
  day,
  days,
  onDay,
}: {
  date: string;
  day: DayRecord;
  days: Record<string, DayRecord>;
  onDay: (day: DayRecord) => void;
}) {
  const preview =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('preview')
      : '';
  const [monthOpen, setMonthOpen] = useState(preview === 'month');
  const shownMood = preview === 'mood' && !day.mood ? '焦虑' : day.mood;
  return (
    <section className="life-section mood-section">
      <div className="section-heading">
        <h2>这一天感觉怎样？</h2>
        <button className="outline-action" onClick={() => setMonthOpen(true)}>
          <CalendarRange size={14} />
          月度概览
        </button>
      </div>
      <div className="mood-row">
        {moods.map(item => {
          const selected = shownMood === item.name;
          return (
            <button
              className={`pixel-mood ${selected ? 'selected' : ''}`}
              key={item.name}
              onClick={() => onDay({ ...day, mood: item.name })}
            >
              <Face mood={item.name} active={selected} />
              <small>{item.name}</small>
            </button>
          );
        })}
      </div>
      {shownMood && (
        <label className="mood-factor">
          <span>今天主要被什么影响？</span>
          <input
            value={day.moodFactor ?? ''}
            onChange={event =>
              onDay({ ...day, moodFactor: event.target.value })
            }
            placeholder="写下一件事或一个人"
          />
        </label>
      )}
      {monthOpen && (
        <MonthOverview
          date={date}
          days={days}
          onClose={() => setMonthOpen(false)}
        />
      )}
    </section>
  );
}
