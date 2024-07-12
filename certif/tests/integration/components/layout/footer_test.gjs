import { render } from '@1024pix/ember-testing-library';
import Footer from 'pix-certif/components/layout/footer';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupRenderingIntlTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Layout | Footer', function (hooks) {
  setupRenderingIntlTest(hooks);

  test('should display copyright with current year', async function (assert) {
    //given
    const date = new Date();
    const expectedYear = date.getFullYear();

    // when
    const screen = await render(<template><Footer /></template>);

    // then
    assert.dom(screen.getByText(this.intl.t('navigation.footer.current-year', { currentYear: expectedYear }))).exists();
  });

  test('should display legal notice link', async function (assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain.getExtension = sinon.stub().returns('fr');

    // when
    const screen = await render(<template><Footer /></template>);

    // then
    assert
      .dom(screen.getByRole('link', { name: this.intl.t('navigation.footer.legal-notice') }))
      .hasAttribute('href', 'https://pix.fr/mentions-legales');
  });

  test('should display accessibility link', async function (assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain.getExtension = sinon.stub().returns('fr');

    // when
    const screen = await render(<template><Footer /></template>);

    // then
    assert
      .dom(screen.getByRole('link', { name: this.intl.t('navigation.footer.a11y') }))
      .hasAttribute('href', 'https://pix.fr/accessibilite-pix-certif');
  });
});
