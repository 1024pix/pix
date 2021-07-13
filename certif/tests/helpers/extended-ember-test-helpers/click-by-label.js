import { click } from '@ember/test-helpers';
import getByLabel from './get-by-label';

export default function clickByLabel(labelText) {
  const clickableElement = getByLabel(labelText);

  return click(clickableElement);
}
