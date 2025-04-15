import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/mirage';
import { module, test } from 'qunit';

import setupIntl from '../helpers/setup-intl';

module('Acceptance | Certificate verification', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when certificate verification code is valid', function () {
    test('redirects to certificate details page', async function (assert) {
      // given
      const screen = await visit('/verification-certificat');
      await fillIn(screen.getByRole('textbox', { name: 'Code de vérification * Exemple: P-XXXXXXXX' }), 'P-123VALID');

      // when
      await click(screen.getByRole('button', { name: 'Vérifier le certificat' }));

      // then
      assert.strictEqual(currentURL(), '/partage-certificat/200');
    });
  });

  module('when certificate verification code is wrong', function () {
    test('does not redirect to certificate details page', async function (assert) {
      // given
      const screen = await visit('/verification-certificat');
      await fillIn(screen.getByRole('textbox', { name: 'Code de vérification * Exemple: P-XXXXXXXX' }), 'P-12345678');

      // when
      await click(screen.getByRole('button', { name: 'Vérifier le certificat' }));

      // then
      assert.strictEqual(currentURL(), '/verification-certificat');
    });
  });

  module('when user visits /partage-certificat/200 directly', function () {
    test('redirects to /verification-certificat', async function (assert) {
      // given & when
      await visit('/partage-certificat/200');

      // then
      assert.strictEqual(currentURL(), '/verification-certificat');
    });
  });
});
