import { module, test } from 'qunit';
import { currentURL, click, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | User details personal information', (hooks) => {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user = null;

  hooks.beforeEach(async function() {
    const schoolingRegistration = this.server.create('schooling-registration', { firstName: 'John' });
    user = this.server.create('user', {
      'first-name': 'john',
      'last-name': 'harry',
      username: null,
      'is-authenticated-from-gar': false,
    });
    user.schoolingRegistrations = [schoolingRegistration];
    user.save();
    await createAuthenticateSession({ userId: user.id });
  });

  test('visiting /users/:id', async function(assert) {
    // when
    await visit(`/users/${user.id}`);

    // then
    assert.equal(currentURL(), `/users/${user.id}`);
  });

  module('when administrator click to edit users details', () => {

    test('should update user firstName, lastName and email', async function(assert) {
      // given
      await visit(`/users/${user.id}`);
      await click('button[aria-label="Modifier"]');

      // when
      await fillIn('#firstName', 'john');
      await fillIn('#lastName', 'doe');
      await fillIn('#email', 'john.doe@example.net');

      await click('button[aria-label="Editer"]');

      // then
      assert.dom('.user__first-name').hasText('john');
      assert.dom('.user__last-name').hasText('doe');
      assert.dom('.user__email').hasText('john.doe@example.net');
    });
  });

  module('when administrator click on anonymize button and confirm modal', () => {

    test('should anonymize the user', async function(assert) {
      // given
      await visit(`/users/${user.id}`);
      await click('button[aria-label="Anonymiser"]');

      // when
      await click('.modal-dialog .btn-primary');

      // then
      assert.contains(`prenom_${user.id}`);
      assert.contains(`nom_${user.id}`);
      assert.contains(`email_${user.id}@example.net`);
    });
  });

  module('when administrator click on dissociate button', () => {

    test('should not display dissociate button after', async function(assert) {
      // given
      await visit(`/users/${user.id}`);

      // when
      await click('button[data-test-dissociate]');

      // then
      assert.dom('button[data-test-dissociate]').doesNotExist();
    });
  });

});
