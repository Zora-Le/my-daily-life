import type { RewardCard } from '@/hooks/useLifeStore';
import {
  ChevronDown,
  ChevronUp,
  Paintbrush,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
  cards: RewardCard[];
  renderFace: (card: RewardCard) => React.ReactNode;
  onEdit: (card: RewardCard) => void;
  onReturn: (card: RewardCard) => void;
  onDelete: (card: RewardCard) => void;
}

export function DrawnRewardsDeck({
  cards,
  renderFace,
  onEdit,
  onReturn,
  onDelete,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const visibleCards = expanded ? cards : cards.slice(0, 1);

  if (!cards.length) return null;

  return (
    <section className="life-section drawn-rewards-section">
      <div className="section-heading drawn-rewards-heading">
        <div>
          <span className="overline">COLLECTED</span>
          <h2>已抽 · {cards.length} 张</h2>
        </div>
        <button
          type="button"
          className="drawn-toggle"
          aria-expanded={expanded}
          aria-controls="drawn-reward-collection"
          onClick={() => setExpanded(value => !value)}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? '收起' : '查看全部'}
        </button>
      </div>
      <div
        id="drawn-reward-collection"
        className={
          expanded
            ? 'drawn-reward-grid expanded'
            : `drawn-reward-stack ${cards.length === 1 ? 'single' : ''}`
        }
      >
        {visibleCards.map((card, index) => (
          <article className="drawn-reward-card" key={card.id}>
            <button
              type="button"
              className="drawn-card-face-button"
              aria-expanded={expanded}
              onClick={() => setExpanded(value => !value)}
              aria-label={`${expanded ? '收起' : '展开'}全部 ${cards.length} 张已抽卡片`}
            >
              {renderFace(card)}
            </button>
            <div className="drawn-card-actions">
              <button
                type="button"
                disabled={card.id.startsWith('preview-')}
                onClick={() => onEdit(card)}
                aria-label={`编辑 ${card.title}`}
              >
                <Paintbrush size={13} /> 编辑
              </button>
              <button
                type="button"
                className="return-to-pool"
                disabled={card.id.startsWith('preview-')}
                onClick={() => onReturn(card)}
                aria-label={`将 ${card.title} 退回卡池`}
              >
                <RotateCcw size={13} /> 退回卡池
              </button>
              <button
                type="button"
                className="danger"
                disabled={card.id.startsWith('preview-')}
                onClick={() => onDelete(card)}
                aria-label={`删除 ${card.title}`}
              >
                <Trash2 size={13} /> 删除
              </button>
            </div>
            {!expanded && index === 0 && cards.length > 1 && (
              <span className="drawn-stack-count">
                牌堆共 {cards.length} 张 · 点击卡面展开
              </span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
