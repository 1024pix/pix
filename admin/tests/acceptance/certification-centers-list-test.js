import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Certification-centers List', (hooks) => {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', () => {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/certification-centers/list');

      // then
      assert.equal(currentURL(), '/login');
    });
  });

  module('When user is logged in', (hooks) => {

    hooks.beforeEach(async () => {
      await createAuthenticateSession({ userId: 1 });
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
      server.createList('certification-center', 1, { type: 'PRO' });
      server.createList('certification-center', 2, { type: 'SCO' });
      server.createList('certification-center', 3, { type: 'SUP' });

      // when
      await visit('/certification-centers/list?type=sup');

      // then
      assert.dom('#type').hasValue('sup');
    });

    test('should go to certification center page when line is clicked', async function(assert) {
      // given
      server.createList('certification-center', 1);
      await visit('/certification-centers/list');

      // when
      await click('tr[aria-label="Centre de certification"]:first-child');

      // then
      assert.equal(currentURL(), '/certification-centers/1');
    });
  });
});
