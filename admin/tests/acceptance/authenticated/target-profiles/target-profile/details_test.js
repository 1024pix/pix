import { click, currentURL } from '@ember/test-helpers';
import { fillByLabel, clickByName, visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';

module('Acceptance | Target Profiles | Target Profile | Details', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // given
      server.create('target-profile', { id: 1 });

      // when
      await visit('/target-profiles/1');

      // then
      assert.deepEqual(currentURL(), '/login');
    });
  });

  module('When user is logged in', function () {
    module('when admin member has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function (hooks) {
      hooks.beforeEach(async () => {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      });

      test('it should be accessible for an authenticated user', async function (assert) {
        // given
        server.create('target-profile', { id: 1, isNewFormat: true });

        // when
        await visit('/target-profiles/1');

        // then
        assert.deepEqual(currentURL(), '/target-profiles/1');
      });

      test('it should display target profile details', async function (assert) {
        // given
        server.create('target-profile', {
          id: 1,
          name: 'Profil Cible Fantastix',
          isPublic: true,
          outdated: false,
          ownerOrganizationId: 456,
          description: 'Top profil cible.',
          comment: 'Commentaire Privé.',
          category: 'SUBJECT',
          isSimplifiedAccess: true,
          isNewFormat: true,
        });

        // when
        const screen = await visit('/target-profiles/1');

        // then
        assert.dom(screen.getByRole('heading', { name: 'Profil Cible Fantastix' })).exists();
        assert.dom(screen.getByText('Thématiques')).exists();
        assert.dom(screen.getByText('ID : 1')).exists();
        assert.dom(screen.getByText('Public : Oui')).exists();
        assert.dom(screen.getByText('Obsolète : Non')).exists();
        assert.dom(screen.getByText('Parcours Accès Simplifié : Oui')).exists();
        assert.dom(screen.getByText('456')).exists();
        assert.dom(screen.getByText('Top profil cible.')).exists();
        assert.dom(screen.getByText('Commentaire Privé.')).exists();
      });

      test('it should redirect to organization details on click', async function (assert) {
        // given
        server.create('organization', { id: 456 });
        server.create('target-profile', { id: 1, ownerOrganizationId: 456, isNewFormat: true });
        await visit('/target-profiles/1');

        // when
        await click('a[href="/organizations/456"]');

        // then
        assert.deepEqual(currentURL(), '/organizations/456/team');
      });

      test('it should display target profile organizations', async function (assert) {
        // given
        server.create('organization', { id: 1, name: 'Fantastix', type: 'PRO', externalId: '123' });
        server.create('target-profile', { id: 1, name: 'Profil Cible', isNewFormat: true });

        // when
        const screen = await visit('/target-profiles/1/organizations');

        // then
        assert.dom(screen.getByText('Fantastix')).exists();
        assert.dom(screen.getByText('PRO')).exists();
        assert.dom(screen.getByText('123')).exists();
      });

      test('it should switch to edition mode', async function (assert) {
        // given
        server.create('target-profile', {
          id: 1,
          name: 'Profil Cible Fantastix',
          isPublic: true,
          outdated: false,
          ownerOrganizationId: 456,
          isNewFormat: true,
        });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Éditer');

        // then
        assert.dom(screen.queryByLabelText('Éditer')).doesNotExist();
      });

      test('it should outdate target profile', async function (assert) {
        // given
        server.create('target-profile', {
          id: 1,
          name: 'Profil Cible Fantastix',
          isPublic: true,
          outdated: false,
          ownerOrganizationId: 456,
          isNewFormat: true,
        });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Marquer comme obsolète');

        await screen.findByRole('dialog');

        await clickByName('Oui, marquer comme obsolète');

        // then
        assert.dom(screen.getByText('Obsolète : Oui')).exists();
      });

      test('it should not outdate target profile', async function (assert) {
        // given
        server.create('target-profile', {
          id: 1,
          name: 'Profil Cible Fantastix',
          isPublic: true,
          outdated: false,
          ownerOrganizationId: 456,
          isNewFormat: true,
        });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Marquer comme obsolète');

        await screen.findByRole('dialog');

        await clickByName('Non, annuler');

        // then
        assert.dom(screen.getByText('Obsolète : Non')).exists();
      });

      test('it should edit target profile name', async function (assert) {
        // given
        server.create('target-profile', {
          id: 1,
          name: 'Profil Cible Fantastix',
          isPublic: true,
          outdated: false,
          ownerOrganizationId: 456,
          category: 'OTHER',
          isNewFormat: true,
        });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Éditer');
        await fillByLabel('* Nom', 'Profil Cible Fantastix Edited');
        await clickByName('Enregistrer');

        // then
        assert.dom(screen.getByRole('heading', { name: 'Profil Cible Fantastix Edited' })).exists();
        assert.dom(screen.queryByLabelText('Enregistrer')).doesNotExist();
      });

      test('it should edit target profile category', async function (assert) {
        // given
        server.create('target-profile', {
          id: 1,
          name: 'Profil Cible Fantastix',
          isPublic: true,
          outdated: false,
          ownerOrganizationId: 456,
          category: 'OTHER',
          isNewFormat: true,
        });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Éditer');
        await fillByLabel('Catégorie :', 'CUSTOM');
        await clickByName('Enregistrer');

        // then
        assert.dom(screen.getByText('Parcours sur-mesure')).exists();
        assert.dom(screen.queryByLabelText('Enregistrer')).doesNotExist();
      });

      test('it should mark target profile as simplified access', async function (assert) {
        // given
        server.create('target-profile', {
          id: 1,
          name: 'Profil Cible Accès',
          ownerOrganizationId: 123,
          isSimplifiedAccess: false,
          isNewFormat: true,
        });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Marquer comme accès simplifié');

        await screen.findByRole('dialog');

        await clickByName('Oui, marquer comme accès simplifié');

        // then
        assert.dom(screen.getByText('Parcours Accès Simplifié : Oui')).exists();
      });

      module('When target profile is already simplified access', function () {
        test('it should not display button', async function (assert) {
          // given
          server.create('target-profile', {
            id: 1,
            name: 'Profil Cible Accès',
            ownerOrganizationId: 123,
            isSimplifiedAccess: true,
            isNewFormat: true,
          });

          // when
          const screen = await visit('/target-profiles/1');

          // then
          assert.dom(screen.queryByLabelText('Marquer comme accès simplifié')).doesNotExist();
        });
      });
    });

    module('when admin member has role "CERTIF"', function () {
      test('it should be redirected to Organizations list page', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isCertif: true })(server);
        server.create('target-profile', { id: 1 });

        // when
        await visit('/target-profiles/1');

        // then
        assert.deepEqual(currentURL(), '/organizations/list');
      });
    });
  });
});
