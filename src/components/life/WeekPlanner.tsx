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
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { ConfirmModal } from './ConfirmModal';
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
  onRemovePeriod: (iso: string) => void;
  onTasks: (tasks: LifeTask[]) => void;
  onEditTask: (task: LifeTask) => void;
  onDeleteTask: (taskId: number) => void;
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
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [taskAction, setTaskAction] = useState<LifeTask | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LifeTask | null>(null);
  const [drag, setDrag] = useState<{ start: number; end: number } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<number | null>(null);
  const holdOriginRef = useRef<{ x: number; y: number } | null>(null);
  const heldTaskIdRef = useRef<number | null>(null);
  const suppressTaskClickUntilRef = useRef(0);
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
  const clearTaskHold = () => {
    if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;
    holdOriginRef.current = null;
  };
  const startTaskHold = (
    event: React.PointerEvent<HTMLButtonElement>,
    task: LifeTask,
  ) => {
    event.stopPropagation();
    holdOriginRef.current = { x: event.clientX, y: event.clientY };
    holdTimerRef.current = window.setTimeout(() => {
      heldTaskIdRef.current = task.id;
      suppressTaskClickUntilRef.current = Date.now() + 800;
      setTaskAction(task);
      holdTimerRef.current = null;
    }, 550);
  };
  const moveTaskHold = (event: React.PointerEvent<HTMLButtonElement>) => {
    const origin = holdOriginRef.current;
    if (
      origin &&
      (Math.abs(event.clientX - origin.x) > 8 ||
        Math.abs(event.clientY - origin.y) > 8)
    ) {
      clearTaskHold();
    }
  };
  const toggleTask = (task: LifeTask) => {
    const suppressClick =
      heldTaskIdRef.current === task.id &&
      Date.now() < suppressTaskClickUntilRef.current;
    heldTaskIdRef.current = null;
    if (suppressClick) return;
    props.onTasks(
      props.tasks.map(item =>
        item.id === task.id ? { ...item, done: !item.done } : item,
      ),
    );
  };
  return (
    <>
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
            onClick={() =>
              props.openTask(props.selectedDate, props.selectedDate)
            }
            aria-label="新增任务"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="week-calendar">
          <div className="week-date-grid">
            {days.map((iso, index) => {
              const info = cycleDayInfo(iso, props.menstrualRecords);
              const recordedPeriod =
                info?.phase === '月经期' && !info.predicted;
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
                      {recordedPeriod && (
                        <button
                          type="button"
                          className="cycle-remove-button"
                          onClick={() => setRemoveTarget(iso)}
                        >
                          <Trash2 size={13} />
                          取消记录 / 撤销
                        </button>
                      )}
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
                style={{
                  gridColumn: index + 1,
                  gridRow: `1 / ${laneCount + 1}`,
                }}
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
                onPointerDown={event => startTaskHold(event, task)}
                onPointerMove={moveTaskHold}
                onPointerUp={clearTaskHold}
                onPointerCancel={clearTaskHold}
                onPointerLeave={clearTaskHold}
                onContextMenu={event => event.preventDefault()}
                onClick={() => toggleTask(task)}
              >
                {task.done && <Check size={10} />}
                <span>{task.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
      {taskAction && (
        <div
          className="task-action-mask"
          role="presentation"
          onPointerDown={() => setTaskAction(null)}
        >
          <dialog
            open
            className="task-action-menu"
            aria-label={`${taskAction.title}的任务操作`}
            onPointerDown={event => event.stopPropagation()}
          >
            <div className="task-action-title">
              <small>任务操作</small>
              <strong>{taskAction.title}</strong>
            </div>
            <button
              type="button"
              onClick={() => {
                props.onEditTask(taskAction);
                setTaskAction(null);
              }}
            >
              <Pencil size={16} />
              编辑名称
            </button>
            <button
              type="button"
              className="danger"
              onClick={() => {
                setDeleteTarget(taskAction);
                setTaskAction(null);
              }}
            >
              <Trash2 size={16} />
              删除
            </button>
            <button
              type="button"
              className="cancel"
              onClick={() => setTaskAction(null)}
            >
              取消
            </button>
          </dialog>
        </div>
      )}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="删除这项任务？"
        message={`“${deleteTarget?.title ?? ''}”将从周视图和本地数据中彻底移除。`}
        confirmLabel="确认删除"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) props.onDeleteTask(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
      <ConfirmModal
        open={Boolean(removeTarget)}
        title="撤销本次经期记录？"
        message="这会删除包含所选日期的整次经期记录，并根据剩余记录重新计算周期预测。"
        confirmLabel="确认撤销"
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (removeTarget) props.onRemovePeriod(removeTarget);
          setRemoveTarget(null);
          setEditingCycle(null);
        }}
      />
    </>
  );
}
