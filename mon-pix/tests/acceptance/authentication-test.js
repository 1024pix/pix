import { click, fillIn, currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentification';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Authentication', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    defaultScenario(this.server);
    user = server.create('user', 'withEmail');
  });

  describe('Success cases', function() {

    describe('Accessing to the /profil page while disconnected', async function() {
      it('should redirect to the connexion page', async function() {
        // when
        await visitWithAbortedTransition('/profil');

        // then
        expect(currentURL()).to.equal('/connexion');
      });
    });

    describe('Log-in phase', function() {
      it('should redirect to the /profil after connexion', async function() {
        // given
        await authenticateByEmail(user);

        // then
        expect(currentURL()).to.equal('/profil');
      });
    });
  });

  describe('Error case', function() {
    it('should stay in /connexion , when authentication failed', async function() {
      // given
      await visitWithAbortedTransition('/connexion');
      await fillIn('#login', 'anyone@pix.world');
      await fillIn('#password', 'Pix20!!');

      // when
      await click('.button');

      // then
      expect(currentURL()).to.equal('/connexion');
    });
  });
});
