import { firestore } from '@/lib/firebase';
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
  type DayRecord,
  type LifeState,
  STORAGE_KEY,
  emptyDay,
  initialState,
  normalizeLifeState,
} from './lifeSchema';

export * from './lifeSchema';

type StorageReader = Pick<Storage, 'getItem'>;

export function loadLifeState(storage?: StorageReader): LifeState {
  const reader =
    storage ??
    (typeof window === 'undefined' ? undefined : window.localStorage);
  if (!reader) return initialState;
  try {
    const parsed = JSON.parse(reader.getItem(STORAGE_KEY) || 'null');
    return parsed?.version === 3 ? normalizeLifeState(parsed) : initialState;
  } catch {
    return initialState;
  }
}

export function useLifeStore(uid: string) {
  const [state, setState] = useState<LifeState>(loadLifeState);
  const [cloudReady, setCloudReady] = useState(false);
  const applyingRemote = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      console.warn('本地空间已满，请前往设置导出备份');
    }
  }, [state]);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    const cloudDocument = doc(firestore, 'users', uid, 'appData', 'lifeState');

    const connect = async () => {
      try {
        const snapshot = await getDoc(cloudDocument);
        if (!active) return;
        if (snapshot.exists()) {
          const migrationKey = `${STORAGE_KEY}:migrated:${uid}`;
          const hasLegacyLocalData =
            JSON.stringify(stateRef.current) !== JSON.stringify(initialState);
          if (!localStorage.getItem(migrationKey) && hasLegacyLocalData) {
            await setDoc(cloudDocument, {
              state: stateRef.current,
              schemaVersion: 3,
              updatedAt: serverTimestamp(),
            });
            localStorage.setItem(migrationKey, '1');
          } else {
            const remote = snapshot.data().state;
            if (remote?.version === 3) {
              applyingRemote.current = true;
              setState(normalizeLifeState(remote));
            }
            localStorage.setItem(migrationKey, '1');
          }
        } else {
          await setDoc(cloudDocument, {
            state: stateRef.current,
            schemaVersion: 3,
            updatedAt: serverTimestamp(),
          });
          localStorage.setItem(`${STORAGE_KEY}:migrated:${uid}`, '1');
        }
      } catch {
        // Firestore persistence keeps local writes queued until connectivity returns.
      } finally {
        if (active) setCloudReady(true);
      }

      unsubscribe = onSnapshot(
        cloudDocument,
        { includeMetadataChanges: true },
        snapshot => {
          if (
            !active ||
            !snapshot.exists() ||
            snapshot.metadata.hasPendingWrites
          )
            return;
          const remote = snapshot.data().state;
          if (!remote || remote.version !== 3) return;
          const normalized = normalizeLifeState(remote);
          if (JSON.stringify(normalized) === JSON.stringify(stateRef.current))
            return;
          applyingRemote.current = true;
          setState(normalized);
        },
        () => {
          // Offline and transient errors are handled by the local Firestore cache.
        },
      );
    };

    void connect();
    return () => {
      active = false;
      unsubscribe();
    };
  }, [uid]);

  useEffect(() => {
    if (!cloudReady) return;
    if (applyingRemote.current) {
      applyingRemote.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      const cloudDocument = doc(
        firestore,
        'users',
        uid,
        'appData',
        'lifeState',
      );
      void setDoc(cloudDocument, {
        state,
        schemaVersion: 3,
        updatedAt: serverTimestamp(),
      });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [cloudReady, state, uid]);

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
    if (parsed?.version !== 3) throw new Error('备份版本不兼容');
    setState(normalizeLifeState(parsed));
  };
  return {
    state,
    update,
    updateDay,
    importState,
    storageKey: STORAGE_KEY,
    cloudReady,
  };
}
