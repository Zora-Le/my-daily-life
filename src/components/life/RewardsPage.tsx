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
  const drawn = cards.filter(card => card.drawnAt);
  const draw = () => {
    if (!unlocked || !undrawn.length) return;
    setPending(undrawn[Math.floor(Math.random() * undrawn.length)]);
    setFlipped(false);
  };
  const keepCard = () => {
    if (!pending) return;
    const drawnAt = new Date().toISOString();
    onCards(
      cards.map(card => (card.id === pending.id ? { ...card, drawnAt } : card)),
    );
    onHistory([...history, { cardId: pending.id, drawnAt }]);
    setPending(null);
    notify('卡片已永久保留');
  };
  return (
    <>
      <section className="reward-title">
        <span className="overline">A SMALL REWARD</span>
        <h2>认真生活，也给自己一份奖励。</h2>
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
          <span>每日抽卡机会</span>
          <h3>{unlocked ? '今日惊喜已点亮' : '今日机会未点亮'}</h3>
          <b className="pool-count">卡池 {undrawn.length}</b>
          <button disabled={!unlocked || !undrawn.length} onClick={draw}>
            {unlocked ? (
              <>
                <Sparkles size={14} />
                抽一张卡
              </>
            ) : (
              <>
                <LockKeyhole size={14} />
                未解锁
              </>
            )}
          </button>
        </div>
        {drawn.length > 0 && (
          <div className="drawn-stack">
            {drawn.map((card, index) => (
              <button
                key={card.id}
                style={{ '--card-order': index } as React.CSSProperties}
                onClick={() => setEditing(card)}
              >
                <small>{card.drawnAt?.slice(0, 10)}</small>
                <b>{card.title}</b>
              </button>
            ))}
          </div>
        )}
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
          {undrawn
            .filter(card => card.kind === tab)
            .map(card => (
              <article className="reward-card in-pool" key={card.id}>
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
                <small>仍在卡池</small>
                <h3>等待相遇</h3>
                <button onClick={() => setEditing(card)}>
                  <Paintbrush size={12} />
                  编辑卡面
                </button>
              </article>
            ))}
        </div>
      </section>
      {pending && (
        <div className="modal-mask">
          <dialog open className="modal-sheet reward-modal">
            <button className="modal-close" onClick={() => setPending(null)}>
              <X />
            </button>
            <p className="overline">TODAY'S CARD</p>
            <button
              className={`flip-card ${flipped ? 'flipped' : ''}`}
              onClick={() => setFlipped(true)}
            >
              {!flipped ? (
                <div className="card-back">
                  <Cat />
                  <Flower2 />
                  <span>待揭晓</span>
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
              <button className="primary-action" onClick={keepCard}>
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
                <h2>我的卡面</h2>
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
                notify('卡面已保存');
              }}
            />
          </dialog>
        </div>
      )}
    </>
  );
}
