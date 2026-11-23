import { render } from '@1024pix/ember-testing-library';
import Footer from 'mon-pix/components/footer';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Footer', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('displays the Pix logo', async function (assert) {
    // when
    const screen = await render(<template><Footer /></template>);

    // then
    assert.ok(screen.getByAltText(t('common.pix')));
  });

  test('displays the navigation menu with expected', async function (assert) {
    // when
    const screen = await render(<template><Footer /></template>);

    // then
    assert.dom(screen.getByRole('navigation')).hasAttribute('aria-label', t('navigation.footer.label'));

    assert.dom(screen.getByAltText(t('common.pix'))).exists();
    assert.dom(screen.getByText(`${t('navigation.copyrights')} ${new Date().getFullYear()} Pix`)).exists();
  });
});
