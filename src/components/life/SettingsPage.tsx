import type { ConfigItem, LifeState } from '@/hooks/useLifeStore';
import {
  ChevronRight,
  Download,
  HardDrive,
  SlidersHorizontal,
  Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { ItemConfigPanel } from './ItemConfigPanel';

interface Props {
  state: LifeState;
  onImport: (raw: string) => void;
  onProgressItems: (items: ConfigItem[]) => void;
  onHabitItems: (items: ConfigItem[]) => void;
  notify: (text: string) => void;
}
export function SettingsPage({
  state,
  onImport,
  onProgressItems,
  onHabitItems,
  notify,
}: Props) {
  const upload = useRef<HTMLInputElement>(null);
  const [configOpen, setConfigOpen] = useState(
    () =>
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('preview') === 'complete',
  );
  const download = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `my-daily-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    notify('备份文件已导出');
  };
  return (
    <>
      <section className="settings-intro">
        <span className="overline">YOUR DATA · YOUR DEVICE</span>
        <h2>把生活，调成自己的节奏。</h2>
        <p>记录与设置会自动保存在当前设备。</p>
      </section>
      <section className="settings-list">
        <h3>我的模块</h3>
        <button
          className={
            configOpen
              ? 'settings-config-trigger active'
              : 'settings-config-trigger'
          }
          onClick={() => setConfigOpen(!configOpen)}
        >
          <SlidersHorizontal />
          <span>
            <b>打卡项目配置</b>
            <small>My Progress · 日常习惯</small>
          </span>
          <ChevronRight />
        </button>
        {configOpen && (
          <div className="settings-config-area">
            <ItemConfigPanel
              title="My Progress"
              items={state.progressItems}
              onChange={onProgressItems}
              notify={notify}
            />
            <ItemConfigPanel
              title="日常习惯"
              items={state.habitItems}
              onChange={onHabitItems}
              notify={notify}
            />
          </div>
        )}
        <h3>本地数据</h3>
        <button onClick={() => notify('浏览器本地存储运行正常')}>
          <HardDrive />
          <span>
            <b>自动保存已开启</b>
            <small>每日记录、图片、收支、打卡与奖励卡</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={download}>
          <Download />
          <span>
            <b>导出 JSON 备份</b>
            <small>包含全部记录与自定义配置</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => upload.current?.click()}>
          <Upload />
          <span>
            <b>导入已有备份</b>
            <small>导入会覆盖当前设备上的记录</small>
          </span>
          <ChevronRight />
        </button>
        <input
          ref={upload}
          hidden
          type="file"
          accept="application/json"
          onChange={async event => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
              onImport(await file.text());
              notify('备份已导入');
            } catch (error) {
              notify((error as Error).message);
            }
          }}
        />
      </section>
    </>
  );
}
