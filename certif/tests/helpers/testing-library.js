import { getRootElement, render as renderHbs, visit as visitUrl } from '@ember/test-helpers';
import { within } from '@testing-library/dom';

/**
 * Wrap the EmberJS container with DOM testing library.
 * https://testing-library.com/docs/queries/about
 *
 * @returns The EmberJS container wrapped by the DOM testing library.
 */
export function getScreen() {
  return within(getRootElement());
}

/**
 * Visit the given URL in the EmberJS testing server and returns DOM testing library helpers.
 *
 * @param {string} url URL of the page to visit.
 * @returns DOM testing library helpers for the given page URL.
 */
export async function visit(url) {
  await visitUrl(url);
  return getScreen();
}

/**
 * Renders a EmberJS component template and returns DOM testing library helpers.
 *
 * @param {string} template EmberJS component template.
 * @returns DOM testing library helpers for the given component.
 */
export async function render(template) {
  await renderHbs(template);
  return getScreen();
}
