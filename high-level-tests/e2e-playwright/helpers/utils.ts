import { Page } from '@playwright/test';

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

export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

export function sanitizeFilename(name: string) {
  return name.replace(/[^a-z0-9_\-.]/gi, '_');
}

export async function disableAnimation(page: Page) {
  // Disable all CSS animations and transitions
  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = `
    *,*::before,*::after{
      animation-duration:0s!important;
      transition-duration:0s!important;
    }
  `;
    document.head.appendChild(style);
  });
}

export const A11Y_VIEWPORTS = [
  { width: 350, height: 667 },
  { width: 1280, height: 800 },
];
