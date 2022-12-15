import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | pix logo', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(async function () {
    await render(hbs`{{pix-logo}}`);
  });

  test('should display the logo', function (assert) {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('.pix-logo__image').getAttribute('src'), '/images/pix-logo.svg');
  });

  test('should have a textual alternative', function (assert) {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('.pix-logo__image').getAttribute('alt'), "Page d'accueil de Pix");
  });
});
