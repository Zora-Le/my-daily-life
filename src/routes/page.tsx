import { DailyPage } from '@/components/life/DailyPage';
import { BookIcon, TulipIcon } from '@/components/life/LineArt';
import { MoneyPage } from '@/components/life/MoneyPage';
import { ProgressPage } from '@/components/life/ProgressPage';
import { RewardsPage } from '@/components/life/RewardsPage';
import { SettingsPage } from '@/components/life/SettingsPage';
import type { LifeTask } from '@/hooks/useLifeStore';
import { emptyDay, useLifeStore } from '@/hooks/useLifeStore';
import { TODAY, weekStart } from '@/lib/lifeUtils';
import { CalendarDays, Settings, WalletCards, X } from 'lucide-react';
import { useMemo, useState } from 'react';

type PageKey = 'daily' | 'progress' | 'money' | 'rewards' | 'settings';
type TaskDraft = {
  title: string;
  start: string;
  end: string;
  tone: LifeTask['tone'];
};
function Modal({
  children,
  onClose,
}: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-mask" role="presentation" onPointerDown={onClose}>
      <dialog
        open
        className="modal-sheet"
        onPointerDown={e => e.stopPropagation()}
      >
        {children}
      </dialog>
    </div>
  );
}
export default function Page() {
  const { state, update, updateDay, importState } = useLifeStore();
  const [page, setPage] = useState<PageKey>('daily');
  const [date, setDate] = useState(TODAY);
  const [week, setWeek] = useState(weekStart(TODAY));
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const [toast, setToast] = useState('');
  const notify = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(''), 2200);
  };
  const day = state.days[date] ?? emptyDay();
  const title = useMemo(
    () =>
      ({
        daily: 'My Daily',
        progress: '我的进步 my progress',
        money: '收入与支出',
        rewards: '奖励',
        settings: '设置',
      })[page],
    [page],
  );
  const addTask = () => {
    if (!draft?.title.trim()) return notify('请先写下任务名称');
    const [start, end] =
      draft.start <= draft.end
        ? [draft.start, draft.end]
        : [draft.end, draft.start];
    update(current => ({
      ...current,
      tasks: [
        ...current.tasks,
        {
          id: Date.now(),
          title: draft.title.trim(),
          start,
          end,
          done: false,
          tone: draft.tone,
        },
      ],
    }));
    setDraft(null);
    notify('任务已加入日历');
  };
  const dayTasks = state.tasks.filter(
    task => task.start <= date && task.end >= date,
  );
  const unlocked =
    dayTasks.length > 0 &&
    dayTasks.filter(task => task.done).length >=
      Math.ceil(dayTasks.length * 0.6) &&
    Object.values(day.meals).every(meal => meal.text || meal.image);
  const nav: { key: PageKey; label: string; icon: React.ReactNode }[] = [
    { key: 'daily', label: '日常', icon: <CalendarDays /> },
    { key: 'progress', label: '进步', icon: <BookIcon /> },
    { key: 'money', label: '收支', icon: <WalletCards /> },
    { key: 'rewards', label: '奖励', icon: <TulipIcon /> },
  ];
  return (
    <main className="app-shell">
      <div className="phone-frame">
        <header className="app-header">
          <div>
            <span>MY DAILY · MY LIFE</span>
            <h1>{title}</h1>
          </div>
          <button onClick={() => setPage('settings')} aria-label="打开设置">
            <Settings size={19} />
          </button>
        </header>
        <div className="content" key={page}>
          {page === 'daily' && (
            <DailyPage
              date={date}
              week={week}
              day={day}
              tasks={state.tasks}
              phases={state.phases}
              onDate={setDate}
              onWeek={setWeek}
              onDay={next => updateDay(date, () => next)}
              onTasks={tasks => update(current => ({ ...current, tasks }))}
              onPhase={(iso, phase) =>
                update(current => ({
                  ...current,
                  phases: { ...current.phases, [iso]: phase },
                }))
              }
              openTask={(start, end) =>
                setDraft({ title: '', start, end, tone: 'blue' })
              }
              notify={notify}
            />
          )}
          {page === 'progress' && (
            <ProgressPage
              date={date}
              day={day}
              books={state.books}
              notes={state.notes}
              onDay={next => updateDay(date, () => next)}
              onBooks={books => update(current => ({ ...current, books }))}
              onNotes={notes => update(current => ({ ...current, notes }))}
              notify={notify}
            />
          )}
          {page === 'money' && (
            <MoneyPage
              savings={state.savings}
              monthlyMoney={state.monthlyMoney}
              onMonthlyMoney={monthlyMoney =>
                update(current => ({ ...current, monthlyMoney }))
              }
              onSavings={savings =>
                update(current => ({ ...current, savings }))
              }
              notify={notify}
            />
          )}
          {page === 'rewards' && (
            <RewardsPage
              unlocked={unlocked}
              cards={state.rewardCards}
              history={state.drawHistory}
              onCards={rewardCards =>
                update(current => ({ ...current, rewardCards }))
              }
              onHistory={drawHistory =>
                update(current => ({ ...current, drawHistory }))
              }
              notify={notify}
            />
          )}
          {page === 'settings' && (
            <SettingsPage
              state={state}
              onImport={importState}
              notify={notify}
            />
          )}
        </div>
        <nav className="bottom-nav" aria-label="主导航">
          {nav.map(item => (
            <button
              key={item.key}
              className={page === item.key ? 'active' : ''}
              onClick={() => setPage(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      {draft && (
        <Modal onClose={() => setDraft(null)}>
          <div className="modal-head">
            <div>
              <span>NEW SCHEDULE</span>
              <h2>
                {draft.start === draft.end ? '添加单日任务' : '添加连续任务'}
              </h2>
            </div>
            <button onClick={() => setDraft(null)}>
              <X size={18} />
            </button>
          </div>
          <label>
            任务名称
            <input
              value={draft.title}
              onChange={e => setDraft({ ...draft, title: e.target.value })}
              placeholder="写下一件要做的事"
            />
          </label>
          <div className="date-fields">
            <label>
              开始日期
              <input
                type="date"
                value={draft.start}
                onChange={e => setDraft({ ...draft, start: e.target.value })}
              />
            </label>
            <label>
              结束日期
              <input
                type="date"
                value={draft.end}
                onChange={e => setDraft({ ...draft, end: e.target.value })}
              />
            </label>
          </div>
          <div className="tone-picker">
            <span>颜色</span>
            {(['rose', 'blue', 'yellow'] as const).map(tone => (
              <button
                key={tone}
                className={`${tone} ${draft.tone === tone ? 'active' : ''}`}
                onClick={() => setDraft({ ...draft, tone })}
              />
            ))}
          </div>
          <button className="primary-action" onClick={addTask}>
            保存任务
          </button>
        </Modal>
      )}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
