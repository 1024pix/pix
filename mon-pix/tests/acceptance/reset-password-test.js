import { click, currentURL, fillIn, find } from '@ember/test-helpers';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Reset Password Form', function() {
  setupApplicationTest();
  setupMirage();

  it('can visit /changer-mot-de-passe when temporaryKey exists', async function() {
    // given
    server.create('user', {
      id: 1000,
      firstName: 'Brandone',
      lastName: 'Martins',
      email: 'brandone.martins@pix.com',
      password: '1024pix!'
    });

    server.create('password-reset-demand', {
      temporaryKey: 'temporaryKey',
      email: 'brandone.martins@pix.com',
    });

    // when
    await visit('/changer-mot-de-passe/temporaryKey');

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

    await visit('/changer-mot-de-passe/brandone-reset-key');
    await fillIn('#password', 'newPass12345!');

    // when
    await click('.button');

    // then
    expect(currentURL()).to.equal('/changer-mot-de-passe/brandone-reset-key');
    expect(find('.sign-form__body').textContent).to.contain('Votre mot de passe a été modifié avec succès');
  });

  it('should allow connected user to visit reset-password page', async () => {
    // given
    const user = server.create('user', {
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

    await authenticateByEmail(user);

    // when
    await visit('/changer-mot-de-passe/brandone-reset-key');

    // then
    expect(currentURL()).to.equal('/changer-mot-de-passe/brandone-reset-key');
  });
});
