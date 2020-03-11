import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session List', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/sessions/list');

      // then
      assert.equal(currentURL(), '/login');
    });
  });

  module('When user is logged in', function(hooks) {

    hooks.beforeEach(async () => {
      await authenticateSession({ userId: 1 });
    });

    test('it should be accessible for an authenticated user', async function(assert) {
      // when
      await visit('/sessions/list');

      // then
      assert.equal(currentURL(), '/sessions/list');
    });

    test('it should display the first page of the list of sessions', async function(assert) {
      // given
      server.createList('session', 60);

      // when
      await visit('/sessions/list');

      // then
      assert.dom('.table-admin tbody tr').exists({ count: 10 });
    });

    test('it should display the current filter when sessions are filtered', async function(assert) {
      // given
      server.createList('session', 60);

      // when
      await visit('/sessions/list?id=1');

      // then
      assert.dom('#id').hasValue('1');
    });
  });
});
