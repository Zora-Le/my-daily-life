import type { RewardCard } from '@/hooks/useLifeStore';
import {
  Cat,
  Flower2,
  LockKeyhole,
  Paintbrush,
  Sparkles,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { DrawingEditor } from './DrawingEditor';
interface Props {
  unlocked: boolean;
  cards: RewardCard[];
  history: { cardId: string; drawnAt: string }[];
  onCards: (cards: RewardCard[]) => void;
  onHistory: (items: { cardId: string; drawnAt: string }[]) => void;
  notify: (text: string) => void;
}
export function RewardsPage({
  unlocked,
  cards,
  history,
  onCards,
  onHistory,
  notify,
}: Props) {
  const [tab, setTab] = useState<'sweet' | 'joy'>('sweet');
  const [pending, setPending] = useState<RewardCard | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [editing, setEditing] = useState<RewardCard | null>(null);
  const undrawn = cards.filter(card => !card.drawnAt);
  const collected = cards.filter(card => card.drawnAt);
  const draw = () => {
    if (!unlocked || !undrawn.length) return;
    setPending(undrawn[Math.floor(Math.random() * undrawn.length)]);
    setFlipped(false);
  };
  const collect = () => {
    if (!pending) return;
    const drawnAt = new Date().toISOString();
    onCards(
      cards.map(card => (card.id === pending.id ? { ...card, drawnAt } : card)),
    );
    onHistory([...history, { cardId: pending.id, drawnAt }]);
    setPending(null);
    notify('卡片已收入集合，可随时查看');
  };
  const shown = cards.filter(card => card.kind === tab);
  return (
    <>
      <section className="reward-title">
        <span className="overline">A SMALL REWARD</span>
        <h2>认真生活，也给自己一份奖励。</h2>
        <p>抽中的卡会一直留在这里，不受之后任务状态影响。</p>
      </section>
      <section className={`draw-deck ${unlocked ? 'unlocked' : 'locked'}`}>
        <div className="deck-cards botanical">
          <i />
          <i />
          <i>
            <Cat />
            <Flower2 />
          </i>
        </div>
        <div>
          <span>{unlocked ? 'A CHANCE IS READY' : 'KEEP GOING'}</span>
          <h3>
            {unlocked
              ? '今天有一次与惊喜见面的机会。'
              : '照顾好今天，卡背会为你亮起。'}
          </h3>
          <p>
            {undrawn.length
              ? `卡池里还有 ${undrawn.length} 张未抽取卡面。`
              : '这一组卡已经全部与你见面。'}
          </p>
          <button disabled={!unlocked || !undrawn.length} onClick={draw}>
            {unlocked ? (
              <>
                <Sparkles size={14} />
                抽一张卡
              </>
            ) : (
              <>
                <LockKeyhole size={14} />
                机会尚未出现
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
        <div className="reward-grid">
          {shown.map(card => (
            <article
              className={`reward-card ${card.drawnAt ? '' : 'in-pool'}`}
              key={card.id}
            >
              {card.image ? (
                <img src={card.image} alt={card.title} />
              ) : tab === 'sweet' ? (
                <div className="photo-art">
                  <span />
                  <i />
                </div>
              ) : (
                <div className="line-art-card">
                  <Cat />
                  <Flower2 />
                </div>
              )}
              <small>
                {card.drawnAt
                  ? `获得于 ${card.drawnAt.slice(0, 10)}`
                  : '仍在卡池'}
              </small>
              <h3>{card.drawnAt ? card.title : '等待相遇'}</h3>
              <p>{card.drawnAt ? card.copy : '猫咪与花草守护着卡面。'}</p>
              <button onClick={() => setEditing(card)}>
                <Paintbrush size={12} />
                编辑卡面
              </button>
            </article>
          ))}
        </div>
      </section>
      <section className="life-section collected-section">
        <div className="section-heading">
          <div>
            <h2>已抽中的卡面</h2>
            <p>{collected.length} 张 · 抽取日期会一直保留</p>
          </div>
        </div>
        {collected.length ? (
          <div className="collected-strip">
            {collected.map(card => (
              <button key={card.id} onClick={() => setEditing(card)}>
                {card.image ? (
                  <img src={card.image} alt="自定义卡面" />
                ) : (
                  <>
                    <Cat />
                    <b>{card.title}</b>
                  </>
                )}
                <small>{card.drawnAt?.slice(0, 10)}</small>
              </button>
            ))}
          </div>
        ) : (
          <p className="empty-copy">翻开第一张卡后，它会出现在这里。</p>
        )}
      </section>
      {pending && (
        <div className="modal-mask">
          <dialog open className="modal-sheet reward-modal">
            <button className="modal-close" onClick={() => setPending(null)}>
              <X />
            </button>
            <p className="overline">TAP TO REVEAL</p>
            <button
              className={`flip-card ${flipped ? 'flipped' : ''}`}
              onClick={() => setFlipped(true)}
            >
              {!flipped ? (
                <div className="card-back">
                  <Cat />
                  <Flower2 />
                  <span>轻点翻转</span>
                </div>
              ) : (
                <div className="card-front">
                  <small>
                    {pending.kind === 'sweet' ? 'SWEET MOMENT' : 'CHASE JOY'}
                  </small>
                  <h2>{pending.title}</h2>
                  <p>{pending.copy}</p>
                </div>
              )}
            </button>
            {flipped && (
              <button className="primary-action" onClick={collect}>
                收下这张卡
              </button>
            )}
          </dialog>
        </div>
      )}
      {editing && (
        <div className="modal-mask">
          <dialog open className="modal-sheet drawing-sheet">
            <div className="modal-head">
              <div>
                <span>CARD STUDIO</span>
                <h2>画一张自己的卡</h2>
              </div>
              <button onClick={() => setEditing(null)}>
                <X />
              </button>
            </div>
            <DrawingEditor
              notify={notify}
              onSave={image => {
                onCards(
                  cards.map(card =>
                    card.id === editing.id ? { ...card, image } : card,
                  ),
                );
                setEditing(null);
                notify('新卡面已保存在此设备');
              }}
            />
          </dialog>
        </div>
      )}
    </>
  );
}
