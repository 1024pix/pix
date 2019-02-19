import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembership } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Details', function (hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  module('When user is not logged in', function () {

    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // given
      server.create('session', { id: 1 });

      // when
      await visit('/sessions/1');

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When user is logged in', function () {

    hooks.beforeEach( async () => {
      user = createUserWithMembership();
    });

    test('it should be accessible for an authenticated user', async function (assert) {
      // given
      await authenticateSession({
        user_id: user.id,
      });
      server.create('session', { id: 1 });

      // when
      await visit('/sessions/1');

      // then
      assert.equal(currentURL(), '/sessions/1');
    });

    test('it should redirect to update page on click on update button', async function (assert) {
      // given
      await authenticateSession({
        user_id: user.id,
      });
      server.create('session', { id: 1 });
      await visit('/sessions/1');

      // when
      await click('.session-details-content__update-button');

      // then
      assert.equal(currentURL(), '/sessions/1/modification');
    });

    test('it should redirect to update page on click on return button', async function (assert) {
      // given
      await authenticateSession({
        user_id: user.id,
      });
      server.create('session', { id: 1 });
      await visit('/sessions/1');

      // when
      await click('.session-details-content__return-button');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });
  });
});
