import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | User List', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/users/list');

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
      await visit('/users/list');

      // then
      assert.equal(currentURL(), '/users/list');
    });

    test('it should list the users', async function(assert) {
      // given
      server.createList('user', 12);

      // when
      await visit('/users/list');

      // then
      assert.dom('.user-list .table-admin tbody tr').exists({ count: 12 });
    });

    test('it should display the current filter when users are filtered', async function(assert) {
      // given
      server.createList('user', 12);

      // when
      await visit('/users/list?email=sav');

      // then
      assert.dom('#email').hasValue('sav');
    });
  });
});
