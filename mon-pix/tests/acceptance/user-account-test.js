import { currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { authenticateByEmail } from '../helpers/authentication';
import { expect } from 'chai';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | User account page', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    user = server.create('user', 'withEmail');
  });

  describe('Access to the user account page', function() {

    it('should not be accessible when user is not connected', async function() {
      // when
      await visit('/mon-compte');

      // then
      expect(currentURL()).to.equal('/connexion');
    });

    it('should be accessible when user is connected', async function() {
      // given
      await authenticateByEmail(user);

      // when
      await visit('/mon-compte');

      // then
      expect(currentURL()).to.equal('/mon-compte');
    });
  });
});
