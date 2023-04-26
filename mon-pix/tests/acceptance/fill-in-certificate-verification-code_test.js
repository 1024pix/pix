import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { fillIn, currentURL, click } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Certificate verification', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when certificate verification code is valid', function () {
    test('redirects to certificate details page', async function (assert) {
      // Given
      const screen = await visit('/verification-certificat');
      await fillIn(screen.getByRole('textbox', { name: 'Code de vérification (P-XXXXXXXX)' }), 'P-123VALID');

      // When
      await click(
        screen.getByRole('button', { name: this.intl.t('pages.fill-in-certificate-verification-code.verify') })
      );

      // Then
      assert.strictEqual(currentURL(), '/partage-certificat/200');
    });
  });

  module('when certificate verification code is wrong', function () {
    test('does not redirect to certificate details page', async function (assert) {
      // Given
      const screen = await visit('/verification-certificat');
      await fillIn(screen.getByRole('textbox', { name: 'Code de vérification (P-XXXXXXXX)' }), 'P-12345678');

      // When
      await click(
        screen.getByRole('button', { name: this.intl.t('pages.fill-in-certificate-verification-code.verify') })
      );

      // Then
      assert.strictEqual(currentURL(), '/verification-certificat');
    });

    test('shows error message', async function (assert) {
      // Given
      const screen = await visit('/verification-certificat');
      await fillIn(screen.getByRole('textbox', { name: 'Code de vérification (P-XXXXXXXX)' }), 'P-12345678');

      // When
      await click(
        screen.getByRole('button', { name: this.intl.t('pages.fill-in-certificate-verification-code.verify') })
      );

      // Then
      assert.dom(screen.getByText("Il n'y a pas de certificat Pix correspondant.")).exists();
    });
  });

  module('when user visits /partage-certificat/200 directly', function () {
    test('redirects to /verification-certificat', async function (assert) {
      // When
      await visit('/partage-certificat/200');

      // Then
      assert.strictEqual(currentURL(), '/verification-certificat');
    });
  });
});
