import { expect, Locator, Page } from '@playwright/test';

export function* rightWrongAnswerCycle({ numRight = 1, numWrong = 1 }) {
  const answers: boolean[] = [];

  for (let i = 0; i < numRight; i++) {
    answers.push(true);
  }
  for (let i = 0; i < numWrong; i++) {
    answers.push(false);
  }

  let i = 0;
  while (true) {
    yield answers[i % answers.length];
    i++;
  }
}

export async function getStringValueFromDescriptionList(
  page: Page,
  dataTestId: string,
  dtLabel: string,
  options?: { optional?: boolean },
) {
  const dd = await getLocatorFromDescriptionList(page, dataTestId, dtLabel, options);
  if (!dd) return undefined;
  return (await dd.innerText()).trim();
}

export async function getNumberValueFromDescriptionList(
  page: Page,
  dataTestId: string,
  dtLabel: string,
  options?: { optional?: boolean },
) {
  const val = await getStringValueFromDescriptionList(page, dataTestId, dtLabel, options);
  if (!val) return undefined;
  return Number(val);
}

/* This util method is tightly coupled to the expectations that the description list has a datatest-id
 It could be a more maintainable and a11y friendly way to read data from it, if you find it be our guests !
 */
async function getLocatorFromDescriptionList(
  page: Page,
  dataTestId: string,
  dtLabel: string,
  options?: { optional?: boolean },
) {
  const dts = page.getByTestId(dataTestId).locator('dt');
  const count = await dts.count();

  for (let i = 0; i < count; i++) {
    const dt = dts.nth(i);
    const raw = await dt.textContent();
    const text = normalizeWhitespace(raw ?? '');

    if (text === dtLabel) {
      return dt.locator('xpath=following-sibling::dd[1]');
    }
  }

  if (options?.optional) {
    return undefined;
  }

  throw new Error(`No dt found with label: "${dtLabel}"`);
}

export function normalizeWhitespace(str: string | null): string | null {
  if (!str) return str;
  return str.replace(/\s+/g, ' ').trim();
}

export function sanitizeFilename(name: string) {
  return name.replace(/[^a-z0-9_\-.]/gi, '_');
}

export async function waitForVisibleWithReload(
  page: Page,
  locator: Locator,
  options?: {
    timeout?: number;
    interval?: number;
  },
) {
  const timeout = options?.timeout ?? 60_000;
  const interval = options?.interval ?? 2_000;

  const start = Date.now();

  while (Date.now() - start < timeout) {
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    try {
      await expect(locator).toBeVisible({ timeout: interval });
      return;
    } catch {
      // element not here yet, reloading...
    }
  }

  throw new Error('Element did not appear before timeout');
}

export async function getInnerTextOrDefault(locator: Locator, text: string | null) {
  let innerText = text;

  if ((await locator.count()) > 0) {
    innerText = await locator.innerText();
  }
  return innerText;
}

export function getNowAsDDMMYYYY() {
  return new Date().toISOString().slice(0, 10).split('-').reverse().join('/');
}

export function getYesterdayAsDDMMYYYY() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return yesterday.toISOString().slice(0, 10).split('-').reverse().join('/');
}

export async function getDownloadBuffer(page: Page, downloadTriggerPromise: Promise<void>) {
  const [download] = await Promise.all([page.waitForEvent('download'), downloadTriggerPromise]);
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}
