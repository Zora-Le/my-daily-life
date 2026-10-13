import { ChevronRight, Image, Leaf, Palette, Upload } from 'lucide-react';
export function SettingsPage({ notify }: { notify: (text: string) => void }) {
  return (
    <>
      <section className="settings-intro">
        <span className="overline">A SPACE OF YOUR OWN</span>
        <h2>把这里调成喜欢的样子。</h2>
      </section>
      <section className="settings-list">
        <h3>个性化</h3>
        <button onClick={() => notify('卡片管理入口已打开')}>
          <Image />
          <span>
            <b>卡片管理</b>
            <small>整理 Sweet Moments 与 Chase Joys</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => notify('阶段符号偏好已打开')}>
          <Leaf />
          <span>
            <b>阶段符号</b>
            <small>芽、花、月与水滴</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => notify('页面色彩偏好已打开')}>
          <Palette />
          <span>
            <b>页面色彩</b>
            <small>当前：雾蓝与米白</small>
          </span>
          <ChevronRight />
        </button>
        <h3>数据</h3>
        <button onClick={() => notify('静态原型暂不执行真实导出')}>
          <Upload />
          <span>
            <b>导出生活记录</b>
            <small>任务、阅读、学习与收支</small>
          </span>
          <ChevronRight />
        </button>
      </section>
      <p className="prototype-note">
        这是一个静态交互原型。数据仅保留在当前页面会话，不连接后端，也不执行真实上传、导出或周期预测。
      </p>
    </>
  );
}
