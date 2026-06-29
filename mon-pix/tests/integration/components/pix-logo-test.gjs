import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import PixLogo from 'mon-pix/components/pix-logo';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | pix logo', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display the logo', async function (assert) {
    // given & when
    const screen = await render(<template><PixLogo /></template>);

    // then
    assert.dom(screen.getByRole('link', { name: t('navigation.homepage') })).exists();
    assert.ok(screen.getByRole('img', { name: t('navigation.homepage') }).hasAttribute('src', '/images/pix-logo.svg'));
  });
});
