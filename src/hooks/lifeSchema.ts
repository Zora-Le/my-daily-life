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
  dietNote: string;
};
export type LifeTask = {
  id: number;
  title: string;
  start: string;
  end: string;
  done: Record<string, boolean>;
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
export type MonthlyMoney = {
  month: string;
  income: number;
  expense: number;
  budget?: number;
  largeExpense?: number;
};
export type AnnualMoneyEntry = {
  id: number;
  year: number;
  month: string;
  name: string;
  amountCents: number;
};
export type JournalEntry = { id: number; text: string; createdAt: string };
export type MenstrualRecord = {
  start: string;
  end: string;
  manualEnd?: boolean;
};
export type MoneyTransaction = {
  id: number;
  date: string;
  kind: 'income' | 'expense';
  amountCents: number;
  amount?: number;
  detail: string;
  expenseType?: 'daily' | 'special' | 'reimbursement';
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
  version: 3;
  days: Record<string, DayRecord>;
  tasks: LifeTask[];
  phases: Record<string, Phase>;
  menstrualRecords: MenstrualRecord[];
  books: ReadingItem[];
  notes: ReadingNote[];
  progressText: string;
  journals: JournalEntry[];
  savings: SavingsIsland[];
  monthlyMoney: MonthlyMoney[];
  moneyTransactions: MoneyTransaction[];
  incomeEntries: AnnualMoneyEntry[];
  largeExpenseEntries: AnnualMoneyEntry[];
  pendingExpenses: PendingExpense[];
  progressItems: ConfigItem[];
  habitItems: ConfigItem[];
  rewardTitle: string;
  rewardCopy: string;
  rewardCards: RewardCard[];
  drawHistory: { cardId: string; drawnAt: string }[];
};

export const STORAGE_KEY = 'my-daily-my-life:v3';
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
  dietNote: '',
});

export const initialState: LifeState = {
  version: 3,
  days: {},
  tasks: [],
  phases: {},
  menstrualRecords: [],
  books: [],
  notes: [],
  progressText: '',
  journals: [],
  savings: [],
  monthlyMoney: [],
  moneyTransactions: [],
  incomeEntries: [],
  largeExpenseEntries: [],
  pendingExpenses: [],
  progressItems: DEFAULT_PROGRESS_ITEMS,
  habitItems: DEFAULT_HABIT_ITEMS,
  rewardTitle: '',
  rewardCopy: '',
  rewardCards: [],
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

function normalizeDay(day?: Partial<DayRecord> | null): DayRecord {
  const base = emptyDay();
  const source = day && typeof day === 'object' ? day : {};
  const english = { ...base.english, ...(source.english ?? {}) };
  return {
    ...base,
    ...source,
    meals: {
      breakfast: normalizeMeal(source.meals?.breakfast),
      lunch: normalizeMeal(source.meals?.lunch),
      dinner: normalizeMeal(source.meals?.dinner),
    },
    exercise: { ...base.exercise, ...(source.exercise ?? {}) },
    english,
    progress: {
      'progress-listening': { planned: english.listening, completed: false },
      'progress-speaking': { planned: english.speaking, completed: false },
      ...(source.progress ?? {}),
    },
    habits: {
      'habit-cardio': Boolean(source.exercise?.cardio),
      'habit-strength': Boolean(source.exercise?.strength),
      ...(source.habits ?? {}),
    },
    dietNote: typeof source.dietNote === 'string' ? source.dietNote : '',
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
      ([key, item], index) =>
        normalizeSavingsItem(item, key, key || `储蓄岛 ${index + 1}`),
    );
  }
  return [];
}

type NormalizableLifeState = Partial<Omit<LifeState, 'version' | 'tasks'>> & {
  version?: unknown;
  tasks?: unknown;
  platformSavings?: unknown;
};

function normalizeTasks(rawTasks: unknown): LifeTask[] {
  if (!Array.isArray(rawTasks)) return [];
  return rawTasks
    .filter(task => task && typeof task === 'object')
    .map((task, index) => {
      const raw = task as Record<string, unknown>;
      const start = typeof raw.start === 'string' ? raw.start : '';
      const rawDone = raw.done;
      const done =
        rawDone && typeof rawDone === 'object' && !Array.isArray(rawDone)
          ? Object.fromEntries(
              Object.entries(rawDone).map(([date, value]) => [
                date,
                Boolean(value),
              ]),
            )
          : rawDone === true && start
            ? { [start]: true }
            : {};
      return {
        id: Number(raw.id) || index + 1,
        title: typeof raw.title === 'string' ? raw.title : '',
        start,
        end: typeof raw.end === 'string' ? raw.end : start,
        done,
        tone: raw.tone === 'rose' || raw.tone === 'yellow' ? raw.tone : 'blue',
      };
    });
}

export function normalizeRewardCards(
  rawCards: unknown,
  rawHistory: unknown,
): { cards: RewardCard[]; history: LifeState['drawHistory'] } {
  const source = Array.isArray(rawCards) ? rawCards : [];
  const history = Array.isArray(rawHistory)
    ? rawHistory
        .filter(
          item =>
            item &&
            typeof item === 'object' &&
            typeof (item as Record<string, unknown>).cardId === 'string' &&
            typeof (item as Record<string, unknown>).drawnAt === 'string',
        )
        .map(item => ({
          cardId: String((item as Record<string, unknown>).cardId),
          drawnAt: String((item as Record<string, unknown>).drawnAt),
        }))
    : [];
  const historyByCard = new Map(
    history.map(item => [item.cardId, item.drawnAt]),
  );
  const cards = source
    .filter(item => item && typeof item === 'object')
    .map((item, index): RewardCard => {
      const card = item as Record<string, unknown>;
      const id = String(card.id ?? '').trim() || `reward-${index + 1}`;
      const drawnAt =
        typeof card.drawnAt === 'string' && card.drawnAt
          ? card.drawnAt
          : historyByCard.get(id);
      return {
        id,
        kind: card.kind === 'joy' ? 'joy' : 'sweet',
        title: typeof card.title === 'string' ? card.title : '',
        copy: typeof card.copy === 'string' ? card.copy : '',
        ...(typeof card.image === 'string' && card.image
          ? { image: card.image }
          : {}),
        ...(drawnAt ? { drawnAt } : {}),
      };
    });
  const cardIds = new Set(cards.map(card => card.id));
  return {
    cards,
    history: history.filter(item => cardIds.has(item.cardId)),
  };
}

export function normalizeLifeState(parsed: NormalizableLifeState): LifeState {
  const rewards = normalizeRewardCards(parsed.rewardCards, parsed.drawHistory);
  const rawDays =
    parsed.days && typeof parsed.days === 'object' ? parsed.days : {};
  const days = Object.fromEntries(
    Object.entries(rawDays).map(([key, day]) => [key, normalizeDay(day)]),
  );
  const transactions = Array.isArray(parsed.moneyTransactions)
    ? parsed.moneyTransactions.map(item => ({
        ...item,
        amountCents: Number.isSafeInteger(item.amountCents)
          ? item.amountCents
          : Math.round(Number(item.amount || 0) * 100),
      }))
    : [];
  const monthlyMoney = Array.isArray(parsed.monthlyMoney)
    ? parsed.monthlyMoney
    : [];
  const normalizedEntries = (raw: unknown): AnnualMoneyEntry[] =>
    Array.isArray(raw)
      ? raw
          .filter(item => item && typeof item === 'object')
          .map((item, index) => {
            const entry = item as Partial<AnnualMoneyEntry>;
            return {
              id: Number(entry.id) || Date.now() + index,
              year: Number(entry.year) || new Date().getFullYear(),
              month: String(entry.month ?? ''),
              name: String(entry.name ?? ''),
              amountCents: Number(entry.amountCents) || 0,
            };
          })
      : [];
  const incomeEntries = normalizedEntries(parsed.incomeEntries);
  let largeExpenseEntries = normalizedEntries(parsed.largeExpenseEntries);
  if (!largeExpenseEntries.length) {
    largeExpenseEntries = monthlyMoney
      .filter(item => Number(item.largeExpense || 0) > 0)
      .map((item, index) => ({
        id: Date.now() + index,
        year: Number(item.month.slice(0, 4)),
        month: `${Number(item.month.slice(5))}月`,
        name: '大额支出',
        amountCents: Math.round(Number(item.largeExpense || 0) * 100),
      }));
  }
  return {
    version: 3,
    days,
    tasks: normalizeTasks(parsed.tasks),
    phases:
      parsed.phases && typeof parsed.phases === 'object' ? parsed.phases : {},
    menstrualRecords: Array.isArray(parsed.menstrualRecords)
      ? parsed.menstrualRecords
          .filter(item => item && typeof item.start === 'string')
          .map(item => ({
            start: item.start,
            end: typeof item.end === 'string' ? item.end : item.start,
            ...(item.manualEnd ? { manualEnd: true } : {}),
          }))
      : [],
    books: Array.isArray(parsed.books) ? parsed.books : [],
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    progressText:
      typeof parsed.progressText === 'string' ? parsed.progressText : '',
    journals: Array.isArray(parsed.journals) ? parsed.journals : [],
    savings: normalizeSavings(parsed.savings, parsed.platformSavings),
    monthlyMoney,
    moneyTransactions: transactions,
    incomeEntries,
    largeExpenseEntries,
    pendingExpenses: Array.isArray(parsed.pendingExpenses)
      ? parsed.pendingExpenses
      : [],
    progressItems: Array.isArray(parsed.progressItems)
      ? parsed.progressItems
      : DEFAULT_PROGRESS_ITEMS,
    habitItems: Array.isArray(parsed.habitItems)
      ? parsed.habitItems
      : DEFAULT_HABIT_ITEMS,
    rewardTitle:
      typeof parsed.rewardTitle === 'string' ? parsed.rewardTitle : '',
    rewardCopy: typeof parsed.rewardCopy === 'string' ? parsed.rewardCopy : '',
    rewardCards: rewards.cards,
    drawHistory: rewards.history,
  };
}
