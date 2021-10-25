import { getScreen } from '@1024pix/ember-testing-library';
import { fillIn } from '@ember/test-helpers';

/**
 * Fill with the given value a DOM element selected by a label.
 *
 * @param {*} label Label linked to the control to fill.
 * @returns Promise of the filling.
 */
export default function fillInByLabel(label, value) {
  const { getByLabelText } = getScreen();
  const element = getByLabelText(label);
  return fillIn(element, value);
}
