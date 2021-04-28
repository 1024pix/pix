import { describe, it } from 'mocha';
import { expect } from 'chai';

import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'ember-cli-mirage';

import { authenticateByUsername } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';
import { contains } from '../helpers/contains';

describe('Acceptance | Update Expired Password', function() {

  setupApplicationTest();
  setupMirage();
  setupIntl();

  beforeEach(async function() {
    const userShouldChangePassword = server.create('user', 'withUsername', 'shouldChangePassword');
    await authenticateByUsername(userShouldChangePassword);
  });

  it('should land on default page when password is successfully updated', async function() {
    // given
    await fillIn('#password', 'newPass12345!');

    // when
    await click('.button');

    // then
    expect(currentURL()).to.equal('/accueil');
  });

  it('should display validation error message when update password fails with http 400 error', async function() {
    // given
    const expectedValidationErrorMessage = this.intl.t('pages.update-expired-password.fields.error');

    this.server.post('/expired-password-updates', () => {
      return new Response(400, {}, {
        errors: [{ status: '400' }],
      });
    });

    await fillIn('#password', 'newPass12345!');

    // when
    await click('.button');

    // then
    expect(currentURL()).to.equal('/mise-a-jour-mot-de-passe-expire');
    expect(contains(expectedValidationErrorMessage)).to.exist;
  });

  it('should display error message when update password fails with http 401 error', async function() {
    // given
    const expectedErrorMessage = this.intl.t('api-error-messages.login-unauthorized-error');

    this.server.post('/expired-password-updates', () => {
      return new Response(401, {}, {
        errors: [{ status: '401' }],
      });
    });

    await fillIn('#password', 'newPass12345!');

    // when
    await click('.button');

    // then
    expect(currentURL()).to.equal('/mise-a-jour-mot-de-passe-expire');
    expect(contains(expectedErrorMessage)).to.exist;
  });

  it('should display error message when update password fails', async function() {
    // given
    const expectedErrorMessage = this.intl.t('api-error-messages.internal-server-error');

    this.server.post('/expired-password-updates', () => new Response(500));

    await fillIn('#password', 'newPass12345!');

    // when
    await click('.button');
    // then
    expect(currentURL()).to.equal('/mise-a-jour-mot-de-passe-expire');
    expect(contains(expectedErrorMessage)).to.exist;
  });

});
