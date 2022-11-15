import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | pix logo', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(async function () {
    await render(hbs`{{pix-logo}}`);
  });

  test('renders', function (assert) {
    assert.dom('.pix-logo').exists();
  });

  test('should display the logo', function (assert) {
    assert.equal(find('.pix-logo__image').getAttribute('src'), '/images/pix-logo.svg');
  });

  test('should have a textual alternative', function (assert) {
    assert.equal(find('.pix-logo__image').getAttribute('alt'), "Page d'accueil de Pix");
  });
});
