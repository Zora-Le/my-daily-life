import { DailyPage } from '@/components/life/DailyPage';
import { TulipIcon } from '@/components/life/LineArt';
import { MoneyPage } from '@/components/life/MoneyPage';
import { ProgressPage } from '@/components/life/ProgressPage';
import { RewardsPage } from '@/components/life/RewardsPage';
import { SettingsPage } from '@/components/life/SettingsPage';
import type { Task } from '@/components/life/WeekPlanner';
import { CalendarDays, Gift, Settings, WalletCards, X } from 'lucide-react';
import { useMemo, useState } from 'react';

type PageKey = 'daily' | 'progress' | 'money' | 'rewards' | 'settings';
type TaskDraft = {
  title: string;
  start: string;
  end: string;
  tone: Task['tone'];
};
const isoToIndex = (iso: string) =>
  Math.max(0, Math.min(6, Number(iso.slice(-2)) - 12));

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
  const [page, setPage] = useState<PageKey>('daily');
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: '产品方案第二版',
      start: 0,
      end: 2,
      done: false,
      tone: 'rose',
    },
    { id: 2, title: '晨间阅读', start: 1, end: 1, done: true, tone: 'yellow' },
    {
      id: 3,
      title: '英语听说练习',
      start: 3,
      end: 4,
      done: true,
      tone: 'blue',
    },
    { id: 4, title: '给朋友回信', start: 5, end: 5, done: false, tone: 'rose' },
  ]);
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const [mealDone, setMealDone] = useState(2);
  const [toast, setToast] = useState('');
  const [drawOpen, setDrawOpen] = useState(false);
  const notify = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(''), 1900);
  };
  const title = useMemo(
    () =>
      ({
        daily: 'My Daily',
        progress: '我的进步',
        money: '收入与支出',
        rewards: '瞬间图鉴',
        settings: '设置',
      })[page],
    [page],
  );
  const openTask = (start: string, end: string) =>
    setDraft({ title: '', start, end, tone: 'blue' });
  const addTask = () => {
    if (!draft?.title.trim()) {
      notify('请先写下任务名称');
      return;
    }
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title: draft.title.trim(),
        start: isoToIndex(draft.start),
        end: isoToIndex(draft.end),
        done: false,
        tone: draft.tone,
      },
    ]);
    setDraft(null);
    notify('已放进这一周');
  };
  const unlocked =
    tasks.filter(t => t.done).length >= Math.ceil(tasks.length * 0.6) &&
    mealDone === 3;
  const nav: { key: PageKey; label: string; icon: React.ReactNode }[] = [
    { key: 'daily', label: '日常', icon: <CalendarDays /> },
    { key: 'progress', label: '进步', icon: <TulipIcon /> },
    { key: 'money', label: '收支', icon: <WalletCards /> },
    { key: 'rewards', label: '珍藏', icon: <Gift /> },
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
              tasks={tasks}
              setTasks={setTasks}
              openTask={openTask}
              notify={notify}
              mealDone={mealDone}
              setMealDone={setMealDone}
            />
          )}
          {page === 'progress' && <ProgressPage notify={notify} />}
          {page === 'money' && <MoneyPage notify={notify} />}
          {page === 'rewards' && (
            <RewardsPage
              unlocked={unlocked}
              onDraw={() => setDrawOpen(true)}
              notify={notify}
            />
          )}
          {page === 'settings' && <SettingsPage notify={notify} />}
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
            <button onClick={() => setDraft(null)} aria-label="关闭">
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
                aria-label={`选择${tone}色`}
              />
            ))}
          </div>
          <button className="primary-action" onClick={addTask}>
            添加到这一周
          </button>
        </Modal>
      )}
      {drawOpen && (
        <Modal onClose={() => setDrawOpen(false)}>
          <div className="draw-result">
            <span>YOU FOUND A MOMENT</span>
            <div className="drawn-card">
              <small>NO.04 · SWEET MOMENTS</small>
              <i />
              <b>
                今天的晚风
                <br />
                也记得你
              </b>
              <em>好好生活，本身就是礼物。</em>
            </div>
            <h2>「晚风来信」</h2>
            <p>这张卡已经放进你的图鉴。</p>
            <button
              className="primary-action"
              onClick={() => {
                setDrawOpen(false);
                notify('瞬间已珍藏');
              }}
            >
              收下卡片
            </button>
          </div>
        </Modal>
      )}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
