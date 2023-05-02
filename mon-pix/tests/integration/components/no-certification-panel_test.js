import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
// eslint-disable-next-line no-restricted-imports
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | no certification panel', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    await render(hbs`<NoCertificationPanel/>`);
    assert.dom('.no-certification-panel').exists();
  });
});
