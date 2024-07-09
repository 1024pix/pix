import { setupRenderingTest } from 'ember-qunit';

import setupIntl, { t } from './setup-intl';

export default function setupIntlRenderingTest(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);
}

export { t };
