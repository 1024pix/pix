import { click, currentURL, fillIn, find } from '@ember/test-helpers';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateByUsername } from '../helpers/authentication';

describe('Acceptance | Update Expired Password', function() {

  setupApplicationTest();
  setupMirage();

  let userShouldChangePassword;

  beforeEach(async function() {
    userShouldChangePassword = server.create('user', 'withUsername', 'shouldChangePassword');
    await authenticateByUsername(userShouldChangePassword);
  });

  it('should land on profile page when password is successfully updated', async function() {
    // given
    await fillIn('#password', 'newPass12345!');

    // when
    await click('.button');

    // then
    expect(currentURL()).to.equal('/profil');
  });

  it('should display error when password update failed', async function() {
    // given
    const badPasswordErrorResponse = {
      errors: [{
        status: 500,
        title: 'Internal Server Error',
        detail: 'Mauvais mot de passe.'
      }]
    };
    this.server.post('/expired-password-updates', () => (badPasswordErrorResponse), 500);

    await fillIn('#password', 'newPass12345!');

    // when
    await click('.button');

    // then
    expect(currentURL()).to.equal('/mise-a-jour-mot-de-passe-expire');
    expect(find('.form-textfield__message--error')).to.exist;

  });

});
