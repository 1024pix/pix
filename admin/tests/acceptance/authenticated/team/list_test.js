import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { visit, clickByName, selectByLabelAndOption } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { roles } from 'pix-admin/models/admin-member';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

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
      await authenticateAdminMemberWithRole({ role: 'SUPER_ADMIN' })(server);
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

    test('it should be possible to change the role of a member', async function (assert) {
      // given
      server.create('admin-member', { id: 5, firstName: 'Elise', lastName: 'Emoi', role: roles.SUPER_ADMIN });
      server.create('admin-member', { id: 3, firstName: 'Anne', lastName: 'Estésie', role: roles.SUPPORT });

      // when
      const screen = await visit('/equipe');
      await clickByName('Modifier le rôle de Anne Estésie');
      await selectByLabelAndOption('Sélectionner un rôle', roles.CERTIF);
      await clickByName('Valider la modification de rôle');

      // then
      assert.dom(screen.getByText('Anne Estésie a désormais le rôle CERTIF')).exists();
      assert.dom(screen.queryByRole('button', { name: 'Valider' })).doesNotExist();
    });

    test('it should show an error when modification is not successful and not modify user role', async function (assert) {
      // given
      server.create('admin-member', { id: 5, firstName: 'Elise', lastName: 'Emoi', role: roles.SUPER_ADMIN });
      server.create('admin-member', { id: 377, firstName: 'Anne', lastName: 'Estésie', role: roles.SUPPORT });

      this.server.patch(
        '/admin/admin-members/:id',
        () => ({
          errors: [{ detail: 'Erreur lors de la mise à jour du rôle du membre Pix Admin.' }],
        }),
        400
      );

      // when
      const screen = await visit('/equipe');
      await clickByName('Modifier le rôle de Anne Estésie');
      await selectByLabelAndOption('Sélectionner un rôle', roles.CERTIF);
      await clickByName('Valider la modification de rôle');

      // then
      assert.dom(screen.getByText('Erreur lors de la mise à jour du rôle du membre Pix Admin.')).exists();
      assert.dom(screen.getByText('SUPPORT')).exists();
      assert.dom(screen.queryByRole('button', { name: 'Valider' })).doesNotExist();
    });
  });
});
