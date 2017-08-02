import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | Espace compte', function() {

  let application;

  beforeEach(function() {
    application = startApp();

    server.create('user', {
      id: 1,
      firstName: 'François',
      lastName: 'Hisquin',
      email: 'fhi@octo.com',
      password: 'FHI4EVER',
      cgu: true,
      recaptchaToken: 'recaptcha-token-xxxxxx',
      competenceIds: []
    });

  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('m1.1 Accessing to the /compte page while disconnected', function() {
    it('should redirect to the connexion page', function() {
      // when
      visit('/compte');

      // then
      return andThen(function() {
        expect(currentURL()).to.equal('/');
      });
    });
  });

  describe('m1.2 Log-in phase', function() {
    it('should redirect to the /compte after connexion', function() {
      // given
      visit('/connexion');
      fillIn('#pix-email', 'fhi@octo.com');
      fillIn('#pix-password', 'FHI4EVER');

      // when
      click('.signin-form__submit_button');

      // then
      return andThen(function() {
        expect(currentURL()).to.equal('/compte');
      });
    });
  });

});
