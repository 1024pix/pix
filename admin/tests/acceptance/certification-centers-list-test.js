import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Certification-centers List', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/certification-centers/list');

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
      await visit('/certification-centers/list');

      // then
      assert.equal(currentURL(), '/certification-centers/list');
    });

    test('it should list the certification-centers', async function(assert) {
      // given
      server.createList('certification-center', 12);

      // when
      await visit('/certification-centers/list');

      // then
      assert.dom('.table-admin tbody tr').exists({ count: 12 });
    });

    test('it should display the current filter when certification-centers are filtered', async function(assert) {
      // given
      server.createList('certification-center', 12);

      // when
      await visit('/certification-centers/list?type=sup');

      // then
      assert.dom('#type').hasValue('sup');
    });
  });
});
