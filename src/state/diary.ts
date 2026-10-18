import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Diary, Meal, parseDiary, validateMeal } from '../domain/meals';

export const STORAGE_KEY = 'yacc.diary.v1';
type Storage = Pick<typeof AsyncStorage, 'getItem' | 'setItem'>;
type State = Diary & {
  ready: boolean;
  busy: boolean;
  storageError: string | null;
  hydrate: () => Promise<void>;
  saveMeal: (meal: Meal) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  setGoal: (goal: number) => Promise<void>;
};
export function createDiaryStore(storage: Storage) {
  let hydration: Promise<void> | undefined;
  return create<State>((set, get) => {
    const commit = async (change: Partial<Diary>) => {
      if (get().busy) throw new Error('Please wait for the current save to finish.');
      if (!get().ready || get().storageError)
        throw new Error('Storage is unavailable. Reload and try again.');
      const next: Diary = { version: 1, meals: get().meals, goal: get().goal, ...change };
      set({ busy: true });
      try {
        await storage.setItem(STORAGE_KEY, JSON.stringify(next));
        set(next);
      } catch {
        throw new Error(
          'Could not save on this device. Your changes are still here; please try again.',
        );
      } finally {
        set({ busy: false });
      }
    };
    return {
      version: 1,
      meals: [],
      goal: 2000,
      ready: false,
      busy: false,
      storageError: null,
      hydrate: () => {
        if (hydration) return hydration;
        hydration = (async () => {
          set({ ready: false });
          try {
            const raw = await storage.getItem(STORAGE_KEY);
            if (raw !== null) set(parseDiary(raw));
            set({ ready: true, storageError: null });
          } catch {
            set({
              ready: true,
              storageError:
                'Your saved diary could not be loaded. Existing data has not been overwritten. Please reload to retry.',
            });
          }
        })();
        return hydration;
      },
      saveMeal: async (meal) => {
        const error = validateMeal(meal);
        if (error) throw new Error(error);
        await commit({ meals: [...get().meals.filter((item) => item.id !== meal.id), meal] });
      },
      deleteMeal: (id) => commit({ meals: get().meals.filter((meal) => meal.id !== id) }),
      setGoal: (goal) => {
        if (!Number.isInteger(goal) || goal < 1 || goal > 10000)
          return Promise.reject(new Error('Enter a whole-number target between 1 and 10,000.'));
        return commit({ goal });
      },
    };
  });
}
export const useDiary = createDiaryStore(AsyncStorage);
