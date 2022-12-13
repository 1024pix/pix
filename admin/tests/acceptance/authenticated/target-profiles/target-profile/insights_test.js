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
        server.create('stage', {
          id: 100,
          level: 1,
          threshold: null,
          title: 'premier palier',
          message: 'message palier',
          prescriberTitle: 'titre prescripteur',
          prescriberDescription: 'description prescripteur',
          targetProfile,
        });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');
        await clickByName('Voir détail');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/stages/100');
        assert.dom(screen.getByText('ID : 100')).exists();
        assert.dom(screen.getByText('Niveau : 1')).exists();
        assert.dom(screen.getByText('Titre : premier palier')).exists();
        assert.dom(screen.getByText('Message : message palier')).exists();
        assert.dom(screen.getByText('Titre pour le prescripteur : titre prescripteur')).exists();
        assert.dom(screen.getByText('Description pour le prescripteur : description prescripteur')).exists();
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
        server.create('stage', {
          id: 100,
          threshold: 10,
          title: 'ancien titre',
          message: 'ancien message',
          prescriberTitle: 'ancien titre prescripteur',
          prescriberDescription: 'ancienne description prescripteur',
          targetProfile,
        });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');
        await clickByName('Voir détail');
        await clickByName('Éditer');
        await fillByLabel('Seuil', 20);
        await fillByLabel('Titre', 'nouveau titre');
        await fillByLabel('Message', 'nouveau message');
        await fillByLabel('Titre pour le prescripteur', 'nouveau titre prescripteur');
        await fillByLabel('Description pour le prescripteur', 'nouvelle description prescripteur');
        await clickByName('Enregistrer');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/stages/100');
        assert.dom(screen.getByText('ID : 100')).exists();
        assert.dom(screen.getByText('Seuil : 20')).exists();
        assert.dom(screen.getByText('Titre : nouveau titre')).exists();
        assert.dom(screen.getByText('Message : nouveau message')).exists();
        assert.dom(screen.getByText('Titre pour le prescripteur : nouveau titre prescripteur')).exists();
        assert.dom(screen.getByText('Description pour le prescripteur : nouvelle description prescripteur')).exists();
        assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
      });

      test('it should cancel stage edition', async function (assert) {
        // given
        server.create('stage', { id: 100, title: 'titre initial', targetProfile });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');
        await clickByName('Voir détail');
        await clickByName('Éditer');
        await fillByLabel('Titre', 'titre modifié');
        await clickByName('Annuler');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/stages/100');
        assert.dom(screen.getByText('Titre : titre initial')).exists();
        assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
      });

      test('it should add a new stage', async function (assert) {
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

    module('Badges', function () {
      test('it should display existing badges', async function (assert) {
        // given
        const badge1 = server.create('badge', { id: 100, key: 'KEY_BADGE_1' });
        const badge2 = server.create('badge', { id: 101, key: 'KEY_BADGE_2' });
        targetProfile.update({ badges: [badge1, badge2] });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/insights');
        assert.dom(screen.getByText('KEY_BADGE_1')).exists();
        assert.dom(screen.getByText('KEY_BADGE_2')).exists();
      });

      test('it should display badge details when clicking on "Voir détail"', async function (assert) {
        // given
        const badge = server.create('badge', {
          id: 100,
          key: 'KEY_BADGE_1',
          title: 'tagada',
          message: 'Coucou les zamis',
          imageUrl: 'image.png',
          altMessage: 'alt COUCOU LES ZAMIS',
          isCertifiable: true,
          isAlwaysVisible: true,
          criteria: [],
        });
        targetProfile.update({ badges: [badge] });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');
        await clickByName('Détails du badge tagada');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/badges/100');
        assert.dom(screen.getByText('ID : 100')).exists();
        assert.dom(screen.getByText('Nom du résultat thématique : tagada')).exists();
        assert.dom(screen.getByText("Nom de l'image : image.png")).exists();
        assert.dom(screen.getByText('Clé : KEY_BADGE_1')).exists();
        assert.dom(screen.getByText('Message : Coucou les zamis')).exists();
        assert.dom(screen.getByText('Message alternatif : alt COUCOU LES ZAMIS')).exists();
        assert.dom(screen.getByText('Certifiable')).exists();
        assert.dom(screen.getByText('Lacunes')).exists();
        assert.deepEqual(
          screen.getByTestId('triste').innerText,
          'L‘évalué doit obtenir 50% sur l‘ensemble des acquis du profil-cible.'
        );
      });

      test('it should go back to insights when clicking on target profile header in details page', async function (assert) {
        const badge = server.create('badge', { id: 100, key: 'KEY_BADGE_1', title: 'tagada' });
        targetProfile.update({ badges: [badge] });

        // when
        await visit('/target-profiles/1/badges/100');
        await clickByName('Profil-cible extra croustillant');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/insights');
      });

      test('it should edit the badge information', async function (assert) {
        // given
        const badge = server.create('badge', {
          id: 100,
          key: 'OLD_KEY',
          title: 'ancien titre',
          message: 'ancien message',
          imageUrl: 'old_image.png',
          altMessage: 'ancien alt',
          isCertifiable: false,
          isAlwaysVisible: true,
          criteria: [],
        });
        targetProfile.update({ badges: [badge] });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');
        await clickByName('Détails du badge ancien titre');
        await clickByName('Éditer');
        await fillByLabel('* Titre :', 'nouveau titre');
        await fillByLabel('* Clé :', 'NEW_KEY');
        await fillByLabel('Message :', 'nouveau message');
        await fillByLabel("* Nom de l'image (svg) :", 'new_image.svg');
        await fillByLabel('* Message Alternatif :', 'nouveau alt');
        await clickByName('Certifiable :');
        await clickByName('Lacunes :');
        await clickByName('Enregistrer');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/badges/100');
        assert.dom(screen.getByText('ID : 100')).exists();
        assert.dom(screen.getByText('Nom du résultat thématique : nouveau titre')).exists();
        assert.dom(screen.getByText("Nom de l'image : new_image.svg")).exists();
        assert.dom(screen.getByText('Clé : NEW_KEY')).exists();
        assert.dom(screen.getByText('Message : nouveau message')).exists();
        assert.dom(screen.getByText('Message alternatif : nouveau alt')).exists();
        assert.dom(screen.getByText('Certifiable')).exists();
        assert.dom(screen.queryByText('Lacunes')).doesNotExist();
        assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
      });

      test('it should cancel badge edition', async function (assert) {
        // given
        const badge = server.create('badge', { id: 100, title: 'tagada' });
        targetProfile.update({ badges: [badge] });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');
        await clickByName('Détails du badge tagada');
        await clickByName('Éditer');
        await fillByLabel('* Titre :', 'tsouintsouin');
        await clickByName('Annuler');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/badges/100');
        assert.dom(screen.getByText('Nom du résultat thématique : tagada')).exists();
        assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
      });

      test('it should create a badge', async function (assert) {
        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');
        await clickByName('Nouveau résultat thématique');
        await fillByLabel('Nom du résultat thématique :', 'Mon nouveau RT');
        await fillByLabel("Nom de l'image (svg) :", 'troll.png');
        await fillByLabel("Texte alternatif pour l'image :", 'Je mets du png je fais ce que je veux');
        await fillByLabel('Message :', 'message de mon RT');
        await fillByLabel("Clé (texte unique , vérifier qu'il n'existe pas) :", 'MY_BADGE');
        await clickByName('Certifiable :');
        await clickByName('Lacunes :');
        await clickByName("Sur l'ensemble du profil cible");
        await fillByLabel('* Taux de réussite pour obtenir le RT :', 50);
        await clickByName('Enregistrer le RT');
        await clickByName('Détails du badge Mon nouveau RT');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/badges/1');
        assert.dom(screen.getByText('ID : 1')).exists();
        assert.dom(screen.getByText('Nom du résultat thématique : Mon nouveau RT')).exists();
        assert.dom(screen.getByText("Nom de l'image : troll.png")).exists();
        assert.dom(screen.getByText('Clé : MY_BADGE')).exists();
        assert.dom(screen.getByText('Message : message de mon RT')).exists();
        assert.dom(screen.getByText('Message alternatif : Je mets du png je fais ce que je veux')).exists();
        assert.dom(screen.getByText('Certifiable')).exists();
        assert.dom(screen.getByText('Lacunes')).exists();
        assert.deepEqual(
          screen.getByTestId('triste').innerText,
          'L‘évalué doit obtenir 50% sur l‘ensemble des acquis du profil-cible.'
        );
      });

      test('it should cancel badge creation', async function (assert) {
        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');
        await clickByName('Nouveau résultat thématique');
        await clickByName('Annuler');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/insights');
        assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
        assert.dom(screen.queryByText('Voir détail')).doesNotExist();
      });
    });
  });
});
