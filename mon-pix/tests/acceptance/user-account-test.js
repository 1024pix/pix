import { currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { authenticateByEmail } from '../helpers/authentication';
import { expect } from 'chai';
import { click, fillIn, find, visit } from '@ember/test-helpers';
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

  it('should update user email on click to save button', async function() {
    // given
    const newEmail = 'new_email@example.net';

    await authenticateByEmail(user);
    await visit('/mon-compte');
    await click('button[data-test-modify-button]');
    await fillIn('input[data-test-modify-email-input]', newEmail);

    // when
    await click('button[data-test-save-button]');

    // then
    expect(find('span[data-test-email]').textContent).to.equal(newEmail);
  });
});
