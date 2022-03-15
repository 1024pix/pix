import { module, test } from 'qunit';
import { currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { clickByName, visit } from '@1024pix/ember-testing-library';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import fillInByLabel from '../../../helpers/extended-ember-test-helpers/fill-in-by-label';
import { Response } from 'ember-cli-mirage';

module('Acceptance | Organizations | Information management', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { id: userId } = server.create('user');
    await createAuthenticateSession({ userId });
  });

  module('editing organization', function () {
    test('should be able to edit organization information', async function (assert) {
      // given
      const organization = this.server.create('organization', { name: 'oldOrganizationName' });
      await visit(`/organizations/${organization.id}`);
      await clickByName('Éditer');

      // when
      await fillInByLabel('* Nom', 'newOrganizationName');
      await clickByName('Enregistrer', { exact: true });

      // then
      assert.contains('newOrganizationName');
    });
  });

  module('when organization is archived', function () {
    test('should redirect to organization target profiles page', async function (assert) {
      // given
      const organization = this.server.create('organization', {
        name: 'oldOrganizationName',
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
        archivistFullName: 'Clément Tine',
      });

      // when
      const screen = await visit(`/organizations/${organization.id}/team`);

      // then
      assert.dom(screen.queryByLabelText('Équipe')).doesNotExist();
      assert.strictEqual(currentURL(), `/organizations/${organization.id}/target-profiles`);
    });

    test('should not allow user to access invitation page', async function (assert) {
      // given
      const organization = this.server.create('organization', {
        name: 'oldOrganizationName',
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

      // when
      await clickByName('Confirmer');

      // then
      assert.dom(screen.getByText('Une erreur est survenue.')).exists();
      assert.dom(screen.queryByLabelText('Archivée le 02/02/2022 par Clément Tine.')).doesNotExist();
    });
  });
});
