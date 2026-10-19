import type { RewardCard } from '@/hooks/useLifeStore';
import { compressImage } from '@/lib/lifeUtils';
import {
  ImagePlus,
  LockKeyhole,
  Paintbrush,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';
import { DrawingEditor } from './DrawingEditor';
import { DrawnRewardsDeck } from './DrawnRewardsDeck';

type Kind = RewardCard['kind'];
type Draft = { kind: Kind; title: string; copy: string; image?: string };

interface Props {
  unlocked: boolean;
  cards: RewardCard[];
  history: { cardId: string; drawnAt: string }[];
  title: string;
  copy: string;
  preview?: boolean;
  onTitle: (value: string) => void;
  onCopy: (value: string) => void;
  onCards: (cards: RewardCard[]) => void;
  onHistory: (items: { cardId: string; drawnAt: string }[]) => void;
  onDeleteCard: (cardId: string) => void;
  notify: (text: string) => void;
}

const kindLabel = (kind: Kind) =>
  kind === 'sweet' ? 'Sweet Moments' : 'Chase Joys';

function BackPattern({ kind }: { kind: Kind }) {
  return (
    <svg viewBox="0 0 100 130" aria-hidden="true">
      <rect x="5" y="5" width="90" height="120" rx="10" />
      <rect x="11" y="11" width="78" height="108" rx="7" />
      {kind === 'sweet' ? (
        <>
          <path d="M50 35c-17-18-35 8 0 32 35-24 17-50 0-32Z" />
          <path d="M25 92c18-19 32-19 50 0M31 98c13-12 25-12 38 0" />
        </>
      ) : (
        <>
          <path d="M33 55c0-18 8-28 17-28s17 10 17 28c0 17-8 30-17 30S33 72 33 55Z" />
          <path d="M38 34 29 24l2 19m31-9 9-10-2 19M43 58h1m12 0h1M44 69c4 4 8 4 12 0" />
          <path d="M25 102c9-10 17-10 25 0 8-10 16-10 25 0" />
        </>
      )}
    </svg>
  );
}

function PoolStack({ kind, count }: { kind: Kind; count: number }) {
  return (
    <article className={`pool-stack ${kind}`}>
      <div
        className="pool-stack-cards"
        aria-label={`${kindLabel(kind)} 剩余 ${count} 张`}
      >
        <i />
        <i />
        <div className="pool-card-back">
          <BackPattern kind={kind} />
        </div>
      </div>
      <div className="pool-stack-meta">
        <b>{kindLabel(kind)}</b>
        <span>{count} 张待抽</span>
      </div>
    </article>
  );
}

function CardFace({ card }: { card: RewardCard }) {
  return (
    <>
      <div className="drawn-card-image">
        {card.image ? (
          <img src={card.image} alt="卡面" />
        ) : (
          <BackPattern kind={card.kind} />
        )}
      </div>
      <small>{kindLabel(card.kind)}</small>
      <h3>{card.title}</h3>
      <p>{card.copy}</p>
    </>
  );
}

export function RewardsPage({
  unlocked,
  cards,
  history,
  title,
  copy,
  preview = false,
  onTitle,
  onCopy,
  onCards,
  onHistory,
  onDeleteCard,
  notify,
}: Props) {
  const [pending, setPending] = useState<RewardCard | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [editing, setEditing] = useState<RewardCard | null>(null);
  const [adding, setAdding] = useState(false);
  const [drawingDraft, setDrawingDraft] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RewardCard | null>(null);
  const [draft, setDraft] = useState<Draft>({
    kind: 'sweet',
    title: '',
    copy: '',
  });
  const undrawn = cards.filter(card => !card.drawnAt);
  const drawn = cards.filter(card => card.drawnAt);
  const previewDrawn: RewardCard[] = preview
    ? cards.slice(0, 2).map((card, index) => ({
        ...card,
        id: `preview-${card.id}`,
        drawnAt: `2026-10-${String(14 - index).padStart(2, '0')}T12:00:00.000Z`,
      }))
    : [];
  const displayedDrawn = [...(drawn.length ? drawn : previewDrawn)].sort(
    (a, b) => (b.drawnAt ?? '').localeCompare(a.drawnAt ?? ''),
  );
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
  const closeAdd = () => {
    setAdding(false);
    setDrawingDraft(false);
    setDraft({ kind: 'sweet', title: '', copy: '' });
  };
  const saveDraft = () => {
    const nextTitle = draft.title.trim();
    const nextCopy = draft.copy.trim();
    if (!nextTitle || !nextCopy) return notify('请填写卡片标题和文案');
    const nextCard: RewardCard = {
      id: `reward-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind: draft.kind,
      title: nextTitle,
      copy: nextCopy,
      ...(draft.image ? { image: draft.image } : {}),
    };
    const estimatedBytes =
      new Blob([JSON.stringify([...cards, nextCard])]).size * 2;
    if (estimatedBytes > 4.5 * 1024 * 1024) {
      return notify('本地存储空间可能不足，请换用更小图片或先导出备份');
    }
    onCards([...cards, nextCard]);
    closeAdd();
    notify(`已加入 ${kindLabel(nextCard.kind)} 卡池`);
  };
  return (
    <>
      <section className="reward-title editable-reward-title">
        <input
          value={title}
          onChange={event => onTitle(event.target.value)}
          aria-label="奖励小标题"
        />
        <textarea
          value={copy}
          onChange={event => onCopy(event.target.value)}
          aria-label="奖励寄语"
        />
      </section>

      <DrawnRewardsDeck
        cards={displayedDrawn}
        renderFace={card => <CardFace card={card} />}
        onEdit={setEditing}
        onDelete={setDeleteTarget}
      />

      <section
        className={`draw-deck reward-draw-panel ${unlocked ? 'unlocked' : 'locked'}`}
      >
        <div className="reward-draw-copy">
          <span>DAILY DRAW</span>
          <h3>{unlocked ? '今日惊喜已点亮' : '今日机会未点亮'}</h3>
          <p>完成今日进步目标后，可从两个卡池随机抽取一张。</p>
          <button disabled={!unlocked || !undrawn.length} onClick={draw}>
            {unlocked ? <Sparkles size={14} /> : <LockKeyhole size={14} />}
            {unlocked ? '抽一张卡' : '未解锁'}
          </button>
        </div>
        <b className="pool-total">剩余 {undrawn.length} 张</b>
      </section>

      <section className="life-section reward-pools-section">
        <div className="section-heading reward-pool-heading">
          <div>
            <span className="overline">CARD POOLS</span>
            <h2>我的卡池</h2>
          </div>
          <button
            className="reward-add-button"
            onClick={() => setAdding(true)}
            aria-label="添加卡片"
          >
            <Plus size={17} />
          </button>
        </div>
        <div className="pool-stack-grid">
          <PoolStack
            kind="sweet"
            count={undrawn.filter(card => card.kind === 'sweet').length}
          />
          <PoolStack
            kind="joy"
            count={undrawn.filter(card => card.kind === 'joy').length}
          />
        </div>
        <p className="pool-privacy-note">
          未抽卡仅展示背面，卡面内容会一直保密到揭晓。
        </p>
      </section>

      {pending && (
        <div className="modal-mask">
          <dialog open className="modal-sheet reward-modal">
            <button
              className="modal-close"
              onClick={() => setPending(null)}
              aria-label="关闭"
            >
              <X />
            </button>
            <p className="overline">TODAY'S CARD</p>
            <button
              className={`flip-card ${flipped ? 'flipped' : ''}`}
              onClick={() => setFlipped(true)}
            >
              {!flipped ? (
                <div className="card-back">
                  <BackPattern kind={pending.kind} />
                  <span>轻触揭晓</span>
                </div>
              ) : (
                <div className="card-front">
                  {pending.image && <img src={pending.image} alt="卡面" />}
                  <small>{kindLabel(pending.kind)}</small>
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

      {adding && (
        <div className="modal-mask" onPointerDown={closeAdd}>
          <dialog
            open
            className="modal-sheet reward-create-sheet"
            onPointerDown={event => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span>NEW CARD</span>
                <h2>添加一张奖励卡</h2>
              </div>
              <button onClick={closeAdd} aria-label="关闭">
                <X />
              </button>
            </div>
            {drawingDraft ? (
              <DrawingEditor
                notify={notify}
                onSave={image => {
                  setDraft(current => ({ ...current, image }));
                  setDrawingDraft(false);
                  notify('手绘卡面已暂存');
                }}
              />
            ) : (
              <>
                <div className="reward-kind-picker">
                  {(['sweet', 'joy'] as const).map(kind => (
                    <button
                      key={kind}
                      className={draft.kind === kind ? 'active' : ''}
                      onClick={() => setDraft({ ...draft, kind })}
                    >
                      {kindLabel(kind)}
                    </button>
                  ))}
                </div>
                <label>
                  卡片标题
                  <input
                    maxLength={28}
                    value={draft.title}
                    onChange={event =>
                      setDraft({ ...draft, title: event.target.value })
                    }
                    placeholder="例如：黄昏散步"
                  />
                </label>
                <label>
                  卡片文案
                  <textarea
                    maxLength={90}
                    value={draft.copy}
                    onChange={event =>
                      setDraft({ ...draft, copy: event.target.value })
                    }
                    placeholder="写一句留给未来自己的话"
                  />
                </label>
                <div className="card-image-picker">
                  {draft.image ? (
                    <img src={draft.image} alt="待保存卡面" />
                  ) : (
                    <BackPattern kind={draft.kind} />
                  )}
                  <div>
                    <label className="image-upload-button">
                      <ImagePlus size={15} /> 从相册选择
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={async event => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          try {
                            const image = await compressImage(file, 900, 0.72);
                            setDraft(current => ({ ...current, image }));
                            notify('图片已压缩并载入');
                          } catch (error) {
                            notify((error as Error).message);
                          }
                          event.target.value = '';
                        }}
                      />
                    </label>
                    <button onClick={() => setDrawingDraft(true)}>
                      <Paintbrush size={15} /> 打开简单画板
                    </button>
                    <small>
                      支持手机相册图片；仅限图片且原文件不超过
                      12MB。保存前会自动压缩，本地空间不足时会提示。
                    </small>
                  </div>
                </div>
                <button className="primary-action" onClick={saveDraft}>
                  保存并加入卡池
                </button>
              </>
            )}
          </dialog>
        </div>
      )}

      {editing && !editing.id.startsWith('preview-') && (
        <div className="modal-mask">
          <dialog open className="modal-sheet drawing-sheet">
            <div className="modal-head">
              <div>
                <span>CARD STUDIO</span>
                <h2>编辑卡面</h2>
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

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="删除这张奖励卡？"
        message={
          deleteTarget
            ? `“${deleteTarget.title}”将从已抽区域和抽卡历史中一起移除，无法撤销。`
            : ''
        }
        confirmLabel="确认删除"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onDeleteCard(deleteTarget.id);
          setDeleteTarget(null);
          notify('卡片及对应抽卡记录已删除');
        }}
      />
    </>
  );
}
