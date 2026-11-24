import { render } from '@1024pix/ember-testing-library';
import ModuleBetaBanner from 'mon-pix/components/module/layout/beta-banner';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Beta banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('displays a banner with an "alert" role and an info text', async function (assert) {
    // when
    const screen = await render(<template><ModuleBetaBanner /></template>);

    // then
    const infoText = t('pages.modulix.beta-banner');

    assert.dom(screen.getByRole('alert')).exists();
    assert.dom(screen.getByText(infoText)).exists();
  });
});
