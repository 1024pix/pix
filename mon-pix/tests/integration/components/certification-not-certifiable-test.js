import { render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | certification-not-certifiable', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    await render(hbs`<CertificationNotCertifiable />`);

    assert.strictEqual(
      find('.certification-not-certifiable__title').textContent.trim(),
      "Votre profil n'est pas encore certifiable.",
    );
    assert.strictEqual(
      find('.certification-not-certifiable__text').textContent.trim(),
      'Pour faire certifier votre profil, vous devez avoir obtenu un niveau supérieur à 0 dans 5 compétences minimum.',
    );
  });
});
