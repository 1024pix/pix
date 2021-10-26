import { getRootElement, click, fillIn, render as renderHbs, visit as visitUrl } from '@ember/test-helpers';
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

/**
 * Click on a DOM element selected by a name.
 *
 * @param {*} name Name of the clickable DOM element.
 * @returns Promise of the click.
 */
export function clickByLabel(name) {
  const { getByRole } = getScreen();
  const element = getByRole(/button|link|radio|checkbox/, { name });
  return click(element);
}

/**
 * Fill with the given value a DOM element selected by a label.
 *
 * @param {*} label Label linked to the control to fill.
 * @returns Promise of the filling.
 */
export function fillInByLabel(label, value) {
  const { getByLabelText } = getScreen();
  const element = getByLabelText(label);
  return fillIn(element, value);
}

/**
 * Select a choice for a given label.
 *
 * @param {*} label Label of field to fill.
 * @param {*} answerText Label of choice to select.
 * @returns Promise of the filling.
 */
export function selectChoiceForLabel(label, answerText) {
  const { getByText } = getScreen();
  const parent = getByText(label).parentNode;
  const answer = within(parent).getByText(answerText);
  return click(answer);
}
