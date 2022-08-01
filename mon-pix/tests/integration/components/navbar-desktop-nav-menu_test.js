import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | navbar desktop menu', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should be rendered', async function (assert) {
    // when
    await render(hbs`<NavbarDesktopMenu/>`);

    // then
    assert.dom(find('.navbar-desktop-menu')).exists();
  });
});
