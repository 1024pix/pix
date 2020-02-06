import { click, fillIn, currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import {
  authenticateAsPrescriber,
  authenticateAsSimpleUser
} from '../helpers/testing';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Authentication', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
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
      it('should redirect to the /profil after connexion for usual users', async function() {
        // given
        await authenticateAsSimpleUser();

        // then
        expect(currentURL()).to.equal('/profil');
      });

      it('should redirect to the /board after connexion for users with organization', async function() {
        // given
        await authenticateAsPrescriber();

        // then
        expect(currentURL()).to.equal('/board');
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
