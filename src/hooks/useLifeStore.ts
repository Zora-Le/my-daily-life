import type { Phase } from '@/components/life/LineArt';
import { useEffect, useState } from 'react';

export type Meal = { text: string; image?: string };
export type EnglishRecord = {
  listening: number;
  speaking: number;
  work?: number;
  daily?: number;
};
export type DayRecord = {
  meals: Record<'breakfast' | 'lunch' | 'dinner', Meal>;
  exercise: { cardio: boolean; strength: boolean };
  mood?: string;
  moodFactor?: string;
  weight?: string;
  english: EnglishRecord;
};
export type LifeTask = {
  id: number;
  title: string;
  start: string;
  end: string;
  done: boolean;
  tone: 'rose' | 'blue' | 'yellow';
};
export type ReadingItem = {
  id: number;
  title: string;
  shelf: 1 | 2;
  createdAt: string;
  finishedAt?: string;
};
export type ReadingNote = {
  id: number;
  title: string;
  text: string;
  images?: string[];
  createdAt: string;
};
export type RewardCard = {
  id: string;
  kind: 'sweet' | 'joy';
  title: string;
  copy: string;
  image?: string;
  drawnAt?: string;
};
export type MonthlyMoney = { month: string; income: number; expense: number };
export type JournalEntry = { id: number; text: string; createdAt: string };
export type MoneyTransaction = {
  id: number;
  date: string;
  kind: 'income' | 'expense';
  amount: number;
  detail: string;
};
export type LifeState = {
  version: 2;
  days: Record<string, DayRecord>;
  tasks: LifeTask[];
  phases: Record<string, Phase>;
  books: ReadingItem[];
  notes: ReadingNote[];
  progressText: string;
  journals: JournalEntry[];
  savings: {
    id: string;
    name: string;
    detail: string;
    expression: string;
    value: number;
  }[];
  monthlyMoney: MonthlyMoney[];
  moneyTransactions: MoneyTransaction[];
  rewardTitle: string;
  rewardCopy: string;
  rewardCards: RewardCard[];
  drawHistory: { cardId: string; drawnAt: string }[];
};

const KEY = 'my-daily-my-life:v2';
export const emptyDay = (): DayRecord => ({
  meals: { breakfast: { text: '' }, lunch: { text: '' }, dinner: { text: '' } },
  exercise: { cardio: false, strength: false },
  english: { listening: 10, speaking: 20 },
});
const initialState: LifeState = {
  version: 2,
  days: {},
  tasks: [],
  phases: {},
  books: [
    { id: 1, title: '《悉达多》', shelf: 1, createdAt: '2026-10-12' },
    {
      id: 2,
      title: '设计心理学 · 论文笔记',
      shelf: 2,
      createdAt: '2026-10-13',
    },
  ],
  notes: [
    {
      id: 1,
      title: '《山茶文具店》',
      text: '把心意放进每一个字里。',
      images: [],
      createdAt: '2026-10-12',
    },
    {
      id: 2,
      title: '《日日是好日》',
      text: '雨天，就听雨。',
      images: [],
      createdAt: '2026-10-13',
    },
  ],
  progressText: '把今天学到的一点点，慢慢积成自己的光。',
  journals: [],
  savings: [
    {
      id: 'cash',
      name: '日常账户',
      detail: '零钱通 · E卡通 · 现金',
      expression: '=18620',
      value: 18620,
    },
    {
      id: 'bank',
      name: '银行卡',
      detail: '工商 · 中国 · 招商',
      expression: '=53800',
      value: 53800,
    },
    {
      id: 'ali',
      name: '支付宝',
      detail: '支付宝',
      expression: '=9460',
      value: 9460,
    },
  ],
  monthlyMoney: [
    { month: '5月', income: 15200, expense: 9100 },
    { month: '6月', income: 16800, expense: 10600 },
    { month: '7月', income: 16100, expense: 8800 },
    { month: '8月', income: 18400, expense: 11200 },
    { month: '9月', income: 17600, expense: 9400 },
    { month: '10月', income: 19300, expense: 9800 },
  ],
  moneyTransactions: [],
  rewardTitle: 'A SMALL REWARD',
  rewardCopy: '认真生活，也给自己一份奖励。',
  rewardCards: [
    { id: 's1', kind: 'sweet', title: '黄昏散步', copy: '风把今天吹得很轻。' },
    {
      id: 's2',
      kind: 'sweet',
      title: '窗边早餐',
      copy: '好好吃饭，是给自己的拥抱。',
    },
    { id: 'j1', kind: 'joy', title: '吹一吹晚风', copy: '把疲惫交给风。' },
    { id: 'j2', kind: 'joy', title: '看看小猫咪', copy: '允许自己停一会儿。' },
  ],
  drawHistory: [],
};

function normalize(parsed: Partial<LifeState>): LifeState {
  const days = Object.fromEntries(
    Object.entries(parsed.days ?? {}).map(([key, day]) => [
      key,
      {
        ...emptyDay(),
        ...day,
        meals: { ...emptyDay().meals, ...day.meals },
        exercise: { ...emptyDay().exercise, ...day.exercise },
        english: { ...emptyDay().english, ...day.english },
      },
    ]),
  );
  return {
    ...initialState,
    ...parsed,
    version: 2,
    days,
    journals: Array.isArray(parsed.journals) ? parsed.journals : [],
    moneyTransactions: Array.isArray(parsed.moneyTransactions)
      ? parsed.moneyTransactions
      : [],
    monthlyMoney: parsed.monthlyMoney?.length
      ? parsed.monthlyMoney
      : initialState.monthlyMoney,
  };
}
function load(): LifeState {
  if (typeof window === 'undefined') return initialState;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || 'null');
    return parsed?.version === 2 ? normalize(parsed) : initialState;
  } catch {
    return initialState;
  }
}

export function useLifeStore() {
  const [state, setState] = useState<LifeState>(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      console.warn('本地空间已满，请前往设置导出备份');
    }
  }, [state]);
  const update = (recipe: (current: LifeState) => LifeState) =>
    setState(current => recipe(current));
  const updateDay = (date: string, recipe: (day: DayRecord) => DayRecord) =>
    update(current => ({
      ...current,
      days: {
        ...current.days,
        [date]: recipe(current.days[date] ?? emptyDay()),
      },
    }));
  const importState = (raw: string) => {
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 2) throw new Error('备份版本不兼容');
    setState(normalize(parsed));
  };
  return { state, update, updateDay, importState, storageKey: KEY };
}
