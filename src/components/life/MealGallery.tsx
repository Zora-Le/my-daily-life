import { X } from 'lucide-react';
import { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';

interface Props {
  label: string;
  images: string[];
  disabled?: boolean;
  onChange: (recipe: (current: string[]) => string[]) => void;
  notify: (text: string) => void;
}

export function MealGallery({
  label,
  images,
  disabled = false,
  onChange,
  notify,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<number | null>(null);
  const remove = async () => {
    if (pendingRemoval === null) return;
    const image = images[pendingRemoval];
    try {
      onChange(current => current.filter(item => item !== image));
      setPendingRemoval(null);
      notify('图片已删除');
    } catch {
      notify('图片删除失败，请稍后重试');
    }
  };
  return (
    <>
      <div className="meal-gallery">
        {images.map((image, index) => (
          <div className="meal-image" key={`${image.slice(-18)}-${index}`}>
            <button
              className="meal-preview"
              onClick={() => setPreview(image)}
              aria-label={`查看${label}图片 ${index + 1}`}
            >
              <img src={image} alt={`${label}记录 ${index + 1}`} />
            </button>
            <button
              className="meal-image-remove"
              disabled={disabled}
              onClick={() => setPendingRemoval(index)}
              aria-label={`删除${label}图片 ${index + 1}`}
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>
      {preview && (
        <div
          className="image-lightbox"
          role="presentation"
          onClick={event => {
            if (event.target === event.currentTarget) setPreview(null);
          }}
        >
          <button onClick={() => setPreview(null)} aria-label="关闭大图">
            <X size={20} />
          </button>
          <img src={preview} alt={`${label}完整图片`} />
        </div>
      )}
      <ConfirmModal
        open={pendingRemoval !== null}
        title="删除饮食图片"
        message="删除后无法恢复，确定移除这张图片吗？"
        confirmLabel="删除"
        onCancel={() => setPendingRemoval(null)}
        onConfirm={remove}
      />
    </>
  );
}
