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

  context('When user is not connected', function() {

    it('should be redirected to connection page', async function() {
      // when
      await visit('/mon-compte');

      // then
      expect(currentURL()).to.equal('/connexion');
    });
  });

  context('When user is connected', function() {

    let user;

    beforeEach(function() {
      user = server.create('user', 'withEmail');
    });

    it('should display my account page', async function() {
      // given
      await authenticateByEmail(user);

      // when
      await visit('/mon-compte');

      // then
      expect(currentURL()).to.equal('/mon-compte');
    });

    it('should be able to edit the email', async function() {
      // given
      const newEmail = 'new-email@example.net';
      await authenticateByEmail(user);
      await visit('/mon-compte');

      // when
      await click('button[data-test-edit-email]');
      await fillIn('#newEmail', newEmail);
      await fillIn('#newEmailConfirmation', newEmail);
      await fillIn('#password', user.password);
      await click('button[data-test-submit-email]');

      // then
      expect(user.email).to.equal(newEmail);
    });
  });
});
