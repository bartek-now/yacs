export type Nutrition = { calories: number; protein: number; carbs: number; fat: number };
export const nutritionKeys = ['calories', 'protein', 'carbs', 'fat'] as const;
export const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;
export type Meal = Nutrition & {
  id: string;
  name: string;
  date: string;
  createdAt: string;
  category: (typeof categories)[number];
  source: 'manual' | 'demo';
  notes: string;
};
export type Diary = { version: 1; meals: Meal[]; goal: number };
export const emptyNutrition: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && localDate(date) === value;
}
export function totals(meals: Nutrition[]): Nutrition {
  const result = { ...emptyNutrition };
  for (const meal of meals) for (const key of nutritionKeys) result[key] += meal[key];
  for (const key of nutritionKeys) result[key] = Math.round(result[key] * 10) / 10;
  return result;
}
export function scaleNutrition(values: Nutrition, multiplier: number): Nutrition {
  if (!Number.isFinite(multiplier) || multiplier <= 0)
    throw new Error('Portion must be greater than zero.');
  return Object.fromEntries(
    nutritionKeys.map((key) => [key, Math.round(values[key] * multiplier * 10) / 10]),
  ) as Nutrition;
}
export function validateMeal(meal: Omit<Meal, 'id' | 'createdAt'>): string | null {
  if (typeof meal.name !== 'string' || !meal.name.trim()) return 'Give your meal a name.';
  if (meal.name.length > 120) return 'Keep the meal name under 120 characters.';
  if (typeof meal.notes !== 'string' || meal.notes.length > 1000)
    return 'Keep notes under 1,000 characters.';
  if (!categories.includes(meal.category)) return 'Choose a meal category.';
  if (!validDate(meal.date)) return 'Use a valid date in YYYY-MM-DD format.';
  if (meal.source !== 'manual' && meal.source !== 'demo') return 'Invalid meal source.';
  for (const key of nutritionKeys) {
    if (!Number.isFinite(meal[key]) || meal[key] < 0 || meal[key] > 100000)
      return 'Enter nutrition values between 0 and 100,000.';
  }
  return null;
}
export function parseDiary(raw: string): Diary {
  const value = JSON.parse(raw);
  if (
    value?.version !== 1 ||
    !Array.isArray(value.meals) ||
    !Number.isInteger(value.goal) ||
    value.goal < 1 ||
    value.goal > 10000
  )
    throw new Error('Invalid saved diary.');
  const ids = new Set<string>();
  for (const meal of value.meals) {
    if (
      !meal ||
      typeof meal.id !== 'string' ||
      !meal.id ||
      typeof meal.createdAt !== 'string' ||
      !Number.isFinite(Date.parse(meal.createdAt)) ||
      validateMeal(meal) ||
      ids.has(meal.id)
    )
      throw new Error('Invalid saved meal.');
    ids.add(meal.id);
  }
  return { version: 1, meals: value.meals, goal: value.goal };
}
