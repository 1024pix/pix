import { click, fillIn } from '@ember/test-helpers';
import { getScreen } from '@1024pix/ember-testing-library';
import { within } from '@testing-library/dom';

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
