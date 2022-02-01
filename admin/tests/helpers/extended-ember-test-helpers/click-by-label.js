import { click } from '@ember/test-helpers';
import { getScreen } from '@1024pix/ember-testing-library';

/**
 * Click on a DOM element selected by a name.
 *
 * @param {*} name Name of the clickable DOM element.
 * @returns Promise of the click.
 */
export default function clickByLabel(name) {
  const { getByRole } = getScreen();
  const element = getByRole(/button|link|radio|checkbox/, { name });
  return click(element);
}
