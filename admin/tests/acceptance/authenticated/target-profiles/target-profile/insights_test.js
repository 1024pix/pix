import { currentURL } from '@ember/test-helpers';
import { visit, clickByName, fillByLabel } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';

module('Acceptance | Target Profile Insights', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('Access restriction stuff', function (hooks) {
    hooks.beforeEach(async function () {
      const badge = server.create('badge', { id: 200 });
      const targetProfile = server.create('target-profile', {
        id: 1,
        name: 'Profil-cible extra croustillant',
        badges: [badge],
      });
      server.create('stage', { id: 100, targetProfile });
    });

    module('When admin member is not logged in', function () {
      test('it should not be accessible by an unauthenticated user', async function (assert) {
        // when / then
        await visit('/target-profiles/1/insights');
        assert.strictEqual(currentURL(), '/login');
        await visit('/target-profiles/1/stages/100');
        assert.strictEqual(currentURL(), '/login');
        await visit('/target-profiles/1/badges/200');
        assert.strictEqual(currentURL(), '/login');
      });
    });

    module('When admin member is logged in', function () {
      module('when admin member has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
        test('it should be accessible for an authenticated user', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          // when / then
          await visit('/target-profiles/1/insights');
          assert.strictEqual(currentURL(), '/target-profiles/1/insights');
          await visit('/target-profiles/1/stages/100');
          assert.strictEqual(currentURL(), '/target-profiles/1/stages/100');
          await visit('/target-profiles/1/badges/200');
          assert.strictEqual(currentURL(), '/target-profiles/1/badges/200');
        });
      });

      module('when admin member has role "CERTIF"', function () {
        test('it should be redirect to Organizations page', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isCertif: true })(server);

          // when / then
          await visit('/target-profiles/1/insights');
          assert.strictEqual(currentURL(), '/organizations/list');
          await visit('/target-profiles/1/stages/100');
          assert.strictEqual(currentURL(), '/organizations/list');
          await visit('/target-profiles/1/badges/200');
          assert.strictEqual(currentURL(), '/organizations/list');
        });
      });
    });
  });

  module('Insights', function (hooks) {
    let targetProfile;

    hooks.beforeEach(async function () {
      targetProfile = server.create('target-profile', { id: 1, name: 'Profil-cible extra croustillant' });
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    });

    module('Stages', function () {
      test('it should display existing stages', async function (assert) {
        // given
        server.create('stage', { id: 100, title: 'premier palier', targetProfile });
        server.create('stage', { id: 101, title: 'deuxième palier', targetProfile });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/insights');
        assert.dom(screen.getByText('premier palier')).exists();
        assert.dom(screen.getByText('deuxième palier')).exists();
      });

      test('it should display stage details when clicking on "Voir détail"', async function (assert) {
        // given
        server.create('stage', { id: 100, title: 'premier palier', targetProfile });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');
        await clickByName('Voir détail');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/stages/100');
        assert.dom(screen.getByText('Palier 100')).exists();
      });

      test('it should go back to insights when clicking on target profile header in details page', async function (assert) {
        server.create('stage', { id: 100, title: 'premier palier', targetProfile });

        // when
        await visit('/target-profiles/1/stages/100');
        await clickByName('Profil-cible extra croustillant');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/insights');
      });

      test('it should edit the stage information', async function (assert) {
        // given
        server.create('stage', { id: 100, title: 'titre initial', targetProfile });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');
        await clickByName('Voir détail');
        await clickByName('Éditer');
        await fillByLabel('Titre', 'titre modifié');
        await clickByName('Enregistrer');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/stages/100');
        assert.dom(screen.getByText('titre modifié')).exists();
        assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
      });

      test('should be able to add a new stage', async function (assert) {
        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');
        await clickByName('Palier par niveau');
        await clickByName('Nouveau palier');
        await fillByLabel('Titre du palier', 'mon super palier');
        await clickByName('Enregistrer');

        // then
        assert.dom(screen.getByText('mon super palier')).exists();
        assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
      });
    });
    /*
    module('badges', function () {
      test('should be able to see the details of a badge', async function (assert) {
        // given
        await visit(`/target-profiles/1/insights`);

        // when
        await clickByName('Détails du badge My badge 1');

        //then
        assert.strictEqual(currentURL(), '/target-profiles/1/badges/100');
      });

      test('should redirect to badge creation page on link click', async function (assert) {
        // given
        await visit(`/target-profiles/1/insights`);

        // when
        await clickByName('Nouveau résultat thématique');

        // then
        assert.strictEqual(currentURL(), `/target-profiles/1/badges/new`);
      });

      test('should redirect to insights parent page when badge creation is cancelled', async function (assert) {
        // given
        await visit(`/target-profiles/1/badges/new`);

        // when
        await clickByName('Annuler');

        // then
        assert.strictEqual(currentURL(), `/target-profiles/1/insights`);
      });

      test('should redirect to insights parent page when badge creation is done', async function (assert) {
        // given
        await visit(`/target-profiles/1/badges/new`);

        // when
        await fillByLabel('Nom du résultat thématique :', 'clé_du_badge');
        await fillByLabel("Nom de l'image (svg) :", 'nom_de_limage');
        await fillByLabel("Texte alternatif pour l'image :", 'texte alternatif à l‘image');
        await fillByLabel("Clé (texte unique , vérifier qu'il n'existe pas) :", 'clé unique');
        await fillByLabel('Taux de réussite global :', '65');
        await clickByName('Créer le badge');

        // then
        assert.strictEqual(currentURL(), `/target-profiles/1/insights`);
      });
    });
    */
  });
});
