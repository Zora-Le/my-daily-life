import type { LifeTask, MenstrualRecord } from '@/hooks/useLifeStore';
import { cycleDayInfo } from '@/lib/cycleRules';
import {
  TODAY,
  addDays,
  formatShort,
  fromIso,
  weekStart,
} from '@/lib/lifeUtils';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Plus,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { type Phase, PhaseIcon } from './LineArt';

const weekNames = ['一', '二', '三', '四', '五', '六', '日'];
interface Props {
  tasks: LifeTask[];
  week: string;
  selectedDate: string;
  menstrualRecords: MenstrualRecord[];
  onWeekChange: (iso: string) => void;
  onSelectDate: (iso: string) => void;
  onMarkStart: (iso: string) => void;
  onMarkEnd: (iso: string) => void;
  onTasks: (tasks: LifeTask[]) => void;
  openTask: (start: string, end: string) => void;
}
type PlacedTask = LifeTask & {
  columnStart: number;
  columnEnd: number;
  lane: number;
};

function placeTasks(
  tasks: LifeTask[],
  first: string,
  last: string,
  days: string[],
) {
  const laneEnds: number[] = [];
  return tasks
    .filter(task => task.start <= last && task.end >= first)
    .sort(
      (a, b) => a.start.localeCompare(b.start) || b.end.localeCompare(a.end),
    )
    .map(task => {
      const start = Math.max(
        0,
        days.findIndex(day => day >= task.start),
      );
      const endIndex = days.findIndex(day => day > task.end);
      const end = endIndex < 0 ? 7 : endIndex;
      let lane = laneEnds.findIndex(laneEnd => laneEnd <= start);
      if (lane < 0) lane = laneEnds.length;
      laneEnds[lane] = end;
      return { ...task, columnStart: start + 1, columnEnd: end + 1, lane };
    });
}

function CycleIcon({ phase }: { phase?: string }) {
  return phase ? <PhaseIcon phase={phase as Phase} /> : null;
}

export function WeekPlanner(props: Props) {
  const days = Array.from({ length: 7 }, (_, i) =>
    addDays(weekStart(props.week), i),
  );
  const [editingCycle, setEditingCycle] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ start: number; end: number } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const placed = useMemo(
    () => placeTasks(props.tasks, days[0], days[6], days),
    [props.tasks, days.join('|')],
  );
  const laneCount = Math.max(3, ...placed.map(task => task.lane + 1));
  const pointerIndex = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    return rect
      ? Math.max(
          0,
          Math.min(6, Math.floor(((clientX - rect.left) / rect.width) * 7)),
        )
      : 0;
  };
  const finish = () => {
    if (!drag) return;
    const start = Math.min(drag.start, drag.end);
    const end = Math.max(drag.start, drag.end);
    setDrag(null);
    props.openTask(days[start], days[end]);
  };
  const openCycle = (iso: string) => {
    props.onSelectDate(iso);
    setEditingCycle(iso);
  };
  return (
    <section className="week-planner">
      <div className="planner-head compact">
        <button
          className="week-arrow"
          onClick={() => props.onWeekChange(addDays(props.week, -7))}
          aria-label="上一周"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="calendar-caption">
          <CalendarDays className="calendar-icon" aria-hidden="true" />
          <span className="overline">
            {formatShort(days[0])} — {formatShort(days[6])}
          </span>
        </div>
        <button
          className="week-arrow"
          onClick={() => props.onWeekChange(addDays(props.week, 7))}
          aria-label="下一周"
        >
          <ChevronRight size={16} />
        </button>
        <button
          className="round-add"
          onClick={() => props.openTask(props.selectedDate, props.selectedDate)}
          aria-label="新增任务"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="week-calendar">
        <div className="week-date-grid">
          {days.map((iso, index) => {
            const info = cycleDayInfo(iso, props.menstrualRecords);
            const recordedPeriod = info?.phase === '月经期' && !info.predicted;
            return (
              <div
                className={`week-date ${iso === TODAY ? 'today' : ''} ${iso === props.selectedDate ? 'selected' : ''}`}
                key={iso}
              >
                <button
                  className={`cycle-marker ${info?.predicted ? 'predicted' : ''}`}
                  data-phase={info?.phase ?? '未记录'}
                  onClick={() => openCycle(iso)}
                  aria-label={`${info?.predicted ? '预测' : ''}${info?.phase ?? '周期未记录'}，打开周期操作`}
                >
                  <CycleIcon phase={info?.phase} />
                </button>
                <button
                  className="week-date-button"
                  onClick={() => openCycle(iso)}
                >
                  <span>周{weekNames[index]}</span>
                  <b>{fromIso(iso).getDate()}</b>
                </button>
                {editingCycle === iso && (
                  <div className="cycle-action" aria-label="生理周期操作">
                    <strong>{formatShort(iso)}</strong>
                    <small>
                      {info
                        ? `${info.predicted ? '预测' : '已记录'} · ${info.phase}`
                        : '尚无周期记录'}
                    </small>
                    <button
                      type="button"
                      onClick={() => {
                        if (recordedPeriod) props.onMarkEnd(iso);
                        else props.onMarkStart(iso);
                        setEditingCycle(null);
                      }}
                    >
                      <Droplet size={13} />
                      {recordedPeriod ? '设为经期结束' : '标记月经开始'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div
          ref={trackRef}
          className="week-task-grid"
          style={{ gridTemplateRows: `repeat(${laneCount}, 27px)` }}
          onPointerDown={event => {
            if ((event.target as HTMLElement).closest('.task-bar')) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            const index = pointerIndex(event.clientX);
            setDrag({ start: index, end: index });
          }}
          onPointerMove={event =>
            drag && setDrag({ ...drag, end: pointerIndex(event.clientX) })
          }
          onPointerUp={finish}
          onPointerCancel={() => setDrag(null)}
        >
          {days.map((iso, index) => (
            <div
              key={iso}
              className={`task-day-column ${drag && index >= Math.min(drag.start, drag.end) && index <= Math.max(drag.start, drag.end) ? 'range' : ''}`}
              style={{ gridColumn: index + 1, gridRow: `1 / ${laneCount + 1}` }}
            />
          ))}
          {placed.map(task => (
            <button
              key={task.id}
              className={`task-bar ${task.tone} ${task.done ? 'done' : ''}`}
              style={{
                gridColumn: `${task.columnStart} / ${task.columnEnd}`,
                gridRow: task.lane + 1,
              }}
              onPointerDown={event => event.stopPropagation()}
              onClick={() =>
                props.onTasks(
                  props.tasks.map(item =>
                    item.id === task.id ? { ...item, done: !item.done } : item,
                  ),
                )
              }
            >
              {task.done && <Check size={10} />}
              <span>{task.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
