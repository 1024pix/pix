import { getScreen } from '@pix/ember-testing-library';
import { click } from '@ember/test-helpers';

export default function clickByLabel(labelText) {
  console.warn(`The clickByLabel helper is deprecated. Use testing-library's click(getByRole('${labelText}')) instead.`);
  const { getByRole } = getScreen();
  const element = getByRole(/button|link|radio|checkbox/, { name: labelText });
  return click(element);
}
