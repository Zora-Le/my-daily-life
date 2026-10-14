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

type SolarTerm = { name: string; month: number; c20: number; c21: number };
const SOLAR_TERMS: SolarTerm[] = [
  { name: '小寒', month: 1, c20: 6.11, c21: 5.4055 },
  { name: '大寒', month: 1, c20: 20.84, c21: 20.12 },
  { name: '立春', month: 2, c20: 4.6295, c21: 3.87 },
  { name: '雨水', month: 2, c20: 19.4599, c21: 18.73 },
  { name: '惊蛰', month: 3, c20: 6.3826, c21: 5.63 },
  { name: '春分', month: 3, c20: 21.4155, c21: 20.646 },
  { name: '清明', month: 4, c20: 5.59, c21: 4.81 },
  { name: '谷雨', month: 4, c20: 20.888, c21: 20.1 },
  { name: '立夏', month: 5, c20: 6.318, c21: 5.52 },
  { name: '小满', month: 5, c20: 21.86, c21: 21.04 },
  { name: '芒种', month: 6, c20: 6.5, c21: 5.678 },
  { name: '夏至', month: 6, c20: 22.2, c21: 21.37 },
  { name: '小暑', month: 7, c20: 7.928, c21: 7.108 },
  { name: '大暑', month: 7, c20: 23.65, c21: 22.83 },
  { name: '立秋', month: 8, c20: 8.35, c21: 7.5 },
  { name: '处暑', month: 8, c20: 23.95, c21: 23.13 },
  { name: '白露', month: 9, c20: 8.44, c21: 7.646 },
  { name: '秋分', month: 9, c20: 23.822, c21: 23.042 },
  { name: '寒露', month: 10, c20: 9.098, c21: 8.318 },
  { name: '霜降', month: 10, c20: 24.218, c21: 23.438 },
  { name: '立冬', month: 11, c20: 8.218, c21: 7.438 },
  { name: '小雪', month: 11, c20: 23.08, c21: 22.36 },
  { name: '大雪', month: 12, c20: 7.9, c21: 7.18 },
  { name: '冬至', month: 12, c20: 22.6, c21: 21.94 },
];

export function solarTermForDate(iso: string) {
  const date = fromIso(iso);
  const year = date.getFullYear();
  if (year < 1901 || year > 2100) return '';
  const shortYear = year % 100;
  const century = year >= 2001 ? 21 : 20;
  const term = SOLAR_TERMS.find(item => {
    if (item.month !== date.getMonth() + 1) return false;
    const constant = century === 21 ? item.c21 : item.c20;
    const leapBase = item.month < 3 ? shortYear - 1 : shortYear;
    const day =
      Math.floor(shortYear * 0.2422 + constant) - Math.floor(leapBase / 4);
    return day === date.getDate();
  });
  return term?.name ?? '';
}

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

export async function compressImage(file: File, maxSize = 900, quality = 0.72) {
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
