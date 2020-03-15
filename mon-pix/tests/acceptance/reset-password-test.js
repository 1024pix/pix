import { click, currentURL, fillIn, find } from '@ember/test-helpers';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Reset Password Form', function() {
  setupApplicationTest();
  setupMirage();

  it('can visit /changer-mot-de-passe', async function() {
    // when
    await visitWithAbortedTransition('/changer-mot-de-passe/temporaryKey');

    // then
    expect(currentURL()).to.equal('/changer-mot-de-passe/temporaryKey');
  });

  it('should stay on changer-mot-de-passe, and show success message, when password is successfully reset', async function() {
    // given
    server.create('user', {
      id: 1000,
      firstName: 'Brandone',
      lastName: 'Martins',
      email: 'brandone.martins@pix.com',
      password: '1024pix!'
    });

    server.create('password-reset-demand', {
      temporaryKey: 'brandone-reset-key',
      email: 'brandone.martins@pix.com',
    });

    await visitWithAbortedTransition('/changer-mot-de-passe/brandone-reset-key');
    await fillIn('#password', 'newPass12345!');

    // when
    await click('.button');

    // then
    expect(currentURL()).to.equal('/changer-mot-de-passe/brandone-reset-key');
    expect(find('.sign-form__body').textContent).to.contain('Votre mot de passe a été modifié avec succès');

  });
});
