import { module, test } from 'qunit';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupRenderingIntlTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Layout::Footer', function (hooks) {
  setupRenderingIntlTest(hooks);

  test('should display copyright with current year', async function (assert) {
    //given
    const date = new Date();
    const expectedYear = date.getFullYear();

    // when
    const screen = await renderScreen(hbs`<Layout::Footer />}`);

    // then
    assert.dom(screen.getByText(this.intl.t('navigation.footer.current-year', { currentYear: expectedYear }))).exists();
  });

  test('should display legal notice link', async function (assert) {
    // when
    const screen = await renderScreen(hbs`<Layout::Footer />}`);

    // then
    assert.dom(screen.getByText(this.intl.t('navigation.footer.legal-notice'))).exists();
    assert.dom('a[href="https://pix.fr/mentions-legales/"]').exists();
  });

  test('should display accessibility link', async function (assert) {
    // when
    const screen = await renderScreen(hbs`<Layout::Footer />}`);

    // then
    assert.dom(screen.getByText(this.intl.t('navigation.footer.a11y'))).exists();
    assert.dom('a[href="https://pix.fr/accessibilite-pix-certif/"]').exists();
  });
});
