import { fillIn } from '@ember/test-helpers';
import getByLabel from './get-by-label';

export default function fillInByLabel(labelText, value) {
  const control = getByLabel(labelText);

  return fillIn(control, value);
}
