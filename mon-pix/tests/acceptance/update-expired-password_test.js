import { describe, it } from 'mocha';
import { expect } from 'chai';

import { currentURL, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';

import { authenticateByUsername } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';
import { clickByLabel } from '../helpers/click-by-label';
import { visit } from '@1024pix/ember-testing-library';

describe('Acceptance | Update Expired Password', function () {
  setupApplicationTest();
  setupMirage();
  setupIntl();

  it('should land on default page when password is successfully updated', async function () {
    // given
    const userShouldChangePassword = server.create('user', 'withUsername', 'shouldChangePassword');
    await authenticateByUsername(userShouldChangePassword);
    await fillIn('#password', 'newPass12345!');

    // when
    await clickByLabel(this.intl.t('pages.update-expired-password.button'));

    // then
    expect(currentURL()).to.equal('/accueil');
  });

  it('should display validation error message when update password fails with http 400 error', async function () {
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

    expect(currentURL()).to.equal('/mise-a-jour-mot-de-passe-expire');
    const expectedValidationErrorMessage = this.intl.t('pages.update-expired-password.fields.error');
    expect(screen.getByText(expectedValidationErrorMessage)).to.exist;
  });

  it('should display error message when update password fails with http 401 error', async function () {
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

    expect(currentURL()).to.equal('/mise-a-jour-mot-de-passe-expire');
    const expectedErrorMessage = this.intl.t('api-error-messages.login-unauthorized-error');
    expect(screen.getByText(expectedErrorMessage)).to.exist;
  });

  it('should display error message when update password fails with http 404 error', async function () {
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
    expect(this.intl.t('common.error')).to.exist;
  });

  it('should display error message when update password fails', async function () {
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
    expect(currentURL()).to.equal('/mise-a-jour-mot-de-passe-expire');
    const expectedErrorMessage = this.intl.t('api-error-messages.internal-server-error');
    expect(screen.getByText(expectedErrorMessage)).to.exist;
  });
});
