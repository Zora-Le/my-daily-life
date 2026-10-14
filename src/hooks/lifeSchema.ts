import type { Phase } from '@/components/life/LineArt';

export type Meal = { text: string; image?: string; images: string[] };
export type ProgressRecord = { planned: number; completed: boolean };
export type ConfigItem = {
  id: string;
  name: string;
  iconId: string;
  unit: string;
  archivedAt?: string;
  tone?: 'sage' | 'rose' | 'ochre' | 'slate';
};
export type EnglishRecord = {
  listening: number;
  speaking: number;
  work?: number;
  daily?: number;
};
export type DayRecord = {
  meals: Record<'breakfast' | 'lunch' | 'dinner', Meal>;
  exercise: { cardio: boolean; strength: boolean };
  english: EnglishRecord;
  progress: Record<string, ProgressRecord>;
  habits: Record<string, boolean>;
  mood?: string;
  moodFactor?: string;
  weight?: string;
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
  amountCents: number;
  amount?: number;
  detail: string;
};
export type PendingExpense = {
  id: number;
  name: string;
  amountCents: number;
};
export type SavingsIsland = {
  id: string;
  displayName: string;
  detail: string;
  expression: string;
  value: number;
  updatedAt?: string;
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
  savings: SavingsIsland[];
  monthlyMoney: MonthlyMoney[];
  moneyTransactions: MoneyTransaction[];
  pendingExpenses: PendingExpense[];
  progressItems: ConfigItem[];
  habitItems: ConfigItem[];
  rewardTitle: string;
  rewardCopy: string;
  rewardCards: RewardCard[];
  drawHistory: { cardId: string; drawnAt: string }[];
};

export const STORAGE_KEY = 'my-daily-my-life:v2';
export const DEFAULT_PROGRESS_ITEMS: ConfigItem[] = [
  {
    id: 'progress-listening',
    name: '听力',
    iconId: 'headphones',
    unit: '分钟',
    tone: 'sage',
  },
  {
    id: 'progress-speaking',
    name: '口语',
    iconId: 'mic',
    unit: '分钟',
    tone: 'rose',
  },
];
export const DEFAULT_HABIT_ITEMS: ConfigItem[] = [
  {
    id: 'habit-cardio',
    name: '有氧',
    iconId: 'bike',
    unit: '次',
    tone: 'sage',
  },
  {
    id: 'habit-strength',
    name: '力量',
    iconId: 'dumbbell',
    unit: '次',
    tone: 'ochre',
  },
];

const emptyMeal = (): Meal => ({ text: '', images: [] });
export const emptyDay = (): DayRecord => ({
  meals: { breakfast: emptyMeal(), lunch: emptyMeal(), dinner: emptyMeal() },
  exercise: { cardio: false, strength: false },
  english: { listening: 10, speaking: 20 },
  progress: {
    'progress-listening': { planned: 10, completed: false },
    'progress-speaking': { planned: 20, completed: false },
  },
  habits: { 'habit-cardio': false, 'habit-strength': false },
});

export const DEFAULT_SAVINGS_ISLANDS: SavingsIsland[] = [
  {
    id: 'cash',
    displayName: '日常账户',
    detail: '零钱通 · E卡通 · 现金',
    expression: '=18620',
    value: 18620,
  },
  {
    id: 'bank',
    displayName: '银行卡',
    detail: '工商 · 中国 · 招商',
    expression: '=53800',
    value: 53800,
  },
  {
    id: 'ali',
    displayName: '支付宝',
    detail: '支付宝',
    expression: '=9460',
    value: 9460,
  },
];

export const initialState: LifeState = {
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
  notes: [],
  progressText: '把今天学到的一点点，慢慢积成自己的光。',
  journals: [],
  savings: DEFAULT_SAVINGS_ISLANDS,
  monthlyMoney: [],
  moneyTransactions: [],
  pendingExpenses: [],
  progressItems: DEFAULT_PROGRESS_ITEMS,
  habitItems: DEFAULT_HABIT_ITEMS,
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

function normalizeMeal(meal?: Partial<Meal>): Meal {
  const legacy = typeof meal?.image === 'string' ? [meal.image] : [];
  return {
    text: typeof meal?.text === 'string' ? meal.text : '',
    image: meal?.image,
    images: Array.isArray(meal?.images) ? meal.images.filter(Boolean) : legacy,
  };
}

function normalizeDay(day: Partial<DayRecord>): DayRecord {
  const base = emptyDay();
  const english = { ...base.english, ...(day.english ?? {}) };
  return {
    ...base,
    ...day,
    meals: {
      breakfast: normalizeMeal(day.meals?.breakfast),
      lunch: normalizeMeal(day.meals?.lunch),
      dinner: normalizeMeal(day.meals?.dinner),
    },
    exercise: { ...base.exercise, ...(day.exercise ?? {}) },
    english,
    progress: {
      'progress-listening': { planned: english.listening, completed: false },
      'progress-speaking': { planned: english.speaking, completed: false },
      ...(day.progress ?? {}),
    },
    habits: {
      'habit-cardio': Boolean(day.exercise?.cardio),
      'habit-strength': Boolean(day.exercise?.strength),
      ...(day.habits ?? {}),
    },
  };
}

function savingsId(value: unknown, index: number) {
  const id = String(value ?? '').trim();
  return id || `island-${index + 1}`;
}

function normalizeSavingsItem(
  raw: unknown,
  id: string,
  fallbackName: string,
): SavingsIsland {
  const item =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const numericRaw = typeof raw === 'number' ? raw : undefined;
  const expressionValue =
    item.expression ??
    item.formula ??
    item.input ??
    (typeof raw === 'string' ? raw : undefined);
  const expressionNumber =
    typeof expressionValue === 'string' &&
    /^=?\d+(?:\.\d+)?$/.test(expressionValue)
      ? Number(expressionValue.replace(/^=/, ''))
      : undefined;
  const value = Number(
    item.value ??
      item.amount ??
      item.total ??
      numericRaw ??
      expressionNumber ??
      0,
  );
  return {
    id,
    displayName: String(
      item.displayName ?? item.name ?? item.title ?? fallbackName,
    ),
    detail: String(item.detail ?? item.description ?? ''),
    expression:
      typeof expressionValue === 'string'
        ? expressionValue
        : `=${Number.isFinite(value) ? value : 0}`,
    value: Number.isFinite(value) ? value : 0,
    ...(typeof item.updatedAt === 'string'
      ? { updatedAt: item.updatedAt }
      : {}),
  };
}

export function normalizeSavings(
  savings: unknown,
  platformSavings?: unknown,
): SavingsIsland[] {
  if (Array.isArray(savings)) {
    return savings.map((item, index) => {
      const raw =
        item && typeof item === 'object'
          ? (item as Record<string, unknown>)
          : {};
      return normalizeSavingsItem(
        item,
        savingsId(raw.id, index),
        `储蓄岛 ${index + 1}`,
      );
    });
  }
  const legacyObject =
    platformSavings && typeof platformSavings === 'object'
      ? platformSavings
      : savings && typeof savings === 'object'
        ? savings
        : null;
  if (legacyObject) {
    return Object.entries(legacyObject as Record<string, unknown>).map(
      ([key, item], index) => {
        const fallback = DEFAULT_SAVINGS_ISLANDS.find(
          value => value.id === key,
        );
        const normalized = normalizeSavingsItem(
          item,
          key,
          fallback?.displayName ?? key ?? `储蓄岛 ${index + 1}`,
        );
        return normalized.detail || !fallback
          ? normalized
          : { ...normalized, detail: fallback.detail };
      },
    );
  }
  return DEFAULT_SAVINGS_ISLANDS.map(item => ({ ...item }));
}

type LegacyLifeState = Partial<LifeState> & { platformSavings?: unknown };

export function normalizeLifeState(parsed: LegacyLifeState): LifeState {
  const days = Object.fromEntries(
    Object.entries(parsed.days ?? {}).map(([key, day]) => [
      key,
      normalizeDay(day),
    ]),
  );
  const transactions = Array.isArray(parsed.moneyTransactions)
    ? parsed.moneyTransactions.map(item => ({
        ...item,
        amountCents: Number.isSafeInteger(item.amountCents)
          ? item.amountCents
          : Math.round(Number(item.amount || 0) * 100),
      }))
    : [];
  return {
    ...initialState,
    ...parsed,
    version: 2,
    days,
    journals: Array.isArray(parsed.journals) ? parsed.journals : [],
    savings: normalizeSavings(parsed.savings, parsed.platformSavings),
    monthlyMoney: Array.isArray(parsed.monthlyMoney) ? parsed.monthlyMoney : [],
    moneyTransactions: transactions,
    pendingExpenses: Array.isArray(parsed.pendingExpenses)
      ? parsed.pendingExpenses
      : [],
    progressItems: Array.isArray(parsed.progressItems)
      ? parsed.progressItems
      : DEFAULT_PROGRESS_ITEMS,
    habitItems: Array.isArray(parsed.habitItems)
      ? parsed.habitItems
      : DEFAULT_HABIT_ITEMS,
  };
}
