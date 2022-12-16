import { module, test } from 'qunit';
import { currentURL, click } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

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

  module('When user is logged in as Super Admin', function (hooks) {
    hooks.beforeEach(async () => {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
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

    test('it should allow creation of a new organization', async function (assert) {
      // given & when
      const screen = await visit('/organizations/list');

      // then
      assert.dom(screen.getByRole('link', { name: 'Nouvelle organisation' })).exists();
    });

    module('when filters are used', function (hooks) {
      hooks.beforeEach(async () => {
        server.createList('organization', 12);
      });

      test('it should display the current filter when organizations are filtered by name', async function (assert) {
        // when
        const screen = await visit('/organizations/list?name=sav');

        // then
        assert.dom(screen.getByRole('textbox', { name: 'Nom' })).hasValue('sav');
      });

      test('it should display the current filter when organizations are filtered by type', async function (assert) {
        // when
        const screen = await visit('/organizations/list?type=SCO');

        // then
        assert.dom(screen.getByRole('textbox', { name: 'Type' })).hasValue('SCO');
      });

      test('it should display the current filter when organizations are filtered by externalId', async function (assert) {
        // when
        const screen = await visit('/organizations/list?externalId=1234567A');

        // then
        assert.dom(screen.getByRole('textbox', { name: 'Identifiant externe' })).hasValue('1234567A');
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

  module('When user is logged in as Certif', function () {
    test('it should not allow creation of a new organization', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isCertif: true })(server);

      // when
      const screen = await visit('/organizations/list');

      // then
      assert.dom(screen.queryByRole('link', { name: 'Nouvelle organisation' })).doesNotExist();
    });
  });
});
