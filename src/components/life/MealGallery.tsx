import { compressImage } from '@/lib/lifeUtils';
import { Camera, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { ConfirmModal } from './ConfirmModal';

const MAX_IMAGES = 5;
const MAX_SOURCE_BYTES = 8 * 1024 * 1024;
const allowed = ['image/jpeg', 'image/png', 'image/webp'];

interface Props {
  uid: string;
  label: string;
  images: string[];
  disabled?: boolean;
  onChange: (recipe: (current: string[]) => string[]) => void;
  notify: (text: string) => void;
}

export function MealGallery({
  uid,
  label,
  images,
  disabled = false,
  onChange,
  notify,
}: Props) {
  const upload = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const addImages = async (files: FileList | null) => {
    if (disabled || uploading || !files?.length) return;
    setUploading(true);
    try {
      const incoming = Array.from(files);
      if (images.length + incoming.length > MAX_IMAGES) {
        throw new Error(`每餐最多保存 ${MAX_IMAGES} 张图片`);
      }
      const uploaded: string[] = [];
      try {
        for (const file of incoming) {
          if (!allowed.includes(file.type))
            throw new Error('仅支持 JPG、PNG、WebP 图片');
          if (file.size > MAX_SOURCE_BYTES)
            throw new Error('单张原图请小于 8MB');
          const compressed = await compressImage(file, 800, 0.5);
          uploaded.push(compressed);
        }
      } catch (error) {
        throw error;
      }
      onChange(current => [...current, ...uploaded]);
      notify('图片已上传保存');
    } catch (error) {
      notify((error as Error).message);
    } finally {
      setUploading(false);
      if (upload.current) upload.current.value = '';
    }
  };
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
              disabled={disabled || uploading}
              onClick={() => setPendingRemoval(index)}
              aria-label={`删除${label}图片 ${index + 1}`}
            >
              <X size={10} />
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <button
            className="meal-add"
            disabled={disabled || uploading}
            onClick={() => upload.current?.click()}
            aria-label={`添加${label}图片`}
          >
            {images.length ? <Plus size={15} /> : <Camera size={15} />}
            {!images.length && <small>添图</small>}
          </button>
        )}
      </div>
      <input
        ref={upload}
        hidden
        disabled={disabled || uploading}
        multiple
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={event => addImages(event.target.files)}
      />
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