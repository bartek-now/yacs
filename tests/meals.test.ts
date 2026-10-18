import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  localDate,
  Meal,
  parseDiary,
  scaleNutrition,
  totals,
  validateMeal,
  validDate,
} from '../src/domain/meals';
const meal: Meal = {
  id: 'one',
  name: 'Lunch',
  date: '2026-10-17',
  createdAt: '2026-10-17T12:00:00Z',
  category: 'Lunch',
  source: 'manual',
  notes: '',
  calories: 500,
  protein: 30,
  carbs: 50,
  fat: 20,
};
test('totals and portion scaling retain decimal grams', () => {
  assert.deepEqual(scaleNutrition(meal, 0.5), { calories: 250, protein: 15, carbs: 25, fat: 10 });
  assert.equal(
    totals([
      { ...meal, protein: 0.1 },
      { ...meal, protein: 0.2 },
    ]).protein,
    0.3,
  );
  assert.throws(() => scaleNutrition(meal, -1));
  assert.throws(() => scaleNutrition(meal, NaN));
});
test('dates use the local calendar and reject nonexistent days', () => {
  assert.equal(localDate(new Date(2026, 9, 17, 23, 59)), '2026-10-17');
  assert.equal(validDate('2026-02-30'), false);
  assert.equal(validDate('2028-02-29'), true);
});
test('nutrition must be finite and nonnegative; zero is allowed', () => {
  assert.equal(validateMeal({ ...meal, calories: 0 }), null);
  for (const calories of [-1, Infinity, NaN, 100001])
    assert.ok(validateMeal({ ...meal, calories }));
  assert.ok(validateMeal({ ...meal, name: '  ' }));
});
test('persistence rejects corrupt data and duplicate IDs', () => {
  const saved = { version: 1, goal: 2000, meals: [meal] };
  assert.deepEqual(parseDiary(JSON.stringify(saved)), saved);
  assert.throws(() => parseDiary('bad json'));
  assert.throws(() => parseDiary(JSON.stringify({ ...saved, meals: [meal, meal] })));
  assert.throws(() =>
    parseDiary(JSON.stringify({ ...saved, meals: [{ ...meal, protein: null }] })),
  );
  assert.throws(() => parseDiary(JSON.stringify({ ...saved, version: 2 })));
});
