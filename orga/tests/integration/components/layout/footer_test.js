import { render as renderScreen } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Layout::Footer', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display copyright', async function (assert) {
    //given
    const date = new Date();
    const expectedYear = date.getFullYear().toString();

    // when
    const screen = await renderScreen(hbs`<Layout::Footer />}`);

    // then
    assert.dom(screen.getByText(`© ${expectedYear} Pix`)).exists();
  });

  test('should display legal notice link', async function (assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { isFranceDomain: false };

    // when
    const screen = await renderScreen(hbs`<Layout::Footer />}`);

    // then
    const link = screen.getByRole('link', { name: this.intl.t('navigation.footer.legal-notice') });
    assert.dom(link).hasProperty('href', 'https://pix.org/fr/mentions-legales');
  });

  test('should display accessibility link', async function (assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { isFranceDomain: true };

    // when
    const screen = await renderScreen(hbs`<Layout::Footer />}`);

    // then
    const link = screen.getByRole('link', { name: this.intl.t('navigation.footer.a11y') });
    assert.dom(link).hasProperty('href', 'https://pix.fr/accessibilite-pix-orga');
  });

  test('should display pix status link', async function (assert) {
    // when
    const screen = await renderScreen(hbs`<Layout::Footer />}`);

    // then
    const link = screen.getByRole('link', { name: this.intl.t('navigation.footer.server-status') });
    assert.dom(link).hasProperty('href', 'https://status.pix.org/?locale=fr');
  });
});
