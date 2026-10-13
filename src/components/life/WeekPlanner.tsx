import type { LifeTask } from '@/hooks/useLifeStore';
import {
  TODAY,
  addDays,
  formatShort,
  fromIso,
  weekStart,
} from '@/lib/lifeUtils';
import { Check, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { type Phase, PhaseIcon } from './LineArt';

const phases: Phase[] = ['卵泡期', '排卵期', '黄体期', '月经期'];
const weekNames = ['一', '二', '三', '四', '五', '六', '日'];
interface Props {
  tasks: LifeTask[];
  week: string;
  selectedDate: string;
  phasesByDate: Record<string, Phase>;
  onWeekChange: (iso: string) => void;
  onSelectDate: (iso: string) => void;
  onPhase: (iso: string, phase: Phase) => void;
  onTasks: (tasks: LifeTask[]) => void;
  openTask: (start: string, end: string) => void;
}
export function WeekPlanner(props: Props) {
  const {
    tasks,
    week,
    selectedDate,
    phasesByDate,
    onWeekChange,
    onSelectDate,
    onPhase,
    onTasks,
    openTask,
  } = props;
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart(week), i));
  const [editingPhase, setEditingPhase] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ start: number; end: number } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerIndex = (clientY: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    return rect
      ? Math.max(
          0,
          Math.min(6, Math.floor(((clientY - rect.top) / rect.height) * 7)),
        )
      : 0;
  };
  const finish = () => {
    if (!drag) return;
    const a = Math.min(drag.start, drag.end);
    const b = Math.max(drag.start, drag.end);
    setDrag(null);
    openTask(days[a], days[b]);
  };
  return (
    <section className="week-planner">
      <div className="planner-head compact">
        <button
          className="week-arrow"
          onClick={() => onWeekChange(addDays(week, -7))}
          aria-label="上一周"
        >
          <ChevronLeft size={16} />
        </button>
        <div>
          <span className="overline">
            {formatShort(days[0])} — {formatShort(days[6])}
          </span>
        </div>
        <button
          className="week-arrow"
          onClick={() => onWeekChange(addDays(week, 7))}
          aria-label="下一周"
        >
          <ChevronRight size={16} />
        </button>
        <button
          className="round-add"
          onClick={() => openTask(selectedDate, selectedDate)}
          aria-label="新增任务"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="planner-grid new-planner">
        <div className="date-column">
          {days.map((iso, index) => {
            const date = fromIso(iso);
            const phase = phasesByDate[iso] ?? '卵泡期';
            return (
              <div
                className={`date-cell ${iso === TODAY ? 'today' : ''} ${iso === selectedDate ? 'selected-day' : ''}`}
                key={iso}
              >
                <button
                  className="phase-button tiny"
                  onClick={() =>
                    setEditingPhase(editingPhase === iso ? null : iso)
                  }
                  aria-label="修改周期阶段"
                >
                  <PhaseIcon phase={phase} />
                </button>
                <button
                  className="date-button"
                  onClick={() => onSelectDate(iso)}
                >
                  <b>{date.getDate()}</b>
                  <span>周{weekNames[index]}</span>
                </button>
                {editingPhase === iso && (
                  <div className="phase-menu">
                    {phases.map(item => (
                      <button
                        key={item}
                        onClick={() => {
                          onPhase(iso, item);
                          setEditingPhase(null);
                        }}
                      >
                        <PhaseIcon phase={item} />
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div
          ref={trackRef}
          className="task-track compact-track"
          onPointerMove={e =>
            drag && setDrag({ ...drag, end: pointerIndex(e.clientY) })
          }
          onPointerUp={finish}
          onPointerCancel={() => setDrag(null)}
        >
          {days.map((iso, index) => {
            const visible = tasks.filter(
              task => task.start <= iso && task.end >= iso,
            );
            const inRange =
              drag &&
              index >= Math.min(drag.start, drag.end) &&
              index <= Math.max(drag.start, drag.end);
            return (
              <div
                className={`track-row ${inRange ? 'range' : ''}`}
                key={iso}
                onPointerDown={e => {
                  if ((e.target as HTMLElement).closest('.task-chip')) return;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setDrag({ start: index, end: index });
                }}
              >
                <div className="task-stack">
                  {visible.map(task => (
                    <button
                      key={task.id}
                      className={`task-chip ${task.tone} ${task.done ? 'done' : ''}`}
                      onPointerDown={e => e.stopPropagation()}
                      onClick={() =>
                        onTasks(
                          tasks.map(t =>
                            t.id === task.id ? { ...t, done: !t.done } : t,
                          ),
                        )
                      }
                    >
                      {task.done && <Check size={9} />}
                      <span>{task.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {drag && (
            <div
              className="drag-label"
              style={{
                top: `${Math.min(drag.start, drag.end) * 14.2857 + 2}%`,
              }}
            >
              滑到 {formatShort(days[Math.max(drag.start, drag.end)])}
            </div>
          )}
        </div>
      </div>
      <p className="planner-hint">
        在右侧空白处按住并纵向滑过日期，可快速安排连续任务
      </p>
    </section>
  );
}
