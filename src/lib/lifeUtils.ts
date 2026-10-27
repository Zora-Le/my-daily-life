export const toIso = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const TODAY = toIso(new Date());

export const fromIso = (iso: string) => new Date(`${iso}T12:00:00`);

export const addDays = (iso: string, amount: number) => {
  const date = fromIso(iso);
  date.setDate(date.getDate() + amount);
  return toIso(date);
};

export const weekStart = (iso: string) => {
  const date = fromIso(iso);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return toIso(date);
};

export const formatShort = (iso: string) => {
  const date = fromIso(iso);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

export const formatLong = (iso: string) => {
  const date = fromIso(iso);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
};

export function safeCalculate(raw: string): number {
  const source = raw.trim().replace(/^=/, '');
  if (!source || !/^[\d.+\-*/()\s]+$/.test(source))
    throw new Error('仅支持数字与四则运算');
  const tokens = source.match(/\d+(?:\.\d+)?|[()+\-*/]/g) ?? [];
  const compact = source.replace(/\s/g, '');
  if (tokens.join('') !== compact) throw new Error('表达式包含无效字符');
  let index = 0;
  const expression = (): number => {
    let value = term();
    while (tokens[index] === '+' || tokens[index] === '-') {
      const op = tokens[index++];
      const right = term();
      value = op === '+' ? value + right : value - right;
    }
    return value;
  };
  const term = (): number => {
    let value = factor();
    while (tokens[index] === '*' || tokens[index] === '/') {
      const op = tokens[index++];
      const right = factor();
      if (op === '/' && right === 0) throw new Error('不能除以 0');
      value = op === '*' ? value * right : value / right;
    }
    return value;
  };
  const factor = (): number => {
    const token = tokens[index++];
    if (token === '+' || token === '-')
      return (token === '-' ? -1 : 1) * factor();
    if (token === '(') {
      const value = expression();
      if (tokens[index++] !== ')') throw new Error('括号不完整');
      return value;
    }
    const value = Number(token);
    if (!Number.isFinite(value)) throw new Error('数字格式不正确');
    return value;
  };
  const result = expression();
  if (index !== tokens.length || !Number.isFinite(result))
    throw new Error('表达式不完整');
  return Math.round(result * 100) / 100;
}

export async function compressImage(file: File, maxSize = 800, quality = 0.5) {
  if (!file.type.startsWith('image/')) throw new Error('请选择图片文件');
  if (file.size > 12 * 1024 * 1024) throw new Error('图片请小于 12MB');
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = source;
  });
  const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * ratio));
  canvas.height = Math.max(1, Math.round(image.height * ratio));
  canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}