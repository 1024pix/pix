import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | Espace compte', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Success cases', function() {
    beforeEach(function() {
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

      function seedDatabaseForUsualUser() {
        server.loadFixtures('areas');
        server.loadFixtures('competences');
        server.create('user', {
          id: 1,
          firstName: 'Samurai',
          lastName: 'Jack',
          email: 'samurai.jack@aku.world',
          password: 'B@ck2past',
          cgu: true,
          recaptchaToken: 'recaptcha-token-xxxxxx',
          competenceIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
        });
      }

      function seedDatabaseForUserWithOrganization() {
        server.loadFixtures('organizations');
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

      function authenticateUser() {
        // given
        visit('/connexion');
        fillIn('#pix-email', 'samurai.jack@aku.world');
        fillIn('#pix-password', 'B@ck2past');

        // when
        click('.signin-form__submit_button');
      }

      it('should redirect to the /compte after connexion for usual users', function() {
        // given
        seedDatabaseForUsualUser();
        authenticateUser();

        // then
        return andThen(function() {
          expect(currentURL()).to.equal('/compte');
        });
      });

      it('should redirect to the /board after connexion for users with organization', function() {
        // given
        seedDatabaseForUserWithOrganization();
        authenticateUser();

        // then
        return andThen(function() {
          expect(currentURL()).to.equal('/board');
        });
      });

    });

  });

  describe('Error case', function() {

    function authenticateUnknownUser() {
      // given
      visit('/connexion');
      fillIn('#pix-email', 'anyone@pix.world');
      fillIn('#pix-password', 'Pix20!!');

      // when
      click('.signin-form__submit_button');
    }

    it('should stay in /connexion , when authentication failed', function() {
      // given
      authenticateUnknownUser();

      return andThen(function() {
        expect(currentURL()).to.equal('/connexion');
      });
    });
  });
});
