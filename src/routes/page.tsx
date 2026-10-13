import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type PageKey = 'daily' | 'progress' | 'money' | 'rewards' | 'settings';
type Task = {
  id: number;
  title: string;
  span: string;
  done: boolean;
  type: 'work' | 'study';
};

const ICONS = {
  calendar:
    'https://cdn-tos-cn.bytedance.net/obj/archi/ee/es-design-base/svgs/icon_calendar-date_outlined.22cbfb13.svg',
  task: 'https://cdn-tos-cn.bytedance.net/obj/archi/ee/es-design-base/svgs/icon_view-task_outlined.d580665d.svg',
  addTask:
    'https://cdn-tos-cn.bytedance.net/obj/archi/ee/es-design-base/svgs/icon_task-add_outlined.29a42af3.svg',
  book: 'https://cdn-tos-cn.bytedance.net/obj/archi/ee/es-design-base/svgs/icon_openbook_outlined.43237553.svg',
  money:
    'https://cdn-tos-cn.bytedance.net/obj/archi/ee/es-design-base/svgs/icon_tax_outlined.dbb16b06.svg',
  upload:
    'https://cdn-tos-cn.bytedance.net/obj/archi/ee/es-design-base/svgs/icon_upload_outlined.3d1d28a8.svg',
  settings:
    'https://cdn-tos-cn.bytedance.net/obj/archi/ee/es-design-base/svgs/icon_calendar-setting_outlined.5b469755.svg',
  reward:
    'https://cdn-tos-cn.bytedance.net/obj/archi/ee/es-design-base/svgs/icon_calendar-done_outlined.e8905587.svg',
  back: 'https://cdn-tos-cn.bytedance.net/obj/archi/ee/es-design-base/svgs/icon_ccm-previous_outlined.eb6aa290.svg',
  add: 'https://cdn-tos-cn.bytedance.net/obj/archi/ee/es-design-base/svgs/icon_add_outlined.c0ef061e.svg',
};

const week = [
  { day: '一', date: 12 },
  { day: '二', date: 13 },
  { day: '三', date: 14 },
  { day: '四', date: 15 },
  { day: '五', date: 16 },
  { day: '六', date: 17 },
  { day: '日', date: 18 },
];
const chartData = [
  { month: '5月', income: 15200, expense: 9100 },
  { month: '6月', income: 16800, expense: 10600 },
  { month: '7月', income: 16100, expense: 8800 },
  { month: '8月', income: 18400, expense: 11200 },
  { month: '9月', income: 17600, expense: 9400 },
  { month: '10月', income: 19300, expense: 9800 },
];

function Icon({
  src,
  alt = '',
  size = 20,
}: { src: string; alt?: string; size?: number }) {
  return (
    <img className="ui-icon" src={src} alt={alt} width={size} height={size} />
  );
}

function PixelFace({
  mood,
  active,
  onClick,
}: { mood: string; active: boolean; onClick: () => void }) {
  const mouths: Record<string, string> = {
    平静: '—',
    开心: '⌣',
    疲惫: '﹏',
    低落: '︵',
  };
  return (
    <button
      className={`mood ${active ? 'active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="face">
        <i />
        <i />
        <b>{mouths[mood]}</b>
      </span>
      <small>{mood}</small>
    </button>
  );
}

function Modal({
  children,
  onClose,
}: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-mask" role="presentation" onMouseDown={onClose}>
      <dialog className="modal" open onMouseDown={e => e.stopPropagation()}>
        {children}
      </dialog>
    </div>
  );
}

export default function Page() {
  const [page, setPage] = useState<PageKey>('daily');
  const [date, setDate] = useState(13);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: '完成产品方案第二版',
      span: '10.13—10.15 · 延续 3 天',
      done: false,
      type: 'work',
    },
    {
      id: 2,
      title: '整理本周课程笔记',
      span: '今天',
      done: true,
      type: 'study',
    },
    {
      id: 3,
      title: '给合作伙伴回信',
      span: '今天 · 18:00 前',
      done: false,
      type: 'work',
    },
  ]);
  const [taskModal, setTaskModal] = useState(false);
  const [rewardModal, setRewardModal] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [exercise, setExercise] = useState({ cardio: 1, strength: 0 });
  const [mood, setMood] = useState('平静');
  const [newTask, setNewTask] = useState({
    title: '',
    start: '2026-10-13',
    end: '2026-10-13',
  });
  const [englishProgress, setEnglishProgress] = useState(62);
  const [toast, setToast] = useState('');

  const title = useMemo(
    () =>
      ({
        daily: 'My Daily',
        progress: 'My Progress',
        money: '金钱与事业',
        rewards: '奖励图鉴',
        settings: '设置',
      })[page],
    [page],
  );
  const notify = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(''), 1800);
  };
  const addTask = () => {
    if (!newTask.title.trim()) return;
    const same = newTask.start === newTask.end;
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title: newTask.title,
        span: same
          ? '今天'
          : `${newTask.start.slice(5).replace('-', '.')}—${newTask.end.slice(5).replace('-', '.')} · 连续多日`,
        done: false,
        type: 'work',
      },
    ]);
    setTaskModal(false);
    setNewTask({ ...newTask, title: '' });
  };

  return (
    <main className="app-shell">
      <div className="phone-frame">
        <header className="app-header">
          <div>
            <span className="eyebrow">MY DAILY · MY LIFE</span>
            <h1>{title}</h1>
          </div>
          <button
            className="icon-button"
            aria-label="打开设置"
            onClick={() => setPage('settings')}
          >
            <Icon src={ICONS.settings} />
          </button>
        </header>

        <div className="content">
          {page === 'daily' && (
            <>
              <section className="week-block">
                <div className="section-title">
                  <div>
                    <span>A WEEK</span>
                    <h2>10 月 12 日 — 18 日</h2>
                  </div>
                  <button className="text-button">本周</button>
                </div>
                <div className="week-row">
                  {week.map(item => (
                    <button
                      key={item.date}
                      onClick={() => setDate(item.date)}
                      className={`day ${date === item.date ? 'selected' : ''}`}
                    >
                      <small>{item.day}</small>
                      <strong>{item.date}</strong>
                      {[12, 13, 14].includes(item.date) && (
                        <i className="period-mark" aria-label="月经期标记" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="period-note">
                  <span className="custom-period-icon">✦</span>
                  <span>月经期记录</span>
                  <small>仅做标记，不预测周期</small>
                </div>
              </section>

              <section className="section">
                <div className="section-heading">
                  <div>
                    <h2>工作 / 学习</h2>
                    <p>
                      {tasks.filter(t => t.done).length}/{tasks.length} 已完成
                    </p>
                  </div>
                  <button
                    className="small-button"
                    onClick={() => setTaskModal(true)}
                  >
                    <Icon src={ICONS.addTask} size={16} />
                    添加
                  </button>
                </div>
                <div className="list-surface">
                  {tasks.map(task => (
                    <label
                      className={`task-row ${task.done ? 'done' : ''}`}
                      key={task.id}
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() =>
                          setTasks(
                            tasks.map(t =>
                              t.id === task.id ? { ...t, done: !t.done } : t,
                            ),
                          )
                        }
                      />
                      <span className="checkmark" />
                      <div>
                        <strong>{task.title}</strong>
                        <small>{task.span}</small>
                      </div>
                      <em>{task.type === 'work' ? '工作' : '学习'}</em>
                    </label>
                  ))}
                </div>
              </section>

              <section className="section">
                <div className="section-heading">
                  <div>
                    <h2>好好吃饭</h2>
                    <p>把一顿饭，认真地记下来</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => notify('已保存今天的饮食记录')}
                  >
                    保存
                  </button>
                </div>
                <div className="meal-grid">
                  <div>
                    <span>早</span>
                    <p>酸奶碗、蓝莓和坚果</p>
                  </div>
                  <div>
                    <span>午</span>
                    <p>番茄牛腩饭，吃到七分饱</p>
                  </div>
                  <button onClick={() => notify('晚餐记录入口已打开')}>
                    <Icon src={ICONS.add} size={16} /> 记录晚餐
                  </button>
                </div>
              </section>

              <section className="section">
                <div className="section-heading">
                  <div>
                    <h2>动一动</h2>
                    <p>每格 15 分钟，2 格即达成</p>
                  </div>
                </div>
                <div className="movement-surface">
                  {(['cardio', 'strength'] as const).map(kind => (
                    <div className="movement" key={kind}>
                      <div
                        className={`runner ${exercise[kind] === 2 ? 'filled' : ''}`}
                      >
                        <span />
                        <i />
                        <b />
                      </div>
                      <div>
                        <strong>{kind === 'cardio' ? '有氧' : '无氧'}</strong>
                        <small>{exercise[kind] * 15} 分钟</small>
                      </div>
                      <div className="blocks">
                        {[1, 2].map(n => (
                          <button
                            key={n}
                            aria-label={`记录第 ${n} 格`}
                            className={exercise[kind] >= n ? 'active' : ''}
                            onClick={() =>
                              setExercise({
                                ...exercise,
                                [kind]: exercise[kind] === n ? n - 1 : n,
                              })
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="section mood-section">
                <div className="section-heading">
                  <div>
                    <h2>今天感觉怎样？</h2>
                    <p>不解释也可以，只选一个表情</p>
                  </div>
                </div>
                <div className="moods">
                  {['平静', '开心', '疲惫', '低落'].map(m => (
                    <PixelFace
                      key={m}
                      mood={m}
                      active={mood === m}
                      onClick={() => setMood(m)}
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {page === 'progress' && (
            <>
              <section className="intro">
                <span>KEEP GOING, GENTLY</span>
                <h2>一点点积累，也是在向前。</h2>
                <p>资料与进度保存在这个静态原型的当前会话中。</p>
              </section>
              <section className="section">
                <div className="section-heading">
                  <div>
                    <h2>英语学习</h2>
                    <p>不使用 AI，只保留自己的节奏</p>
                  </div>
                  <button
                    className="small-button"
                    onClick={() => notify('已模拟选择学习资料')}
                  >
                    <Icon src={ICONS.upload} size={16} />
                    上传资料
                  </button>
                </div>
                <div className="study-card">
                  <div className="file-badge">PDF</div>
                  <div className="study-main">
                    <strong>English Grammar in Use</strong>
                    <small>Unit 36 · 现在完成时</small>
                    <div className="progress-track">
                      <i style={{ width: `${englishProgress}%` }} />
                    </div>
                    <span>{englishProgress}%</span>
                  </div>
                  <button
                    className="primary-button"
                    onClick={() =>
                      setEnglishProgress(Math.min(100, englishProgress + 8))
                    }
                  >
                    继续学习
                  </button>
                </div>
                <div className="study-card compact">
                  <div className="file-badge lilac">MP3</div>
                  <div className="study-main">
                    <strong>BBC 6 Minute English</strong>
                    <small>已听 08:42 / 12:00</small>
                  </div>
                  <button
                    className="secondary-button"
                    onClick={() => notify('继续播放：08:42')}
                  >
                    继续
                  </button>
                </div>
              </section>
              <section className="section">
                <div className="section-heading">
                  <div>
                    <h2>阅读便签</h2>
                    <p>书名、页码、摘录或一闪而过的想法</p>
                  </div>
                  <button
                    className="small-button"
                    onClick={() => notify('已新建一张空白便签')}
                  >
                    <Icon src={ICONS.add} size={16} />
                    新便签
                  </button>
                </div>
                <div className="notes">
                  <article>
                    <small>《悉达多》 · P.86</small>
                    <p>“每个人都可以施展魔法，每个人都可以达到他的目标。”</p>
                    <span>读得慢一点，句子才会留下。</span>
                  </article>
                  <article>
                    <small>《设计心理学》 · P.124</small>
                    <p>好的设计，让正确的行动自然发生。</p>
                    <span>想到今天做的任务流程。</span>
                  </article>
                </div>
              </section>
            </>
          )}

          {page === 'money' && (
            <>
              <section className="ledger-summary">
                <div>
                  <small>2026 年 10 月结余</small>
                  <strong>¥ 9,500</strong>
                  <span>收入 ¥19,300 · 支出 ¥9,800</span>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => notify('月度总账编辑入口已打开')}
                >
                  手动填写
                </button>
              </section>
              <section className="section">
                <div className="section-heading">
                  <div>
                    <h2>月度总账</h2>
                    <p>只记录总收入与总支出</p>
                  </div>
                  <span className="legend">
                    <i />
                    收入 <i />
                    支出
                  </span>
                </div>
                <div className="chart">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart
                      data={chartData}
                      margin={{ top: 8, right: 4, left: -24, bottom: 0 }}
                    >
                      <CartesianGrid stroke="#eef0f3" vertical={false} />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#8f959e' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#8f959e' }}
                        tickFormatter={v => `${v / 1000}k`}
                      />
                      <Tooltip
                        formatter={v => `¥${Number(v).toLocaleString()}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#7383b9"
                        fill="#eef0f8"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="expense"
                        stroke="#d6a17c"
                        fill="#fbf1e9"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
              <section className="section">
                <div className="section-heading">
                  <div>
                    <h2>季度收入小岛</h2>
                    <p>不同平台约每季度更新一次</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => notify('季度收入已标记为待更新')}
                  >
                    更新
                  </button>
                </div>
                <div className="islands">
                  <div className="island island-a">
                    <strong>¥52,800</strong>
                    <span>主业薪资</span>
                    <small>Q4 已更新</small>
                  </div>
                  <div className="island island-b">
                    <strong>¥6,400</strong>
                    <span>内容合作</span>
                    <small>Q3 数据</small>
                  </div>
                  <div className="island island-c">
                    <strong>¥3,200</strong>
                    <span>课程分成</span>
                    <small>Q3 数据</small>
                  </div>
                </div>
              </section>
              <section className="section">
                <div className="section-heading">
                  <div>
                    <h2>事业路线</h2>
                    <p>方向 → 行动 → 完成证据</p>
                  </div>
                </div>
                <div className="career">
                  <div>
                    <small>方向</small>
                    <p>成为独立的生活方式产品设计师</p>
                  </div>
                  <div>
                    <small>本月行动</small>
                    <p>完成作品集案例；约谈 3 位真实用户</p>
                  </div>
                  <div>
                    <small>完成证据</small>
                    <p>案例已发布 · 访谈记录 2/3</p>
                  </div>
                </div>
              </section>
            </>
          )}

          {page === 'rewards' && (
            <>
              <section className="reward-hero">
                <div className="card-art">
                  <span>13</span>
                  <i>OCT</i>
                  <b>慢慢生长</b>
                </div>
                <div>
                  <span>TODAY'S CARD</span>
                  <h2>每一个完成，都值得被看见。</h2>
                  <p>完成今日打卡后，可以抽取一张纪念卡。</p>
                  <button
                    className="primary-button"
                    onClick={() => setRewardModal(true)}
                  >
                    抽一张卡
                  </button>
                </div>
              </section>
              <section className="section">
                <div className="section-heading">
                  <div>
                    <h2>卡片图鉴</h2>
                    <p>已收藏 8 / 24 张</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setCatalogOpen(!catalogOpen)}
                  >
                    {catalogOpen ? '收起' : '查看全部'}
                  </button>
                </div>
                <div className={`catalog ${catalogOpen ? 'expanded' : ''}`}>
                  {[
                    '早起的光',
                    '完成比完美好',
                    '好好吃饭',
                    '读完一章',
                    '温柔坚定',
                    '今日留白',
                  ].map((n, i) => (
                    <article key={n} className={`mini-card tone-${i % 3}`}>
                      <small>NO.{String(i + 1).padStart(2, '0')}</small>
                      <strong>{n}</strong>
                      <span>MY LIFE</span>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}

          {page === 'settings' && (
            <>
              <section className="settings-group">
                <h2>个性化</h2>
                <button onClick={() => notify('卡面管理：支持替换自制卡面')}>
                  <span>
                    <strong>卡面管理</strong>
                    <small>上传、替换与整理自制卡面</small>
                  </span>
                  <b>›</b>
                </button>
                <button onClick={() => notify('月经期图标管理入口已打开')}>
                  <span>
                    <strong>月经期图标管理</strong>
                    <small>替换周视图中的自定义小图标</small>
                  </span>
                  <b>›</b>
                </button>
              </section>
              <section className="settings-group">
                <h2>数据</h2>
                <button onClick={() => notify('静态原型暂不执行真实导出')}>
                  <span>
                    <strong>导出我的数据</strong>
                    <small>任务、日记、学习与财务记录</small>
                  </span>
                  <b>›</b>
                </button>
                <div className="settings-note">
                  这是一个静态交互原型。当前不会连接后端、执行真实上传或导出，也不会做周期预测。
                </div>
              </section>
            </>
          )}
        </div>

        <nav className="bottom-nav" aria-label="主导航">
          {[
            ['daily', ICONS.calendar, '日常'],
            ['progress', ICONS.book, '进度'],
            ['money', ICONS.money, '金钱'],
            ['rewards', ICONS.reward, '奖励'],
          ].map(([key, icon, label]) => (
            <button
              key={key}
              className={page === key ? 'active' : ''}
              onClick={() => setPage(key as PageKey)}
            >
              <Icon src={icon} size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {taskModal && (
        <Modal onClose={() => setTaskModal(false)}>
          <div className="modal-head">
            <div>
              <span>NEW TASK</span>
              <h2>添加任务</h2>
            </div>
            <button
              className="icon-button"
              onClick={() => setTaskModal(false)}
              aria-label="关闭"
            >
              ×
            </button>
          </div>
          <label>
            任务名称
            <input
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="写下要完成的事"
            />
          </label>
          <div className="date-fields">
            <label>
              开始日期
              <input
                type="date"
                value={newTask.start}
                onChange={e =>
                  setNewTask({ ...newTask, start: e.target.value })
                }
              />
            </label>
            <label>
              结束日期
              <input
                type="date"
                value={newTask.end}
                onChange={e => setNewTask({ ...newTask, end: e.target.value })}
              />
            </label>
          </div>
          <p className="hint">结束日期晚于开始日期时，任务会自动延续多天。</p>
          <button className="primary-button full" onClick={addTask}>
            添加到清单
          </button>
        </Modal>
      )}
      {rewardModal && (
        <Modal onClose={() => setRewardModal(false)}>
          <div className="draw-result">
            <span>YOU FOUND A CARD</span>
            <div className="large-card">
              <small>NO.08 · OCTOBER</small>
              <strong>
                今天也
                <br />
                好好生活了
              </strong>
              <i>MY DAILY · MY LIFE</i>
            </div>
            <h2>「好好生活」</h2>
            <p>这张卡已经放进你的图鉴。</p>
            <button
              className="primary-button full"
              onClick={() => setRewardModal(false)}
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
