import { DailyPage } from '@/components/life/DailyPage';
import { FirebaseAuthGate } from '@/components/life/FirebaseAuthGate';
import { BookIcon } from '@/components/life/LineArt';
import { MoneyPage } from '@/components/life/MoneyPage';
import { ProgressPage } from '@/components/life/ProgressPage';
import { RewardsPage } from '@/components/life/RewardsPage';
import { SettingsPage } from '@/components/life/SettingsPage';
import type {
  LifeTask,
  MoneyTransaction,
  PendingExpense,
} from '@/hooks/useLifeStore';
import { emptyDay, useLifeStore } from '@/hooks/useLifeStore';
import {
  markPeriodEnd,
  markPeriodStart,
  removePeriodRecord,
} from '@/lib/cycleRules';
import { isRewardUnlocked } from '@/lib/lifeRules';
import { TODAY, weekStart } from '@/lib/lifeUtils';
import { CalendarDays, Gift, Settings, WalletCards, X } from 'lucide-react';
import { useMemo, useState } from 'react';

type PageKey = 'daily' | 'progress' | 'money' | 'rewards' | 'settings';
type TaskDraft = {
  id?: number;
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
function AppContent({ uid }: { uid: string }) {
  const { state, update, updateDay, importState, cloudReady } = useLifeStore(uid);
  const [page, setPage] = useState<PageKey>(() => {
    if (typeof window === 'undefined') return 'daily';
    const requested = new URLSearchParams(window.location.search).get('page');
    return ['daily', 'progress', 'money', 'rewards', 'settings'].includes(
      requested ?? '',
    )
      ? (requested as PageKey)
      : 'daily';
  });
  const [date, setDate] = useState(TODAY);
  const [week, setWeek] = useState(weekStart(TODAY));
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const [toast, setToast] = useState('');
  const [previewMonthlyMoney, setPreviewMonthlyMoney] = useState(
    state.monthlyMoney,
  );
  const previewMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('preview') === 'complete';
  const notify = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(''), 2200);
  };
  const storedDay = state.days[date] ?? emptyDay();
  const previewImage =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120"%3E%3Crect width="160" height="120" fill="%23d9cdb8"/%3E%3Ccircle cx="80" cy="58" r="38" fill="%23f7f1e4"/%3E%3Cpath d="M48 62h64" stroke="%23869b91" stroke-width="8"/%3E%3C/svg%3E';
  const day = previewMode
    ? {
        ...storedDay,
        meals: Object.fromEntries(
          Object.entries(storedDay.meals).map(([key, meal]) => [
            key,
            {
              ...meal,
              text: meal.text || '今日好好吃饭',
              images: [previewImage, previewImage],
            },
          ]),
        ) as typeof storedDay.meals,
        progress: Object.fromEntries(
          state.progressItems.map(item => [
            item.id,
            {
              planned: storedDay.progress[item.id]?.planned ?? 20,
              completed: true,
            },
          ]),
        ),
      }
    : storedDay;
  const title = useMemo(
    () =>
      ({
        daily: 'My Daily',
        progress: 'My Progress',
        money: '收入与支出',
        rewards: '奖励',
        settings: '设置',
      })[page],
    [page],
  );
  const saveTask = () => {
    if (!draft?.title.trim()) return notify('请先写下任务名称');
    const [start, end] =
      draft.start <= draft.end
        ? [draft.start, draft.end]
        : [draft.end, draft.start];
    const editing = draft.id !== undefined;
    update(current => ({
      ...current,
      tasks: editing
        ? current.tasks.map(task =>
            task.id === draft.id
              ? {
                  ...task,
                  title: draft.title.trim(),
                  start,
                  end,
                  tone: draft.tone,
                }
              : task,
          )
        : [
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
    notify(editing ? '任务名称已更新' : '任务已加入日历');
  };
  const previewTransactions: MoneyTransaction[] = previewMode
    ? [
        {
          id: 901,
          date: TODAY,
          kind: 'expense',
          amountCents: 2860,
          detail: '午餐',
        },
        {
          id: 902,
          date: TODAY,
          kind: 'income',
          amountCents: 320050,
          detail: '项目收入',
        },
        {
          id: 903,
          date: TODAY,
          kind: 'expense',
          amountCents: 1250,
          detail: '咖啡',
        },
        ...state.moneyTransactions,
      ]
    : state.moneyTransactions;
  const previewPending: PendingExpense[] = previewMode
    ? [
        { id: 911, name: '周末花束', amountCents: 6800 },
        { id: 912, name: '下月车票', amountCents: 24650 },
        ...state.pendingExpenses,
      ]
    : state.pendingExpenses;
  const unlocked =
    previewMode ||
    isRewardUnlocked(
      state.progressItems,
      (state.days[TODAY] ?? emptyDay()).progress,
    );
  const nav: { key: PageKey; label: string; icon: React.ReactNode }[] = [
    { key: 'daily', label: '日常', icon: <CalendarDays /> },
    { key: 'progress', label: '进步', icon: <BookIcon /> },
    { key: 'money', label: '收支', icon: <WalletCards /> },
    { key: 'rewards', label: '奖励', icon: <Gift /> },
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
              uid={uid}
              cloudReady={cloudReady}
              date={date}
              week={week}
              day={day}
              days={state.days}
              tasks={state.tasks}
              menstrualRecords={state.menstrualRecords}
              journals={state.journals}
              habitItems={state.habitItems}
              onDate={setDate}
              onWeek={setWeek}
              onDay={next => updateDay(date, () => next)}
              onTasks={tasks => update(current => ({ ...current, tasks }))}
              onEditTask={task =>
                setDraft({
                  id: task.id,
                  title: task.title,
                  start: task.start,
                  end: task.end,
                  tone: task.tone,
                })
              }
              onDeleteTask={taskId => {
                update(current => ({
                  ...current,
                  tasks: current.tasks.filter(task => task.id !== taskId),
                }));
                notify('任务已删除');
              }}
              onJournals={journals =>
                update(current => ({ ...current, journals }))
              }
              onMarkPeriodStart={iso => {
                update(current => ({
                  ...current,
                  menstrualRecords: markPeriodStart(
                    current.menstrualRecords,
                    iso,
                  ),
                }));
                notify('已标记月经开始，并刷新周期预测');
              }}
              onMarkPeriodEnd={iso => {
                update(current => ({
                  ...current,
                  menstrualRecords: markPeriodEnd(
                    current.menstrualRecords,
                    iso,
                  ),
                }));
                notify('已更新经期结束日，并刷新周期预测');
              }}
              onRemovePeriod={iso => {
                update(current => ({
                  ...current,
                  menstrualRecords: removePeriodRecord(
                    current.menstrualRecords,
                    iso,
                  ),
                }));
                notify('已撤销本次经期记录，并重新计算周期预测');
              }}
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
              progressText={state.progressText}
              progressItems={state.progressItems}
              onDay={next => updateDay(date, () => next)}
              onProgressText={progressText =>
                update(current => ({ ...current, progressText }))
              }
              onBooks={books => update(current => ({ ...current, books }))}
              onNotes={notes => update(current => ({ ...current, notes }))}
              notify={notify}
            />
          )}
          {page === 'money' && (
            <MoneyPage
              savings={state.savings}
              transactions={previewTransactions}
              monthlyMoney={
                previewMode ? previewMonthlyMoney : state.monthlyMoney
              }
              incomeEntries={state.incomeEntries}
              largeExpenseEntries={state.largeExpenseEntries}
              pendingExpenses={previewPending}
              onTransactions={moneyTransactions =>
                update(current => ({ ...current, moneyTransactions }))
              }
              onMonthlyMoney={monthlyMoney => {
                if (previewMode) {
                  setPreviewMonthlyMoney(monthlyMoney);
                  return;
                }
                update(current => ({ ...current, monthlyMoney }));
              }}
              onIncomeEntries={incomeEntries =>
                update(current => ({ ...current, incomeEntries }))
              }
              onLargeExpenseEntries={largeExpenseEntries =>
                update(current => ({ ...current, largeExpenseEntries }))
              }
              onPendingExpenses={pendingExpenses =>
                update(current => ({ ...current, pendingExpenses }))
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
              preview={previewMode}
              cards={state.rewardCards}
              history={state.drawHistory}
              title={state.rewardTitle}
              copy={state.rewardCopy}
              onTitle={rewardTitle =>
                update(current => ({ ...current, rewardTitle }))
              }
              onCopy={rewardCopy =>
                update(current => ({ ...current, rewardCopy }))
              }
              onCards={rewardCards =>
                update(current => ({ ...current, rewardCards }))
              }
              onHistory={drawHistory =>
                update(current => ({ ...current, drawHistory }))
              }
              onReturnCard={cardId =>
                update(current => ({
                  ...current,
                  rewardCards: current.rewardCards.map(card =>
                    card.id === cardId ? { ...card, drawnAt: undefined } : card,
                  ),
                  drawHistory: current.drawHistory.filter(
                    item => item.cardId !== cardId,
                  ),
                }))
              }
              onDeleteCard={cardId =>
                update(current => ({
                  ...current,
                  rewardCards: current.rewardCards.filter(
                    card => card.id !== cardId,
                  ),
                  drawHistory: current.drawHistory.filter(
                    item => item.cardId !== cardId,
                  ),
                }))
              }
              notify={notify}
            />
          )}
          {page === 'settings' && (
            <SettingsPage
              state={state}
              onImport={importState}
              onProgressItems={progressItems =>
                update(current => ({ ...current, progressItems }))
              }
              onHabitItems={habitItems =>
                update(current => ({ ...current, habitItems }))
              }
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
              <span>
                {draft.id === undefined ? 'NEW SCHEDULE' : 'EDIT TASK'}
              </span>
              <h2>
                {draft.id !== undefined
                  ? '编辑任务名称'
                  : draft.start === draft.end
                    ? '添加单日任务'
                    : '添加连续任务'}
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
          <button className="primary-action" onClick={saveTask}>
            保存任务
          </button>
        </Modal>
      )}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

export default function Page() {
  return (
    <FirebaseAuthGate>{user => <AppContent uid={user.uid} />}</FirebaseAuthGate>
  );
}
