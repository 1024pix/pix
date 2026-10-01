import { AxeBuilder } from '@axe-core/playwright';

import { expect, test } from '../../fixtures/index.ts';

test('test modulix a11y on galerie module', async ({ page }) => {
  await page.goto(process.env.PIX_APP_URL + '/modules/b9414fc3/galerie/details');

  // Module Details
  await expect(page).toHaveTitle(/Galerie Modulix/, { timeout: 10_000 });
  await page.getByRole('button', { name: 'Commencer le module' }).click();

  // Module Passage
  await expect(page).toHaveURL(process.env.PIX_APP_URL + '/modules/b9414fc3/galerie/passage');
  await expect(page).toHaveTitle(/Galerie Modulix/);
  await page.getByRole('button', { name: 'Continuer' }).click();

  // Text element
  await expect(page.getByText('text', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continuer' }).click();

  // Audio element
  await expect(page.getByText('audio', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continuer' }).click();

  // Custom element
  await expect(page.getByText('custom', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continuer' }).click();

  // Custom-draft element
  await expect(page.getByText('custom-draft (todo)', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continuer' }).click();

  // Download element
  await expect(page.getByText('download', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continuer' }).click();

  // Embed element
  await expect(page.getByText('embed', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continuer' }).click();

  // Expand element
  await expect(page.getByText('expand', { exact: true })).toBeVisible();
  await page.getByText('Clique-moi pour en savoir').click();
  await expect(page.getByText('Souvent, pour s’amuser, les hommes d’équipage')).toBeVisible();
  await page.getByRole('button', { name: 'Continuer' }).click();

  // Flashcards element
  await expect(page.getByText('flashcards', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Passer l’activité' }).click();

  // Image element
  await expect(page.getByText('image', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continuer' }).click();

  // QAB element
  await expect(page.getByText('qab', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Passer l’activité' }).click();

  // QCU element
  await expect(page.getByText('qcu', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Passer l’activité' }).click();

  // QCU declarative element
  await expect(page.getByText('qcu-declarative', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Passer l’activité' }).click();

  // QCU discovery element
  await expect(page.getByText('qcu-discovery', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Passer l’activité' }).click();

  // QCM element
  await expect(page.getByText('qcm', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Passer l’activité' }).click();

  // QROCM element
  await expect(page.getByText('qrocm', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Passer l’activité' }).click();

  // Separator element
  await expect(page.getByText('separator', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continuer' }).click();

  // Video element
  await expect(page.getByText('video', { exact: true })).toBeVisible();

  // Short video element
  await expect(page.getByText('short video', { exact: true })).toBeVisible();

  // Finish button
  await page.getByRole('button', { name: 'Terminer' }).waitFor();

  // A11Y testing
  await page.waitForTimeout(2000);
  const modulixElement = page.locator('.modulix');
  await modulixElement.evaluate((e) => {
    Promise.all(e.getAnimations({ subtree: true }).map((a) => a.finished));
  });

  const axeBuilder = new AxeBuilder({ page });
  axeBuilder.include('.modulix');
  axeBuilder.exclude('iframe');

  const accessibilityScanResults = await axeBuilder.analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
