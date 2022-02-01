import setupIntl from './setup-intl';
import { setupRenderingTest } from 'ember-qunit';

export default function setupIntlRenderingTest(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);
}
