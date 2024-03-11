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
    assert.dom(screen.getByText('Mentions légales')).exists();
    assert.dom('a[href="https://pix.org/fr/mentions-legales"]').exists();
  });

  test('should display accessibility link', async function (assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { isFranceDomain: true };

    // when
    const screen = await renderScreen(hbs`<Layout::Footer />}`);

    // then
    assert.dom(screen.getByText('Accessibilité : partiellement conforme')).exists();
    assert.dom('a[href="https://pix.fr/accessibilite-pix-orga"]').exists();
  });
});
