import { currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { authenticateByEmail } from '../helpers/authentication';
import { expect } from 'chai';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | User dashboard page', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    user = server.create('user', 'withEmail');
  });

  afterEach(function() {
  });

  describe('Access to the user dashboard page', function() {

    it('should not be accessible when user is not connected', async function() {
      // when
      await visit('/accueil');

      // then
      expect(currentURL()).to.equal('/connexion');
    });

    it('should be accessible when user is connected', async function() {
      // given
      await authenticateByEmail(user);

      // when
      await visit('/accueil');

      // then
      expect(currentURL()).to.equal('/accueil');
    });
  });
});
