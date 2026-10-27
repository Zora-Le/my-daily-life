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
import { useRef, useState } from 'react';
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
  const journalRef = useRef<HTMLDivElement>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const suppressEmptyClickUntilRef = useRef(0);
  const holdTimerRef = useRef<number | null>(null);
  const holdOriginRef = useRef<{ x: number; y: number } | null>(null);
  const heldTaskIdRef = useRef<number | null>(null);
  const suppressTaskClickUntilRef = useRef(0);
  const openCycle = (iso: string) => {
    props.onSelectDate(iso);
    setEditingCycle(iso);
  };
  const pointerDayIndex = (clientY: number) => {
    const rows = journalRef.current?.querySelectorAll('.week-journal-row');
    if (!rows?.length) return 0;
    const index = Array.from(rows).findIndex(row => {
      const rect = row.getBoundingClientRect();
      return clientY >= rect.top && clientY <= rect.bottom;
    });
    if (index >= 0) return index;
    const first = rows[0].getBoundingClientRect();
    return clientY < first.top ? 0 : days.length - 1;
  };
  const finishRangeSelection = () => {
    if (!drag) return;
    const start = Math.min(drag.start, drag.end);
    const end = Math.max(drag.start, drag.end);
    setDrag(null);
    if (start !== end) {
      suppressEmptyClickUntilRef.current = Date.now() + 400;
      props.openTask(days[start], days[end]);
    }
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
  const toggleTask = (task: LifeTask, iso: string) => {
    const suppressClick =
      heldTaskIdRef.current === task.id &&
      Date.now() < suppressTaskClickUntilRef.current;
    heldTaskIdRef.current = null;
    if (suppressClick) return;
    props.onTasks(
      props.tasks.map(item =>
        item.id === task.id
          ? {
              ...item,
              done: { ...item.done, [iso]: !item.done[iso] },
            }
          : item,
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
        {editingCycle && (
          <button
            type="button"
            className="cycle-action-overlay"
            aria-label="关闭生理周期操作"
            onClick={() => setEditingCycle(null)}
          />
        )}
        <div
          ref={journalRef}
          className="week-calendar week-journal"
          onPointerDown={event => {
            if (
              (event.target as HTMLElement).closest(
                '.task-bar, .week-journal-date, .cycle-action',
              )
            )
              return;
            if (event.pointerType === 'touch') {
              startPointRef.current = {
                x: event.clientX,
                y: event.clientY,
              };
              return;
            }
            if (event.pointerType !== 'mouse') return;
            event.currentTarget.setPointerCapture(event.pointerId);
            const index = pointerDayIndex(event.clientY);
            setDrag({ start: index, end: index });
          }}
          onPointerMove={event => {
            if (event.pointerType === 'touch' && !drag) {
              const startPoint = startPointRef.current;
              if (!startPoint) return;
              const deltaX = Math.abs(event.clientX - startPoint.x);
              const deltaY = Math.abs(event.clientY - startPoint.y);
              if (deltaY > deltaX && deltaY > 5) {
                startPointRef.current = null;
                return;
              }
              if (deltaX <= 10) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              const start = pointerDayIndex(startPoint.y);
              setDrag({ start, end: pointerDayIndex(event.clientY) });
              event.preventDefault();
              return;
            }
            if (!drag) return;
            event.preventDefault();
            setDrag({ ...drag, end: pointerDayIndex(event.clientY) });
          }}
          onPointerUp={() => {
            startPointRef.current = null;
            finishRangeSelection();
          }}
          onPointerCancel={() => {
            startPointRef.current = null;
            setDrag(null);
          }}
        >
          {days.map((iso, index) => {
            const info = cycleDayInfo(iso, props.menstrualRecords);
            const recordedPeriod = info?.phase === '月经期' && !info.predicted;
            const dayTasks = props.tasks
              .filter(task => task.start <= iso && task.end >= iso)
              .sort((a, b) => a.start.localeCompare(b.start));
            return (
              <div
                className={`week-journal-row ${iso === TODAY ? 'today' : ''} ${iso === props.selectedDate ? 'selected' : ''} ${drag && index >= Math.min(drag.start, drag.end) && index <= Math.max(drag.start, drag.end) ? 'range' : ''}`}
                key={iso}
              >
                <div className="week-journal-date">
                  <button
                    className={`cycle-marker ${info?.predicted ? 'predicted' : ''}`}
                    data-phase={info?.phase ?? '未记录'}
                    onClick={() => openCycle(iso)}
                    aria-label={`${info?.predicted ? '预测' : ''}${info?.phase ?? '周期未记录'}，打开周期操作`}
                  >
                    <CycleIcon phase={info?.phase} />
                  </button>
                  <button
                    className="week-journal-date-button"
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
                <div
                  className="week-journal-tasks"
                  onClick={event => {
                    if ((event.target as HTMLElement).closest('button')) return;
                    if (Date.now() < suppressEmptyClickUntilRef.current) return;
                    props.openTask(iso, iso);
                  }}
                >
                  {dayTasks.length > 0 ? (
                    dayTasks.map(task => {
                      const done = Boolean(task.done[iso]);
                      return (
                        <button
                          key={task.id}
                          className={`task-bar ${task.tone} ${done ? 'done' : ''}`}
                          onPointerDown={event => startTaskHold(event, task)}
                          onPointerMove={moveTaskHold}
                          onPointerUp={clearTaskHold}
                          onPointerCancel={clearTaskHold}
                          onPointerLeave={clearTaskHold}
                          onContextMenu={event => event.preventDefault()}
                          onClick={() => toggleTask(task, iso)}
                        >
                          {done && <Check size={11} />}
                          <span>{task.title}</span>
                        </button>
                      );
                    })
                  ) : (
                    <button
                      className="week-journal-empty"
                      onClick={() => {
                        if (Date.now() < suppressEmptyClickUntilRef.current)
                          return;
                        props.openTask(iso, iso);
                      }}
                      aria-label={`为周${weekNames[index]}新增任务`}
                    >
                      <span>添加事项</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
