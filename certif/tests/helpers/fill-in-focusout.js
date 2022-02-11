import { fillIn, blur } from '@ember/test-helpers';

export default async function fillInFocusOut(selector, value) {
  await fillIn(selector, value);
  await blur(selector);
}
