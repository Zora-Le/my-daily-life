import { Check, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { type Phase, PhaseIcon } from './LineArt';

export type Task = {
  id: number;
  title: string;
  start: number;
  end: number;
  done: boolean;
  tone: 'rose' | 'blue' | 'yellow';
};
const days = [
  { week: '一', date: 12, iso: '2026-10-12' },
  { week: '二', date: 13, iso: '2026-10-13' },
  { week: '三', date: 14, iso: '2026-10-14' },
  { week: '四', date: 15, iso: '2026-10-15' },
  { week: '五', date: 16, iso: '2026-10-16' },
  { week: '六', date: 17, iso: '2026-10-17' },
  { week: '日', date: 18, iso: '2026-10-18' },
];
const phases: Phase[] = ['卵泡期', '排卵期', '黄体期', '月经期'];

interface Props {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  openTask: (start: string, end: string) => void;
}

export function WeekPlanner({ tasks, setTasks, openTask }: Props) {
  const [dayPhases, setDayPhases] = useState<Phase[]>([
    '卵泡期',
    '卵泡期',
    '排卵期',
    '排卵期',
    '黄体期',
    '黄体期',
    '黄体期',
  ]);
  const [editingPhase, setEditingPhase] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ start: number; end: number } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const indexFromPointer = (clientY: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.max(
      0,
      Math.min(6, Math.floor(((clientY - rect.top) / rect.height) * 7)),
    );
  };
  const begin = (index: number, clientY: number) => {
    setDrag({ start: index, end: indexFromPointer(clientY) });
  };
  const move = (clientY: number) =>
    drag && setDrag({ ...drag, end: indexFromPointer(clientY) });
  const finish = () => {
    if (!drag) return;
    const a = Math.min(drag.start, drag.end);
    const b = Math.max(drag.start, drag.end);
    setDrag(null);
    openTask(days[a].iso, days[b].iso);
  };
  const range = drag
    ? [Math.min(drag.start, drag.end), Math.max(drag.start, drag.end)]
    : null;
  const toggleTask = (id: number) =>
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );

  return (
    <section className="week-planner">
      <div className="planner-head">
        <div>
          <span className="overline">12—18 OCTOBER</span>
          <h2>这一周，慢慢来</h2>
        </div>
        <button
          className="round-add"
          onClick={() => openTask(days[1].iso, days[1].iso)}
          aria-label="新增单日任务"
        >
          <Plus size={17} />
        </button>
      </div>
      <div className="planner-hint">在右侧空白轨道纵向拖拽，安排连续日程</div>
      <div className="planner-grid">
        <div className="date-column">
          {days.map((day, index) => (
            <div
              className={`date-cell ${day.date === 13 ? 'today' : ''}`}
              key={day.date}
            >
              <button
                className="date-button"
                onClick={() => openTask(day.iso, day.iso)}
              >
                <b>{day.date}</b>
                <span>周{day.week}</span>
              </button>
              <button
                className="phase-button"
                onClick={() =>
                  setEditingPhase(editingPhase === index ? null : index)
                }
                aria-label={`修改${day.date}日阶段`}
              >
                <PhaseIcon phase={dayPhases[index]} />
              </button>
              {editingPhase === index && (
                <div className="phase-menu">
                  {phases.map(phase => (
                    <button
                      key={phase}
                      title={phase}
                      onClick={() => {
                        const next = [...dayPhases];
                        next[index] = phase;
                        setDayPhases(next);
                        setEditingPhase(null);
                      }}
                    >
                      <PhaseIcon phase={phase} />
                      <span>{phase}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div
          ref={trackRef}
          className="task-track"
          onPointerMove={e => {
            if (drag) {
              e.preventDefault();
              move(e.clientY);
            }
          }}
          onPointerUp={finish}
          onPointerCancel={() => setDrag(null)}
        >
          {days.map((day, index) => (
            <div
              key={day.date}
              className={`track-row ${range && index >= range[0] && index <= range[1] ? 'range' : ''}`}
              onPointerDown={e => {
                if ((e.target as HTMLElement).closest('.task-pill')) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                begin(index, e.clientY);
              }}
            >
              {!tasks.some(
                task => index >= task.start && index <= task.end,
              ) && <span className="empty-dot">·</span>}
            </div>
          ))}
          {tasks.map(task => (
            <button
              key={task.id}
              style={{
                top: `calc(${task.start} * 14.2857% + 5px)`,
                height: `calc(${task.end - task.start + 1} * 14.2857% - 10px)`,
              }}
              className={`task-pill ${task.tone} ${task.done ? 'done' : ''}`}
              onClick={e => {
                e.stopPropagation();
                toggleTask(task.id);
              }}
            >
              <i>{task.done && <Check size={10} />}</i>
              <span>
                <b>{task.title}</b>
                <small>
                  {task.start === task.end
                    ? `${days[task.start].date} 日`
                    : `${days[task.start].date}—${days[task.end].date} 日`}
                </small>
              </span>
            </button>
          ))}
          {range && (
            <div
              className="drag-label"
              style={{ top: `calc(${range[0]} * 14.2857% + 8px)` }}
            >
              {days[range[0]].date}—{days[range[1]].date} 日
            </div>
          )}
        </div>
      </div>
      <div className="phase-legend">
        {phases.map(phase => (
          <span key={phase}>
            <i>
              <PhaseIcon phase={phase} />
            </i>
            {phase}
          </span>
        ))}
      </div>
    </section>
  );
}
