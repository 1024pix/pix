import { module, test } from 'qunit';
import { currentURL, click, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | User details personal information', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user = null;

  hooks.beforeEach(async function() {
    user = this.server.create('user', {
      'first-name': 'john',
      'last-name': 'harry',
      username: null,
      'is-authenticated-from-gar': false
    });
    await createAuthenticateSession({ userId: user.id });
  });

  test('visiting /users/:id', async function(assert) {

    // when
    await visit(`/users/${user.id}`);

    // then
    assert.equal(currentURL(), `/users/${user.id}`);
  });

  module('when administrator click to edit users details', function() {

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

  module('when administrator click on anonymize button and confirm modal', function() {

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

});
