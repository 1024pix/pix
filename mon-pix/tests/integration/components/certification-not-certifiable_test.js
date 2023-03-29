import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | certification-not-certifiable', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    await render(hbs`{{certification-not-certifiable}}`);

    assert.strictEqual(
      find('.certification-not-certifiable__title').textContent.trim(),
      "Votre profil n'est pas encore certifiable."
    );
    assert.strictEqual(
      find('.certification-not-certifiable__text').textContent.trim(),
      'Pour faire certifier votre profil, vous devez avoir obtenu un niveau supérieur à 0 dans 5 compétences minimum.'
    );
  });
});
