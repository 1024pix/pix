import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | pix logo', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display the logo', async function (assert) {
    // given & when
    const screen = await render(hbs`<PixLogo />`);

    // then
    assert.dom(screen.getByRole('link', { name: this.intl.t('navigation.homepage') })).exists();
    assert.ok(
      screen.getByRole('img', { name: this.intl.t('navigation.homepage') }).hasAttribute('src', '/images/pix-logo.svg'),
    );
  });
});
