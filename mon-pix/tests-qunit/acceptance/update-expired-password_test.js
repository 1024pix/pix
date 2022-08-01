import { module, test } from 'qunit';

import { currentURL, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'ember-cli-mirage';

import { authenticateByUsername } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';
import { contains } from '../helpers/contains';
import { clickByLabel } from '../helpers/click-by-label';

module('Acceptance | Update Expired Password', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    const userShouldChangePassword = server.create('user', 'withUsername', 'shouldChangePassword');
    await authenticateByUsername(userShouldChangePassword);
  });

  test('should land on default page when password is successfully updated', async function (assert) {
    // given
    await fillIn('#password', 'newPass12345!');

    // when
    await clickByLabel(this.intl.t('pages.update-expired-password.button'));

    // then
    assert.equal(currentURL(), '/accueil');
  });

  test('should display validation error message when update password fails with http 400 error', async function (assert) {
    // given
    const expectedValidationErrorMessage = this.intl.t('pages.update-expired-password.fields.error');

    this.server.post('/expired-password-updates', function () {
      return new Response(
        400,
        {},
        {
          errors: [{ status: '400' }],
        }
      );
    });

    await fillIn('#password', 'newPass12345!');

    // when
    await clickByLabel(this.intl.t('pages.update-expired-password.button'));

    // then
    assert.equal(currentURL(), '/mise-a-jour-mot-de-passe-expire');
    assert.dom(contains(expectedValidationErrorMessage)).exists();
  });

  test('should display error message when update password fails with http 401 error', async function (assert) {
    // given
    const expectedErrorMessage = this.intl.t('api-error-messages.login-unauthorized-error');

    this.server.post('/expired-password-updates', function () {
      return new Response(
        401,
        {},
        {
          errors: [{ status: '401' }],
        }
      );
    });

    await fillIn('#password', 'newPass12345!');

    // when
    await clickByLabel(this.intl.t('pages.update-expired-password.button'));

    // then
    assert.equal(currentURL(), '/mise-a-jour-mot-de-passe-expire');
    assert.dom(contains(expectedErrorMessage)).exists();
  });

  test('should display error message when update password fails with http 404 error', async function (assert) {
    // given
    this.server.post('/expired-password-updates', function () {
      return new Response(
        401,
        {},
        {
          errors: [{ status: '404', code: 'USER_ACCOUNT_NOT_FOUND' }],
        }
      );
    });

    await fillIn('#password', 'newPass12345!');

    // when
    await clickByLabel(this.intl.t('pages.update-expired-password.button'));

    // then
    assert.dom(this.intl.t('common.error')).exists();
  });

  test('should display error message when update password fails', async function (assert) {
    // given
    const expectedErrorMessage = this.intl.t('api-error-messages.internal-server-error');

    this.server.post('/expired-password-updates', () => new Response(500));

    await fillIn('#password', 'newPass12345!');

    // when
    await clickByLabel(this.intl.t('pages.update-expired-password.button'));
    // then
    assert.equal(currentURL(), '/mise-a-jour-mot-de-passe-expire');
    assert.dom(contains(expectedErrorMessage)).exists();
  });
});
