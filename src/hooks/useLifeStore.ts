import { useEffect, useState } from 'react';
import {
  type DayRecord,
  type LifeState,
  STORAGE_KEY,
  emptyDay,
  initialState,
  normalizeLifeState,
} from './lifeSchema';

export * from './lifeSchema';

function load(): LifeState {
  if (typeof window === 'undefined') return initialState;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return parsed?.version === 2 ? normalizeLifeState(parsed) : initialState;
  } catch {
    return initialState;
  }
}

export function useLifeStore() {
  const [state, setState] = useState<LifeState>(load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
    setState(normalizeLifeState(parsed));
  };
  return { state, update, updateDay, importState, storageKey: STORAGE_KEY };
}
