import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, fillIn, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickByLabel } from '../helpers/click-by-label';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Certificate verification', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when certificate verification code is valid', function () {
    test('redirects to certificate details page', async function (assert) {
      // Given
      await visit('/verification-certificat');
      await fillIn('#certificate-verification-code', 'P-123VALID');

      // When
      await clickByLabel(this.intl.t('pages.fill-in-certificate-verification-code.verify'));

      // Then
      assert.strictEqual(currentURL(), '/partage-certificat/200');
    });
  });

  module('when certificate verification code is wrong', function () {
    test('does not redirect to certificate details page', async function (assert) {
      // Given
      await visit('/verification-certificat');
      await fillIn('#certificate-verification-code', 'P-12345678');

      // When
      await clickByLabel(this.intl.t('pages.fill-in-certificate-verification-code.verify'));

      // Then
      assert.strictEqual(currentURL(), '/verification-certificat');
    });

    test('shows error message', async function (assert) {
      // Given
      await visit('/verification-certificat');
      await fillIn('#certificate-verification-code', 'P-12345678');

      // When
      await clickByLabel(this.intl.t('pages.fill-in-certificate-verification-code.verify'));

      // Then
      assert.dom('.form__error--not-found').exists();
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
