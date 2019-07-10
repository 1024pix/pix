import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | Reset Password Form', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('can visit /changer-mot-de-passe', async function() {
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
    fillIn('#password', 'newPass12345!');

    // when
    await click('.button');

    // then
    return andThen(() => {
      expect(currentURL()).to.equal('/changer-mot-de-passe/brandone-reset-key');
      expect(find('.sign-form__body').text()).to.contain('Votre mot de passe a été modifié avec succès');
    });

  });
});
