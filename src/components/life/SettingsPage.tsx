import type { LifeState } from '@/hooks/useLifeStore';
import {
  ChevronRight,
  Database,
  Download,
  HardDrive,
  Upload,
} from 'lucide-react';
import { useRef } from 'react';
export function SettingsPage({
  state,
  onImport,
  notify,
}: {
  state: LifeState;
  onImport: (raw: string) => void;
  notify: (text: string) => void;
}) {
  const upload = useRef<HTMLInputElement>(null);
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
        <h2>每次修改都会自动留在当前设备。</h2>
        <p>日常使用不需要导出；备份适合换设备或长期归档。</p>
      </section>
      <section className="settings-list">
        <h3>本地数据</h3>
        <button onClick={() => notify('浏览器本地存储运行正常')}>
          <HardDrive />
          <span>
            <b>自动保存已开启</b>
            <small>每日记录、任务、书架、便签、储蓄与奖励卡</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={download}>
          <Download />
          <span>
            <b>导出 JSON 备份</b>
            <small>用于跨设备迁移或额外备份</small>
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
          onChange={async e => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              onImport(await file.text());
              notify('备份已导入');
            } catch (err) {
              notify((err as Error).message);
            }
          }}
        />
        <h3>同步边界</h3>
        <button onClick={() => notify('正式版可以接入 Supabase 云同步')}>
          <Database />
          <span>
            <b>当前为浏览器本地保存</b>
            <small>同一浏览器设备有效；清缓存或换设备前请先导出</small>
          </span>
          <ChevronRight />
        </button>
      </section>
      <p className="prototype-note">
        图片会在写入前压缩，并限制单条便签的图片数量。浏览器空间接近上限时，请先导出备份并减少图片；正式产品可接入
        Supabase，实现账号级云同步。
      </p>
    </>
  );
}
