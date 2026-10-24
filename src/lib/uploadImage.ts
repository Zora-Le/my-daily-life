import { storage } from '@/lib/firebase';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';

const DATA_IMAGE_PREFIX = 'data:image/';
const STORAGE_URL_PATTERN =
  /^https:\/\/(?:firebasestorage\.googleapis\.com|storage\.googleapis\.com)\//;

function createImageId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function uploadImageToStorage(
  uid: string,
  dataUrl: string,
): Promise<string> {
  if (!dataUrl.startsWith(DATA_IMAGE_PREFIX)) {
    throw new Error('只能上传 base64 图片数据');
  }

  const response = await fetch(dataUrl);
  if (!response.ok) throw new Error('图片数据读取失败');

  const imageRef = ref(
    storage,
    `users/${uid}/images/${Date.now()}_${createImageId()}.jpg`,
  );
  await uploadBytes(imageRef, await response.blob(), {
    contentType: 'image/jpeg',
  });
  return getDownloadURL(imageRef);
}

export async function deleteImageFromStorage(url: string): Promise<void> {
  if (
    !url ||
    url.startsWith(DATA_IMAGE_PREFIX) ||
    (!url.startsWith('gs://') && !STORAGE_URL_PATTERN.test(url))
  )
    return;
  try {
    await deleteObject(ref(storage, url));
  } catch (error) {
    if ((error as { code?: string }).code === 'storage/object-not-found')
      return;
    throw error;
  }
}
