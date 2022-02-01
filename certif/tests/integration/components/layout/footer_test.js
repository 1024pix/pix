import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';

module('Integration | Component | Layout::Footer', function (hooks) {
  setupRenderingTest(hooks);

  test('should display copyright with current year', async function (assert) {
    //given
    const date = new Date();
    const expectedYear = date.getFullYear().toString();

    // when
    await render(hbs`<Layout::Footer />}`);

    // then
    assert.contains(`© ${expectedYear} Pix`);
  });

  test('should display legal notice link', async function (assert) {
    // when
    await render(hbs`<Layout::Footer />}`);

    // then
    assert.contains('Mentions légales');
    assert.dom('a[href="https://pix.fr/mentions-legales/"]').exists();
  });

  test('should display accessibility link', async function (assert) {
    // when
    await render(hbs`<Layout::Footer />}`);

    // then
    assert.contains('Accessibilité : non conforme');
    assert.dom('a[href="https://pix.fr/accessibilite-pix-certif/"]').exists();
  });
});
