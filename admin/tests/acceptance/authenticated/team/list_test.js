import { module, test } from 'qunit';
import { currentURL, click } from '@ember/test-helpers';
import { visit, clickByName } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
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

  module('When user is logged in', function () {
    test('it should not be accessible when admin member is not super admin', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: false })(server);

      // when
      await visit('/equipe');

      // then
      assert.strictEqual(currentURL(), '/organizations/list');
    });

    test('it should be possible to change the role of an admin member', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      server.create('admin-member', {
        id: 5,
        firstName: 'Elise',
        lastName: 'Emoi',
        role: 'SUPER_ADMIN',
        isSuperAdmin: true,
      });
      server.create('admin-member', {
        id: 3,
        firstName: 'Anne',
        lastName: 'Estésie',
        role: 'SUPPORT',
        isSupport: true,
      });

      // when
      const screen = await visit('/equipe');
      await clickByName("Modifier le rôle de l'agent Anne Estésie");
      await click(screen.getByRole('button', { name: 'Sélectionner un rôle' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'CERTIF' }));
      await clickByName('Valider la modification de rôle');

      // then
      assert.dom(screen.getByText("L'agent Anne Estésie a désormais le rôle CERTIF")).exists();
      assert.dom(screen.queryByRole('button', { name: 'Valider' })).doesNotExist();
    });

    test('it should be possible to disable an admin member', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({
        isSuperAdmin: true,
      })(server);
      server.create('admin-member', {
        id: 5,
        firstName: 'Elise',
        lastName: 'Emoi',
        role: 'SUPER_ADMIN',
        isSuperAdmin: true,
      });
      server.create('admin-member', {
        id: 3,
        firstName: 'Anne',
        lastName: 'Estésie',
        role: 'SUPPORT',
        isSupport: true,
      });

      // when
      const screen = await visit('/equipe');
      await clickByName("Désactiver l'agent Anne Estésie");

      await screen.findByRole('dialog');

      await clickByName('Confirmer');

      // then
      assert.dom(screen.queryByText('Anne')).doesNotExist();
      assert.dom(screen.queryByText('Estésie')).doesNotExist();
    });

    test('it should show an error when modification is not successful and not modify admin member role', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      server.create('admin-member', {
        id: 5,
        firstName: 'Elise',
        lastName: 'Emoi',
        role: 'SUPER_ADMIN',
        isSuperAdmin: true,
      });
      server.create('admin-member', {
        id: 377,
        firstName: 'Anne',
        lastName: 'Estésie',
        role: 'SUPPORT',
        isSupport: true,
      });

      this.server.patch(
        '/admin/admin-members/:id',
        () => ({
          errors: [
            {
              code: 'UPDATE_ADMIN_MEMBER_ERROR',
              detail: 'A problem occured while trying to update an admin member role',
              status: '422',
              title: 'Unprocessable entity',
            },
          ],
        }),
        422
      );

      // when
      const screen = await visit('/equipe');
      await clickByName("Modifier le rôle de l'agent Anne Estésie");
      await click(screen.getByRole('button', { name: 'Sélectionner un rôle' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'CERTIF' }));
      await clickByName('Valider la modification de rôle');

      // then
      assert.dom(screen.getByText('Erreur lors de la mise à jour du rôle de cet agent Pix.')).exists();
      assert.dom(screen.getByRole('row', { name: 'Anne Estésie' })).includesText('SUPPORT');
      assert.dom(screen.queryByRole('button', { name: 'Valider' })).doesNotExist();
    });
  });
});
