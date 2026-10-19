import { render, within } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import Footer from 'pix-certif/components/layout/footer';
import { module, test } from 'qunit';

import setupRenderingIntlTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Layout | Footer', function (hooks) {
  setupRenderingIntlTest(hooks);

  test('should display expected informations', async function (assert) {
    //given
    const date = new Date();
    const expectedYear = date.getFullYear();

    // when
    const screen = await render(<template><Footer /></template>);

    // then
    assert.dom(screen.getByText(t('navigation.footer.current-year', { currentYear: expectedYear }))).exists();

    const footerNavigation = screen.getByRole('navigation', { name: t('navigation.footer.aria-label') });

    assert
      .dom(
        within(footerNavigation).getByRole('link', {
          name: t('navigation.footer.legal-notice') + t('common.a11y.external-link'),
        }),
      )
      .hasAttribute('href', 'https://pix.org/fr/mentions-legales');

    assert
      .dom(
        within(footerNavigation).getByRole('link', {
          name: t('navigation.footer.a11y') + t('common.a11y.external-link'),
        }),
      )
      .hasAttribute('href', 'https://pix.org/fr/accessibilite-pix-certif');

    assert
      .dom(
        within(footerNavigation).getByRole('link', {
          name: t('navigation.footer.status') + t('common.a11y.external-link'),
        }),
      )
      .hasAttribute('href', 'https://status.pix.org/?locale=fr');
  });
});
