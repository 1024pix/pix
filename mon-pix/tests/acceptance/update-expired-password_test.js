import { module, test } from 'qunit';

import { currentURL, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';

import { authenticateByUsername } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';
import { clickByLabel } from '../helpers/click-by-label';
import { visit } from '@1024pix/ember-testing-library';

import ENV from '../../config/environment';
const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

module('Acceptance | Update Expired Password', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('should land on default page when password is successfully updated', async function (assert) {
    // given
    const userShouldChangePassword = server.create('user', 'withUsername', 'shouldChangePassword');
    await authenticateByUsername(userShouldChangePassword);
    await fillIn('#password', 'newPass12345!');

    // when
    await clickByLabel(this.intl.t('pages.update-expired-password.button'));

    // then
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(currentURL(), '/accueil');
  });

  test('should display validation error message when update password fails with http 400 error', async function (assert) {
    // given
    const userShouldChangePassword = server.create('user', 'withUsername', 'shouldChangePassword');
    const screen = await visit('/connexion');
    await fillIn('#login', userShouldChangePassword.username);
    await fillIn('#password', userShouldChangePassword.password);
    await clickByLabel('Je me connecte');
    this.server.post('/expired-password-updates', () => {
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

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(currentURL(), '/mise-a-jour-mot-de-passe-expire');
    const expectedValidationErrorMessage = this.intl.t('pages.update-expired-password.fields.error');
    assert.ok(screen.getByText(expectedValidationErrorMessage));
  });

  test('should display error message when update password fails with http 401 error', async function (assert) {
    // given
    const userShouldChangePassword = server.create('user', 'withUsername', 'shouldChangePassword');
    const screen = await visit('/connexion');
    await fillIn('#login', userShouldChangePassword.username);
    await fillIn('#password', userShouldChangePassword.password);
    await clickByLabel('Je me connecte');
    this.server.post('/expired-password-updates', () => {
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

    assert.strictEqual(currentURL(), '/mise-a-jour-mot-de-passe-expire');
    assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.LOGIN_UNAUTHORIZED.I18N_KEY))).exists();
  });

  test('should display error message when update password fails with http 404 error', async function (assert) {
    // given
    const userShouldChangePassword = server.create('user', 'withUsername', 'shouldChangePassword');
    await authenticateByUsername(userShouldChangePassword);
    this.server.post('/expired-password-updates', () => {
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
    assert.ok(this.intl.t('common.error'));
  });

  test('should display error message when update password fails', async function (assert) {
    // given
    const userShouldChangePassword = server.create('user', 'withUsername', 'shouldChangePassword');
    const screen = await visit('/connexion');
    await fillIn('#login', userShouldChangePassword.username);
    await fillIn('#password', userShouldChangePassword.password);
    await clickByLabel('Je me connecte');
    this.server.post('/expired-password-updates', () => new Response(500));

    await fillIn('#password', 'newPass12345!');

    // when
    await clickByLabel(this.intl.t('pages.update-expired-password.button'));

    // then
    assert.strictEqual(currentURL(), '/mise-a-jour-mot-de-passe-expire');
    assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY))).exists();
  });
});
