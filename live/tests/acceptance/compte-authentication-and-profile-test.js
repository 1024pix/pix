import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { startApp, destroyApp } from '../helpers/application';
import { authenticateAsSimpleUser, authenticateAsPrescriber } from '../helpers/testing';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | Espace compte | Authentication', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Logged Menu', function() {
    describe('after visiting the project page', function() {
      it('should redirect to /compte user "Mon compte"', function() {
        // given
        authenticateAsSimpleUser();
        visit('/projet');

        // when
        click('.logged-user-name__link');
        click('a:contains("Mon compte")');

        // then
        return andThen(function() {
          expect(currentURL()).to.equal('/compte');
        });
      });
    });
  });

  describe('Success cases', function() {

    describe('m1.1 Accessing to the /compte page while disconnected', function() {
      it('should redirect to the connexion page', function() {
        // when
        visit('/compte');

        // then
        return andThen(function() {
          expect(currentURL()).to.equal('/connexion');
        });
      });
    });

    describe('Log-in phase', function() {
      it('should redirect to the /compte after connexion for usual users', function() {
        // given
        authenticateAsSimpleUser();

        // then
        return andThen(function() {
          expect(currentURL()).to.equal('/compte');
        });
      });

      it('should redirect to the /board after connexion for users with organization', function() {
        // given
        authenticateAsPrescriber();

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
