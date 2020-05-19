import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupApplicationTest } from 'ember-mocha';
import { click, fillIn, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';

import visit from '../helpers/visit';

import { authenticateByEmail, authenticateByUsername } from '../helpers/authentication';

describe('Acceptance | Authentication', function() {

  setupApplicationTest();
  setupMirage();

  let user;

  beforeEach(function() {
    user = server.create('user', 'withEmail');
  });

  describe('Success cases', function() {

    describe('Accessing to the /profil page while disconnected', async function() {

      it('should redirect to the connexion page', async function() {
        // when
        await visit('/profil');

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
      await visit('/connexion');
      await fillIn('#login', 'anyone@pix.world');
      await fillIn('#password', 'Pix20!!');

      // when
      await click('.button');

      // then
      expect(currentURL()).to.equal('/connexion');
    });

    it('should redirect to /update-expired-password, when user use one time password', async function() {
      // given
      user = server.create('user', 'withUsername', 'shouldChangePassword');

      // when
      await authenticateByUsername(user);

      // then
      expect(currentURL()).to.equal('/mise-a-jour-mot-de-passe-expire');
    });
  });
});
