import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { startApp, destroyApp } from '../helpers/application';
import seeds from '../helpers/seeds';
import testing from '../helpers/testing';

describe('Acceptance | Espace compte', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Success cases', function() {
    describe('m1.1 Accessing to the /compte page while disconnected', function() {
      it('should redirect to the connexion page', function() {
        // given
        seeds.injectUserAccount();

        // when
        visit('/compte');

        // then
        return andThen(function() {
          expect(currentURL()).to.equal('/connexion');
        });
      });
    });

    describe('m1.2 Log-in phase', function() {

      function seedDatabaseForUserWithOrganization() {
        server.create('organization', {
          id: 1,
          name: 'LexCorp',
          email: 'lex@lexcorp.com',
          type: 'PRO',
          code: 'ABCD66',
        });
        server.create('user', {
          id: 1,
          firstName: 'Samurai',
          lastName: 'Jack',
          email: 'samurai.jack@aku.world',
          password: 'B@ck2past',
          cgu: true,
          recaptchaToken: 'recaptcha-token-xxxxxx',
          organizationIds: [1]
        });
      }

      it('should redirect to the /compte after connexion for usual users', function() {
        // given
        seeds.injectUserAccount();
        testing.authenticateUser();

        // then
        return andThen(function() {
          expect(currentURL()).to.equal('/compte');
        });
      });

      it('should redirect to the /board after connexion for users with organization', function() {
        // given
        seedDatabaseForUserWithOrganization();
        testing.authenticateUser();

        // then
        return andThen(function() {
          expect(currentURL()).to.equal('/board');
        });
      });

    });

  });

  describe('Error case', function() {
    it('should stay in /connexion , when authentication failed', function() {
      // given
      visit('/connexion');
      fillIn('#pix-email', 'anyone@pix.world');
      fillIn('#pix-password', 'Pix20!!');

      // when
      click('.signin-form__submit_button');

      // then
      return andThen(function() {
        expect(currentURL()).to.equal('/connexion');
      });
    });
  });
});
