import { compressImage } from '@/lib/lifeUtils';
import {
  deleteImageFromStorage,
  uploadImageToStorage,
} from '@/lib/uploadImage';
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
  onChange: (images: string[]) => void;
  notify: (text: string) => void;
}

export function MealGallery({ uid, label, images, onChange, notify }: Props) {
  const upload = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const slots = MAX_IMAGES - images.length;
    if (slots <= 0) return notify(`最多只能上传 ${MAX_IMAGES} 张图片`);
    const selected = Array.from(files).slice(0, slots);
    const invalid = selected.filter(f => !allowed.includes(f.type));
    if (invalid.length > 0) return notify('只支持 JPG / PNG / WebP 格式');
    const tooBig = selected.filter(f => f.size > MAX_SOURCE_BYTES);
    if (tooBig.length > 0) return notify('单张图片不能超过 8 MB');
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of selected) {
        const dataUrl = await compressImage(file);
        const url = await uploadImageToStorage(uid, dataUrl);
        urls.push(url);
      }
      onChange([...images, ...urls]);
    } catch {
      notify('图片上传失败，请重试');
    } finally {
      setUploading(false);
      if (upload.current) upload.current.value = '';
    }
  }

  async function confirmDelete() {
    if (deleteIndex === null) return;
    const url = images[deleteIndex];
    await deleteImageFromStorage(url);
    onChange(images.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
  }

  return (
    <div className="meal-gallery">
      <div className="meal-gallery-grid">
        {images.map((src, i) => (
          <button
            key={src}
            className="meal-thumb"
            type="button"
            onClick={() => setPreview(src)}
          >
            <img src={src} alt={`${label}图片 ${i + 1}`} />
            <button
              className="meal-thumb-delete"
              type="button"
              onClick={e => {
                e.stopPropagation();
                setDeleteIndex(i);
              }}
            >
              <X size={12} />
            </button>
          </button>
        ))}
        {images.length < MAX_IMAGES && (
          <button
            className="meal-thumb meal-thumb-add"
            type="button"
            disabled={uploading}
            onClick={() => upload.current?.click()}
          >
            {uploading ? (
              <span className="uploading-dot" />
            ) : (
              <>
                <Camera size={16} />
                <Plus size={10} className="meal-plus" />
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={upload}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={e => handleFiles(e.target.files)}
      />
      {preview && (
        <div
          className="meal-preview-mask"
          role="presentation"
          onClick={() => setPreview(null)}
        >
          <img src={preview} alt="预览" className="meal-preview-img" />
        </div>
      )}
      {deleteIndex !== null && (
        <ConfirmModal
          message="删除这张图片？"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteIndex(null)}
        />
      )}
    </div>
  );
}
