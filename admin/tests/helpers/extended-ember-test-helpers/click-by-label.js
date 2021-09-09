import { click } from '@ember/test-helpers';
import getByLabel from './get-by-label';

export default function clickByLabel(labelText, options) {
  const clickableElement = getByLabel(labelText, options);

  return click(clickableElement);
}
