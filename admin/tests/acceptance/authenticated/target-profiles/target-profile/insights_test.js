import { click, currentURL } from '@ember/test-helpers';
import { visit, clickByName, fillByLabel } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';

module('Acceptance | Target Profiles | Target Profile | Insights', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let targetProfile;

  hooks.beforeEach(async function () {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

    targetProfile = this.server.create('target-profile', { name: 'Profil cible du ghetto' });
    this.server.create('badge', { id: 100, title: 'My badge', imageUrl: 'http://images.pix.fr/badges/ag2r.svg' });
    this.server.create('badge', { id: 101, title: 'My badge 2', imageUrl: 'http://images.pix.fr/badges/ag2r.svg' });

    this.server.create('stage', { title: 'My stage' });
  });

  test('should list badges and stages', async function (assert) {
    // when
    const screen = await visit(`/target-profiles/${targetProfile.id}/insights`);

    // then
    assert.dom(screen.getByLabelText('Informations du badge My badge')).exists();
    assert.dom(screen.getByLabelText('Informations du badge My badge 2')).exists();
    assert.dom(screen.getByLabelText('Informations sur le palier My stage')).exists();
  });

  module('badges', function () {
    test('should be able to see the details of a badge', async function (assert) {
      // given
      await visit(`/target-profiles/${targetProfile.id}/insights`);

      // when
      await clickByName('Détails du badge My badge');

      //then
      assert.strictEqual(currentURL(), '/badges/100');
    });

    test('should redirect to badge creation page on link click', async function (assert) {
      // given
      await visit(`/target-profiles/${targetProfile.id}/insights`);

      // when
      await clickByName('Nouveau résultat thématique');

      // then
      assert.strictEqual(currentURL(), `/target-profiles/${targetProfile.id}/badges/new`);
    });

    test('should redirect to insights parent page when badge creation is cancelled', async function (assert) {
      // given
      await visit(`/target-profiles/${targetProfile.id}/badges/new`);

      // when
      await clickByName('Annuler');

      // then
      assert.strictEqual(currentURL(), `/target-profiles/${targetProfile.id}/insights`);
    });

    test('should redirect to insights parent page when badge creation is done', async function (assert) {
      // given
      await visit(`/target-profiles/${targetProfile.id}/badges/new`);

      // when
      await fillByLabel('Nom du badge :', 'clé_du_badge');
      await fillByLabel("Nom de l'image (svg) :", 'nom_de_limage');
      await fillByLabel("Texte alternatif pour l'image :", 'texte alternatif à l‘image');
      await fillByLabel("Clé (texte unique , vérifier qu'il n'existe pas) :", 'clé unique');
      await fillByLabel('Taux de réussite global :', '65');
      await clickByName('Créer le badge');

      // then
      assert.strictEqual(currentURL(), `/target-profiles/${targetProfile.id}/insights`);
    });
  });

  module('stages', function () {
    test('should be able to add a new stage', async function (assert) {
      const screen = await visit(`/target-profiles/${targetProfile.id}/insights`);

      const stageCount = screen.getAllByLabelText('Informations sur le palier', { exact: false }).length;
      assert.strictEqual(stageCount, 1);

      assert.dom(screen.queryByText('Enregistrer')).doesNotExist();

      await clickByName('Nouveau palier');

      assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();

      const newTableRowCount = screen.getAllByLabelText('Informations sur le palier', { exact: false }).length;
      assert.strictEqual(newTableRowCount, 2);

      await fillByLabel('Seuil du palier', '0');
      await fillByLabel('Titre du palier', 'My stage title');
      await fillByLabel('Message du palier', 'My stage message');

      await clickByName('Enregistrer');
      assert.dom(screen.queryByText('Enregistrer')).doesNotExist();

      const newStageCount = screen.getAllByLabelText('Informations sur le palier', { exact: false }).length;
      assert.strictEqual(newStageCount, 2);
    });

    test('should reset stage creation data after cancellation', async function (assert) {
      // when
      const screen = await visit(`/target-profiles/${targetProfile.id}/insights`);
      const stageCount = screen.getAllByLabelText('Informations sur le palier', { exact: false }).length;
      assert.strictEqual(stageCount, 1);
      await clickByName('Nouveau palier');
      await clickByName('Annuler');

      // then
      const newStageCount = screen.getAllByLabelText('Informations sur le palier', { exact: false }).length;
      assert.strictEqual(newStageCount, 1);
    });

    test('should remove one line of a new stage', async function (assert) {
      // when
      const screen = await visit(`/target-profiles/${targetProfile.id}/insights`);
      const stageCount = screen.getAllByLabelText('Informations sur le palier', { exact: false }).length;
      assert.strictEqual(stageCount, 1);
      await clickByName('Nouveau palier');
      await clickByName('Nouveau palier');
      await click(screen.getAllByLabelText('Supprimer palier')[1]);

      // then
      const newStageCount = screen.getAllByLabelText('Informations sur le palier', { exact: false }).length;
      assert.strictEqual(newStageCount, 2);
    });
  });
});
