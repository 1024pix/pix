import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { render as renderScreen } from '@1024pix/ember-testing-library';

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
    service.currentDomain = { getExtension: sinon.stub().returns('org') };

    // when
    const screen = await renderScreen(hbs`<Layout::Footer />}`);

    // then
    assert.dom(screen.getByText('Mentions légales')).exists();
    assert.dom('a[href="https://pix.org/fr/mentions-legales"]').exists();
  });

  test('should display accessibility link', async function (assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { getExtension: sinon.stub().returns('fr') };

    // when
    const screen = await renderScreen(hbs`<Layout::Footer />}`);

    // then
    assert.dom(screen.getByText('Accessibilité : partiellement conforme')).exists();
    assert.dom('a[href="https://pix.fr/accessibilite-pix-orga"]').exists();
  });
});
