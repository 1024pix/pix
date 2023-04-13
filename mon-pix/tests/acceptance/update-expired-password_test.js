import { module, test } from 'qunit';

import { currentURL, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';

import { authenticateByUsername } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';
import { visit } from '@1024pix/ember-testing-library';

import ENV from '../../config/environment';
const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

const PASSWORD_INPUT_LABEL = '* Mot de passe (8 caractères minimum, dont une majuscule, une minuscule et un chiffre)';

module('Acceptance | Update Expired Password', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('should land on default page when password is successfully updated', async function (assert) {
    // given
    const userShouldChangePassword = server.create('user', 'withUsername', 'shouldChangePassword');
    const screen = await authenticateByUsername(userShouldChangePassword);
    await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL), 'newPass12345!');

    // when
    await click(screen.getByRole('button', { name: this.intl.t('pages.update-expired-password.button') }));

    // then
    assert.strictEqual(currentURL(), '/accueil');
  });

  test('should display validation error message when update password fails with http 400 error', async function (assert) {
    // given
    const userShouldChangePassword = server.create('user', 'withUsername', 'shouldChangePassword');
    const screen = await visit('/connexion');

    await fillIn(
      screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }),
      userShouldChangePassword.username
    );
    await fillIn(screen.getByLabelText('Mot de passe'), userShouldChangePassword.password);
    await click(screen.getByRole('button', { name: 'Je me connecte' }));

    this.server.post('/expired-password-updates', () => {
      return new Response(
        400,
        {},
        {
          errors: [{ status: '400' }],
        }
      );
    });

    await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL), 'newPass12345!');

    // when
    await click(screen.getByRole('button', { name: this.intl.t('pages.update-expired-password.button') }));

    // then
    assert.strictEqual(currentURL(), '/mise-a-jour-mot-de-passe-expire');
    const expectedValidationErrorMessage = this.intl.t('pages.update-expired-password.fields.error');
    assert.ok(screen.getByText(expectedValidationErrorMessage));
  });

  test('should display error message when update password fails with http 401 error', async function (assert) {
    // given
    const userShouldChangePassword = server.create('user', 'withUsername', 'shouldChangePassword');
    const screen = await visit('/connexion');
    await fillIn(
      screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }),
      userShouldChangePassword.username
    );
    await fillIn(screen.getByLabelText('Mot de passe'), userShouldChangePassword.password);
    await click(screen.getByRole('button', { name: 'Je me connecte' }));

    this.server.post('/expired-password-updates', () => {
      return new Response(
        401,
        {},
        {
          errors: [{ status: '401' }],
        }
      );
    });

    await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL), 'newPass12345!');

    // when
    await click(screen.getByRole('button', { name: this.intl.t('pages.update-expired-password.button') }));

    // then
    assert.strictEqual(currentURL(), '/mise-a-jour-mot-de-passe-expire');
    assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.LOGIN_UNAUTHORIZED.I18N_KEY))).exists();
  });

  test('should display error message when update password fails with http 404 error', async function (assert) {
    // given
    const userShouldChangePassword = server.create('user', 'withUsername', 'shouldChangePassword');
    const screen = await authenticateByUsername(userShouldChangePassword);

    this.server.post('/expired-password-updates', () => {
      return new Response(
        401,
        {},
        {
          errors: [{ status: '404', code: 'USER_ACCOUNT_NOT_FOUND' }],
        }
      );
    });

    await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL), 'newPass12345!');

    // when
    await click(screen.getByRole('button', { name: this.intl.t('pages.update-expired-password.button') }));

    // then
    assert.ok(this.intl.t('common.error'));
  });

  test('should display error message when update password fails', async function (assert) {
    // given
    const userShouldChangePassword = server.create('user', 'withUsername', 'shouldChangePassword');
    const screen = await visit('/connexion');
    await fillIn(
      screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }),
      userShouldChangePassword.username
    );
    await fillIn(screen.getByLabelText('Mot de passe'), userShouldChangePassword.password);
    await click(screen.getByRole('button', { name: 'Je me connecte' }));
    this.server.post('/expired-password-updates', () => new Response(500));

    await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL), 'newPass12345!');

    // when
    await click(screen.getByRole('button', { name: this.intl.t('pages.update-expired-password.button') }));

    // then
    assert.strictEqual(currentURL(), '/mise-a-jour-mot-de-passe-expire');
    assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY))).exists();
  });
});
