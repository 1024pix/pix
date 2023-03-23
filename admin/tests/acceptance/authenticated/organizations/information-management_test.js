import { module, test } from 'qunit';
import { currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { clickByName, visit, fillByLabel } from '@1024pix/ember-testing-library';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'ember-cli-mirage';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Organizations | Information management', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
  });

  module('editing organization', function () {
    test('should be able to edit organization information', async function (assert) {
      // given
      const organization = this.server.create('organization', { name: 'oldOrganizationName' });
      const screen = await visit(`/organizations/${organization.id}`);
      await clickByName('Éditer');

      // when
      await fillByLabel('* Nom', 'newOrganizationName');
      await fillByLabel('Prénom du DPO', 'Bru');
      await fillByLabel('Nom du DPO', 'No');
      await fillByLabel('Adresse e-mail du DPO', 'bru.no@example.net');
      await clickByName('Enregistrer', { exact: true });

      // then
      assert.dom(screen.getByRole('heading', { name: 'newOrganizationName', level: 2 })).exists();
      assert.dom(screen.getByText('Nom du DPO : Bru No')).exists();
      assert.dom(screen.getByText('Adresse e-mail du DPO : bru.no@example.net')).exists();
    });
  });

  module('when organization is archived', function () {
    test('should redirect to organization target profiles page', async function (assert) {
      // given
      const organization = this.server.create('organization', {
        name: 'oldOrganizationName',
        archivedAt: '2022-12-25',
        archivistFullName: 'Clément Tine',
      });

      // when
      await visit(`/organizations/${organization.id}`);

      // then
      assert.strictEqual(currentURL(), `/organizations/${organization.id}/target-profiles`);
    });

    test('should not allow user to access team page', async function (assert) {
      // given
      const organization = this.server.create('organization', {
        name: 'oldOrganizationName',
        archivedAt: '2022-12-25',
        archivistFullName: 'Clément Tine',
      });

      // when
      const screen = await visit(`/organizations/${organization.id}/team`);

      // then
      assert.dom(screen.queryByLabelText('Équipe', { selector: 'a' })).doesNotExist();
      assert.strictEqual(currentURL(), `/organizations/${organization.id}/target-profiles`);
    });

    test('should not allow user to access invitation page', async function (assert) {
      // given
      const organization = this.server.create('organization', {
        name: 'oldOrganizationName',
        archivedAt: '2022-12-25',
        archivistFullName: 'Clément Tine',
      });

      // when
      const screen = await visit(`/organizations/${organization.id}/invitations`);

      // then
      assert.dom(screen.queryByLabelText('Invitations')).doesNotExist();
      assert.strictEqual(currentURL(), `/organizations/${organization.id}/target-profiles`);
    });
  });

  module('when organization is not archived', function () {
    module('when user click on archive button', function () {
      test('should display confirmation modal', async function (assert) {
        // given
        const organization = this.server.create('organization', {
          name: 'Aude Javel Company',
        });
        const screen = await visit(`/organizations/${organization.id}`);

        // when
        await clickByName("Archiver l'organisation");

        await screen.findByRole('dialog');

        // then
        assert.dom(screen.getByRole('heading', { name: "Archiver l'organisation Aude Javel Company" })).exists();
        assert.dom(screen.getByText('Êtes-vous sûr de vouloir archiver cette organisation ?')).exists();
      });
      module('when user click on cancel actions', function () {
        test('should close confirmation modal with cancel button', async function (assert) {
          // given
          const organization = this.server.create('organization', {
            name: 'Aude Javel Company',
          });
          const screen = await visit(`/organizations/${organization.id}`);
          await clickByName("Archiver l'organisation");

          await screen.findByRole('dialog');

          // when
          await clickByName('Annuler');

          // then
          assert.dom(screen.queryByLabelText('Archivée le 02/02/2022 par Clément Tine.')).doesNotExist();
        });
        test('should close confirmation modal with modal close button', async function (assert) {
          // given
          const organization = this.server.create('organization', {
            name: 'Aude Javel Company',
          });
          const screen = await visit(`/organizations/${organization.id}`);
          await clickByName("Archiver l'organisation");

          await screen.findByRole('dialog');
          // when
          await click(screen.getByRole('button', { name: 'Fermer' }));

          // then
          assert.dom(screen.queryByLabelText('Archivée le 02/02/2022 par Clément Tine.')).doesNotExist();
        });
      });
    });

    test('should archive organization and display archiving details', async function (assert) {
      // given
      const organization = this.server.create('organization', {
        name: 'Aude Javel Company',
      });
      const screen = await visit(`/organizations/${organization.id}`);
      await clickByName("Archiver l'organisation");

      await screen.findByRole('dialog');
      // when
      await clickByName('Confirmer');

      // then
      assert.dom(screen.getByText('Cette organisation a bien été archivée.')).exists();
      assert.dom(screen.getByText('Archivée le 02/02/2022 par Clément Tine.')).exists();
    });

    test('should display error notification when archiving was not successful', async function (assert) {
      // given
      const organization = this.server.create('organization', {
        name: 'Aude Javel Company',
      });
      const errorResponse = new Response(
        422,
        {},
        {
          errors: [
            {
              status: '422',
            },
          ],
        }
      );
      this.server.post('/admin/organizations/:id/archive', () => errorResponse);
      const screen = await visit(`/organizations/${organization.id}`);
      await clickByName("Archiver l'organisation");

      await screen.findByRole('dialog');
      // when
      await clickByName('Confirmer');

      // then
      assert.dom(screen.getByText("L'organisation n'a pas pu être archivée.")).exists();
      assert.dom(screen.queryByLabelText('Archivée le 02/02/2022 par Clément Tine.')).doesNotExist();
    });

    test('should display error notification for other errors', async function (assert) {
      // given
      const organization = this.server.create('organization', {
        name: 'Aude Javel Company',
      });
      const errorResponse = new Response(
        500,
        {},
        {
          errors: [
            {
              status: '500',
            },
          ],
        }
      );
      this.server.post('/admin/organizations/:id/archive', () => errorResponse);
      const screen = await visit(`/organizations/${organization.id}`);
      await clickByName("Archiver l'organisation");

      await screen.findByRole('dialog');
      // when
      await clickByName('Confirmer');

      // then
      assert.dom(screen.getByText('Une erreur est survenue.')).exists();
      assert.dom(screen.queryByLabelText('Archivée le 02/02/2022 par Clément Tine.')).doesNotExist();
    });
  });
});
