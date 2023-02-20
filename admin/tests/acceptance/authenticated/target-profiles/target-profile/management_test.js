import { clickByName, visit, fillByLabel } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { click, currentURL } from '@ember/test-helpers';

module('Acceptance | Target Profile Management', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('Access restriction stuff', function () {
    module('When admin member is not logged in', function () {
      test('it should not be accessible by an unauthenticated user', async function (assert) {
        // when
        await visit('/target-profiles/1');

        // then
        assert.strictEqual(currentURL(), '/login');
      });
    });

    module('When admin member is logged in', function () {
      module('when admin member has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function (hooks) {
        hooks.beforeEach(async function () {
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
          server.create('target-profile', { id: 1, name: 'Mon super profil cible' });
        });

        test('it should be accessible for an authenticated user', async function (assert) {
          // when
          await visit('/target-profiles/1');

          // then
          assert.strictEqual(currentURL(), '/target-profiles/1/details');
        });
      });

      module('when admin member has role "CERTIF"', function () {
        test('it should be redirect to Organizations page', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isCertif: true })(server);
          server.create('target-profile', { id: 2 });

          // when
          await visit('/target-profiles/2');

          // then
          assert.strictEqual(currentURL(), '/organizations/list');
        });
      });
    });
  });

  module('target profile management', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    });

    test('it should display details of the target profile', async function (assert) {
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

    test('it should edit target profile information', async function (assert) {
      // given
      server.create('target-profile', {
        id: 1,
        name: 'nom initial',
        description: 'description initiale',
        comment: 'commentaire initial',
        category: 'OTHER',
      });

      // when
      const screen = await visit('/target-profiles/1');
      await clickByName('Éditer');
      await fillByLabel('* Nom', 'nom modifié');
      await click(screen.getByRole('button', { name: 'Catégorie :' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Thématiques' }));
      await fillByLabel('Description', 'description modifiée');
      await fillByLabel('Commentaire (usage interne)', 'commentaire modifié');
      await clickByName('Enregistrer');

      // then
      assert.strictEqual(currentURL(), '/target-profiles/1/details');
      assert.dom(screen.getByRole('heading', { name: 'nom modifié' })).exists();
      assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
      await clickByName('Éditer');
      assert.dom(screen.getByDisplayValue('description modifiée')).exists();
      assert.dom(screen.getByDisplayValue('commentaire modifié')).exists();
      assert.dom(screen.getByRole('button', { name: 'Catégorie :' })).containsText('Thématiques');
    });

    test('it should cancel target profile information edition', async function (assert) {
      // given
      server.create('target-profile', {
        id: 1,
        name: 'Nom à éditer',
        category: 'OTHER',
      });

      // when
      const screen = await visit('/target-profiles/1');
      await clickByName('Éditer');
      await fillByLabel('* Nom', 'nom modifié');
      await clickByName('Annuler');

      // then
      assert.strictEqual(currentURL(), '/target-profiles/1/details');
      assert.dom(screen.getByRole('heading', { name: 'Nom à éditer' })).exists();
      assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
    });

    test('it should mark target profile as simplified access', async function (assert) {
      // given
      server.create('target-profile', {
        id: 1,
        isSimplifiedAccess: false,
      });

      // when
      const screen = await visit('/target-profiles/1');
      await clickByName('Marquer comme accès simplifié');
      await screen.findByRole('dialog');
      await clickByName('Oui, marquer comme accès simplifié');

      // then
      assert.dom(screen.getByText('Parcours Accès Simplifié : Oui')).exists();
    });

    test('it should outdate target profile', async function (assert) {
      // given
      server.create('target-profile', {
        id: 1,
        outdated: false,
      });

      // when
      const screen = await visit('/target-profiles/1');
      await clickByName('Marquer comme obsolète');
      await screen.findByRole('dialog');
      await clickByName('Oui, marquer comme obsolète');

      // then
      assert.dom(screen.getByText('Obsolète : Oui')).exists();
    });
  });
});
