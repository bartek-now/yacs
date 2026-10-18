import { expect, Page, test } from '@playwright/test';
import path from 'node:path';
async function fillMeal(page: Page, name = 'Eggs on toast') {
  await page.getByLabel('Meal name', { exact: true }).fill(name);
  for (const [label, value] of [
    ['Calories (kcal)', '400'],
    ['Protein (g)', '25'],
    ['Carbs (g)', '40'],
    ['Fat (g)', '15'],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
}
test('add, scale, persist, edit, and delete a meal', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByTestId('daily-calories')).toHaveText('0');
  await page.getByRole('button', { name: 'Add a meal' }).click();
  await page.getByRole('button', { name: 'Save meal', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Give your meal a name');
  await fillMeal(page);
  await page.getByLabel('Portion multiplier', { exact: true }).fill('0.5');
  await page.getByRole('button', { name: 'Apply portion multiplier' }).click();
  await expect(page.getByLabel('Calories (kcal)', { exact: true })).toHaveValue('200');
  await page.getByRole('button', { name: 'Save meal', exact: true }).click();
  await expect(page.getByTestId('daily-calories')).toHaveText('200');
  await page.reload();
  await expect(page.getByTestId('daily-protein')).toHaveText('12.5 g');
  await page.getByRole('button', { name: 'Edit Eggs on toast' }).click();
  await page.getByLabel('Calories (kcal)', { exact: true }).fill('250');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByTestId('daily-calories')).toHaveText('250');
  await page.getByRole('button', { name: 'Edit Eggs on toast' }).click();
  await page.getByRole('button', { name: 'Delete meal', exact: true }).click();
  await page.getByRole('button', { name: 'Keep editing' }).click();
  await expect(page.getByLabel('Meal name', { exact: true })).toHaveValue('Eggs on toast');
  await page.getByRole('button', { name: 'Delete meal', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm delete' }).click();
  await expect(page.getByTestId('daily-calories')).toHaveText('0');
  expect(errors).toEqual([]);
});
test('photo selection and explicit demo estimate', async ({ page }) => {
  await page.goto('/meal');
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Choose a photo', exact: true }).click();
  await (await chooser).setFiles(path.resolve('public/icons/icon-192.png'));
  await expect(page.getByRole('img', { name: 'Selected meal photo' })).toBeVisible();
  await page.getByRole('button', { name: 'Use sample estimate' }).click();
  await expect(page.getByText(/Sample values only/)).toBeVisible();
  await expect(page.getByLabel('Calories (kcal)', { exact: true })).toHaveValue('520');
  await page.getByRole('button', { name: 'Save meal', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Edit Demo meal' })).toContainText('DEMO');
});
test('cancel asks before discarding an edited draft', async ({ page }) => {
  await page.goto('/meal');
  await fillMeal(page);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Keep editing' }).click();
  await expect(page.getByLabel('Meal name', { exact: true })).toHaveValue('Eggs on toast');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Discard changes' }).click();
  await expect(page.getByTestId('daily-calories')).toHaveText('0');
  await expect(page.getByRole('button', { name: 'Edit Eggs on toast' })).toHaveCount(0);
});
test('historical meals do not affect today and target survives reload', async ({ page }) => {
  await page.goto('/meal');
  await fillMeal(page, 'Yesterday’s lunch');
  await page.getByLabel('Date (YYYY-MM-DD)', { exact: true }).fill('2020-02-30');
  await page.getByRole('button', { name: 'Save meal', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('valid date');
  await page.getByLabel('Date (YYYY-MM-DD)', { exact: true }).fill('2020-02-20');
  await page.getByRole('button', { name: 'Save meal', exact: true }).click();
  await expect(page.getByTestId('daily-calories')).toHaveText('0');
  await page.goto('/history');
  await expect(page.getByRole('button', { name: 'Edit Yesterday’s lunch' })).toBeVisible();
  await page.goto('/settings');
  await page.getByLabel('Daily target (kcal)', { exact: true }).fill('2400');
  await page.getByRole('button', { name: 'Save target' }).click();
  await expect(page.getByText('Target saved.')).toBeVisible();
  await page.goto('/');
  await expect(page.getByText('/ 2,400 kcal', { exact: true })).toBeVisible();
});
test('storage failure retains the editor and corrupt data is not overwritten', async ({ page }) => {
  await page.goto('/meal');
  await fillMeal(page);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error('quota');
    };
  });
  await page.getByRole('button', { name: 'Save meal', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Could not save');
  await expect(page.getByLabel('Meal name', { exact: true })).toHaveValue('Eggs on toast');
  await page.reload();
  await page.evaluate(() => localStorage.setItem('yacc.diary.v1', '{broken'));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Existing data has not been overwritten');
  expect(await page.evaluate(() => localStorage.getItem('yacc.diary.v1'))).toBe('{broken');
});
test('installed service worker supports offline reload and manual logging', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
          once: true,
        }),
      );
  });
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: 'Add a meal' }).click();
  await fillMeal(page, 'Offline lunch');
  await page.getByRole('button', { name: 'Save meal', exact: true }).click();
  await expect(page.getByTestId('daily-calories')).toHaveText('400');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Edit Offline lunch' })).toBeVisible();
});
test('phone and desktop layouts fit without horizontal overflow', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByText('A fresh start.')).toBeVisible();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-today.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/meal');
  await expect(page.getByLabel('Meal name', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-editor.png`, fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-desktop.png`, fullPage: true });
});
