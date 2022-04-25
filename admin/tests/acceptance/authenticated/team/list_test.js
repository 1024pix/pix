import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Team | List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/equipe');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When user is logged in', function (hooks) {
    hooks.beforeEach(async () => {
      const user = server.create('user');
      await createAuthenticateSession({ userId: user.id });
    });

    test('it should be accessible for an authenticated user', async function (assert) {
      // when
      await visit('/equipe');

      // then
      assert.strictEqual(currentURL(), '/equipe');
    });

    test('it should list all team members', async function (assert) {
      // given
      server.create('admin-member', { id: 1, firstName: 'Marie', lastName: 'Tim' });
      server.create('admin-member', { id: 2, firstName: 'Alain', lastName: 'Térieur' });

      // when
      const screen = await visit('/equipe');

      // then
      assert.dom(screen.getByLabelText('Marie Tim')).exists();
      assert.dom(screen.getByLabelText('Alain Térieur')).exists();
    });
  });
});
