import { module, test } from 'qunit';
import { currentURL, visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Organization List', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/organizations/list');

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
      await visit('/organizations/list');

      // then
      assert.equal(currentURL(), '/organizations/list');
    });

    test('it should list the organizations', async function(assert) {
      // given
      server.createList('organization', 12);

      // when
      await visit('/organizations/list');

      // then
      assert.dom('.organization-list .table-admin tbody tr').exists({ count: 12 });
    });

    test('it should display the current filter when organizations are filtered', async function(assert) {
      // given
      server.createList('organization', 12);

      // when
      await visit('/organizations/list?name=sav');

      // then
      assert.dom('#name').hasValue('sav');
    });

    test('it should redirect to organization details on click', async function(assert) {
      // given
      server.create('organization', { id: 1 });
      await visit('/organizations/list');

      // when
      await click('.organization-list .table-admin tbody tr:first-child');

      // then
      assert.equal(currentURL(), '/organizations/1');
    });
  });
});
