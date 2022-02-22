import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Participations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/campaigns/1/participations');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When user is logged in', function (hooks) {
    hooks.beforeEach(async () => {
      const user = server.create('user');
      await createAuthenticateSession({ userId: user.id });
    });

    test('it should display campaign participations', async function (assert) {
      server.create('campaign', { id: 1, name: 'Campaign name' });
      server.create('campaign-participation', { firstName: 'Georgette', lastName: 'Frimousse' });

      // when
      await visit('/campaigns/1/participations');

      // then
      assert.strictEqual(currentURL(), '/campaigns/1/participations');
      assert.contains('Georgette');
    });
  });
});
