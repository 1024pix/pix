import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { authenticateAsPrescriber, authenticateAsSimpleProfileV2User, authenticateAsSimpleUser } from '../helpers/testing';
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

  describe('Success cases', function() {

    describe('Accessing to the /compte page while disconnected', async function() {
      it('should redirect to the connexion page', async function() {
        // when
        await visit('/compte');

        // then
        return andThen(function() {
          expect(currentURL()).to.equal('/connexion');
        });
      });
    });

    describe('Log-in phase', function() {
      it('should redirect to the /compte after connexion for usual users', async function() {
        // given
        await authenticateAsSimpleUser();

        // then
        return andThen(function() {
          expect(currentURL()).to.equal('/compte');
        });
      });

      it('should redirect to the /board after connexion for users with organization', async function() {
        // given
        await authenticateAsPrescriber();

        // then
        return andThen(function() {
          expect(currentURL()).to.equal('/board');
        });
      });

    });

  });

  describe('V2 Profile cases', function() {
    describe('New v2 users', function() {
      it('should be redirected to /profilv2 when they hit /compte', async function() {
        // given
        await authenticateAsSimpleProfileV2User();

        // when
        await visit('/compte');

        // then
        return andThen(function() {
          expect(currentURL()).to.equal('/profilv2');
        });
      });
    });
  });

  describe('Error case', function() {
    it('should stay in /connexion , when authentication failed', async function() {
      // given
      await visit('/connexion');
      fillIn('#email', 'anyone@pix.world');
      fillIn('#password', 'Pix20!!');

      // when
      click('.button');

      // then
      return andThen(function() {
        expect(currentURL()).to.equal('/connexion');
      });
    });
  });
});
