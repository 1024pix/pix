import { module, test } from 'qunit';
import { currentURL, click } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Organizations | List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/organizations/list');

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
      await visit('/organizations/list');

      // then
      assert.strictEqual(currentURL(), '/organizations/list');
    });

    test('it should list the organizations', async function (assert) {
      // given
      server.create('organization', { name: 'Tic' });
      server.create('organization', { name: 'Tac' });

      // when
      const screen = await visit('/organizations/list');

      // then
      assert.dom(screen.getByLabelText('Organisation Tic')).exists();
      assert.dom(screen.getByLabelText('Organisation Tac')).exists();
    });

    module('when filters are used', function (hooks) {
      hooks.beforeEach(async () => {
        server.createList('organization', 12);
      });

      test('it should display the current filter when organizations are filtered by name', async function (assert) {
        // when
        await visit('/organizations/list?name=sav');

        // then
        assert.dom('#name').hasValue('sav');
      });

      test('it should display the current filter when organizations are filtered by type', async function (assert) {
        // when
        await visit('/organizations/list?type=SCO');

        // then
        assert.dom('#type').hasValue('SCO');
      });

      test('it should display the current filter when organizations are filtered by externalId', async function (assert) {
        // when
        await visit('/organizations/list?externalId=1234567A');

        // then
        assert.dom('#externalId').hasValue('1234567A');
      });
    });

    test('it should redirect to organization details on click', async function (assert) {
      // given
      server.create('organization', { id: 1 });
      const screen = await visit('/organizations/list');

      // when
      await click(screen.getByRole('link', { name: '1' }));

      // then
      assert.strictEqual(currentURL(), '/organizations/1/team');
    });
  });
});
