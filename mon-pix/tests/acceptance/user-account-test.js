import { click, currentURL, fillIn } from '@ember/test-helpers';
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

    it('should edit e-mail', async function() {
      // given
      const newEmail = 'new-email@example.net';
      await authenticateByEmail(user);
      await visit('/mon-compte');

      // when
      await click('button[data-test-edit-email]');
      await fillIn('#newEmail', newEmail);
      await fillIn('#newEmailConfirmation', newEmail);
      await click('button[data-test-submit-email]');

      // then
      expect(user.email).to.equal(newEmail);
    });
  });
});
