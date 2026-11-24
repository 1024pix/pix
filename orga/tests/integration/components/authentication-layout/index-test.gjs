import { render } from '@1024pix/ember-testing-library';
import AuthenticationLayout from 'pix-orga/components/authentication-layout';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | authentication-layout/index', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays an authentication layout', async function (assert) {
    // given & when
    const screen = await render(<template><AuthenticationLayout /></template>);

    // then
    assert.dom('.authentication-layout__image').exists();
    assert.dom(screen.getByRole('main')).exists();
    assert.dom(screen.getByRole('banner')).exists();
    assert.dom(screen.getByRole('contentinfo')).exists();
    assert.dom(screen.queryByRole('button', { name: t('components.locale-switcher.label') })).exists();
  });
});
