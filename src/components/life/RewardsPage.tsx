import { Camera, ChevronDown, LockKeyhole, Sparkles } from 'lucide-react';
import { useState } from 'react';

const joyCards = [
  '调一杯喜欢的饮品',
  '吹一吹秋季晚风',
  '看看小猫咪',
  '晒冬日暖阳',
  '联系一位亲友',
];
const sweetCards = [
  { no: '01', title: '黄昏散步', copy: '风把今天吹得很轻。', tone: 'sunset' },
  {
    no: '02',
    title: '窗边早餐',
    copy: '好好吃饭，是给自己的拥抱。',
    tone: 'morning',
  },
  { no: '03', title: '一场小雨', copy: '世界安静，我也安静。', tone: 'rain' },
];
interface Props {
  unlocked: boolean;
  onDraw: () => void;
  notify: (text: string) => void;
}
export function RewardsPage({ unlocked, onDraw, notify }: Props) {
  const [tab, setTab] = useState<'sweet' | 'joy'>('sweet');
  const [catalogOpen, setCatalogOpen] = useState(false);
  return (
    <>
      <section className="reward-title">
        <span className="overline">TREASURE EVERY SECOND</span>
        <h2>我珍惜秒秒的瞬间</h2>
        <p>认真完成今天，也认真收藏今天。</p>
      </section>
      <section className={`draw-deck ${unlocked ? 'unlocked' : 'locked'}`}>
        <div className="deck-cards">
          <i />
          <i />
          <i>{!unlocked && <LockKeyhole size={22} />}</i>
        </div>
        <div>
          <span>{unlocked ? 'TODAY IS READY' : 'TODAY · LOCKED'}</span>
          <h3>
            {unlocked ? '你把今天照顾得很好。' : '再完成一些，就能与惊喜见面。'}
          </h3>
          <p>
            {unlocked
              ? '抽一张卡，留住此刻。'
              : '完成大部分任务，并认真吃好三餐。'}
          </p>
          <button disabled={!unlocked} onClick={onDraw}>
            {unlocked ? (
              <>
                <Sparkles size={14} />
                抽一张卡
              </>
            ) : (
              <>
                <LockKeyhole size={14} />
                牌组暂未开放
              </>
            )}
          </button>
        </div>
      </section>
      <section className="life-section">
        <div className="card-tabs">
          <button
            className={tab === 'sweet' ? 'active' : ''}
            onClick={() => setTab('sweet')}
          >
            Sweet Moments
          </button>
          <button
            className={tab === 'joy' ? 'active' : ''}
            onClick={() => setTab('joy')}
          >
            Chase Joys
          </button>
        </div>
        {tab === 'sweet' ? (
          <>
            <div className="upload-tip">
              <Camera size={15} />
              <span>
                <b>过去照片 + 手绘涂鸦</b>上传建议尺寸 750 × 1000px 竖版
              </span>
              <button onClick={() => notify('照片上传入口已打开')}>上传</button>
            </div>
            <div className="sweet-grid">
              {sweetCards.map(card => (
                <article className={`sweet-card ${card.tone}`} key={card.no}>
                  <div className="abstract-photo">
                    <span />
                    <i />
                    <b>⌁</b>
                  </div>
                  <small>NO.{card.no}</small>
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="joy-list">
            {joyCards.map((text, i) => (
              <article key={text}>
                <small>JOY · {String(i + 1).padStart(2, '0')}</small>
                <p>{text}</p>
                <span>现在就可以去做</span>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="life-section catalog-section">
        <div className="section-heading">
          <div>
            <h2>我的图鉴</h2>
            <p>已收藏 3 张生活碎片</p>
          </div>
          <button
            className="text-action"
            onClick={() => setCatalogOpen(!catalogOpen)}
          >
            {catalogOpen ? '收起' : '展开'}
            <ChevronDown size={13} />
          </button>
        </div>
        {catalogOpen && (
          <div className="catalog-strip">
            {sweetCards.map(c => (
              <span key={c.no}>
                NO.{c.no}
                <b>{c.title}</b>
              </span>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
