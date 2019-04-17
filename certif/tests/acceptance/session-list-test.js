import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembership } from '../helpers/test-init';
import { waitFor } from '@ember/test-helpers';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session List', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  module('When user is not authenticated', function() {

    test('it should not be accessible', async function(assert) {
      // when
      await visit('/sessions/liste');

      // then
      assert.equal(currentURL(), '/connexion');
    });

  });

  module('When user is authenticated', function() {

    hooks.beforeEach(async () => {
      user = createUserWithMembership();
    });

    test('it should be accessible', async function(assert) {
      // given
      await authenticateSession({
        user_id: user.id,
      });

      // when
      await visit('/sessions/liste');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });

    test('it should show title indicating that the user can create a session', async function(assert) {
      // given
      await authenticateSession({
        user_id: user.id,
      });

      // when
      await visit('/sessions/liste');

      // then
      assert.dom('.page-title').hasText('Créez votre première session de certification');
    });

    test('it should list the sessions', async function(assert) {
      // given
      server.createList('session', 12);

      await authenticateSession({
        user_id: user.id,
      });

      // when
      await visit('/sessions/liste');

      // then
      assert.dom('table tbody tr').exists({ count: 12 });
    });

    test('it should redirect to detail page of session id 1 on click on first row', async function(assert) {
      // given
      const user = createUserWithMembership();
      server.createList('session', 2);

      await authenticateSession({
        user_id: user.id,
      });

      await visit('/sessions/liste');
      await waitFor('table tbody tr');

      // when
      await click('table tbody tr:nth-child(1)');

      // then
      assert.equal(currentURL(), '/sessions/1');
    });
  });
});
