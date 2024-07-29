import { clickByName, fillByLabel, visit, waitForElementToBeRemoved } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';

module('Acceptance | Target Profile Insights', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('Access restriction stuff', function (hooks) {
    hooks.beforeEach(async function () {
      const badge = server.create('badge', { id: 200 });
      const stage = server.create('stage', { id: 100 });
      const stageCollection = server.create('stage-collection', { id: 1, stages: [stage] });
      server.create('target-profile', {
        id: 1,
        name: 'Profil cible extra croustillant',
        badges: [badge],
        stageCollection,
      });
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

        test('it should set target-profiles menubar item active', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          // when
          const screen = await visit(`/target-profiles/1/insights`);

          // then
          assert.dom(screen.getByRole('link', { name: 'Profils cibles' })).hasClass('active');
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
    let targetProfile, stageCollection;

    hooks.beforeEach(async function () {
      stageCollection = server.create('stage-collection', { id: 1, stages: [] });
      targetProfile = server.create('target-profile', {
        id: 1,
        name: 'Profil cible extra croustillant',
        stageCollection,
      });
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    });

    module('Stages', function () {
      test('it should display a warning if target profile is linked to a campaign', async function (assert) {
        // given
        targetProfile.update({ hasLinkedCampaign: true });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/insights');
        assert.dom(screen.getByText('Ce profil cible est associé à une campagne, vous ne pouvez donc pas :')).exists();
      });
      test('it should not display this warning if target profile is not linked to a campaign', async function (assert) {
        // given
        targetProfile.update({ hasLinkedCampaign: false });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/insights');
        assert
          .dom(screen.queryByText('Ce profil cible est associé à une campagne, vous ne pouvez donc pas :'))
          .doesNotExist();
      });

      test('it should display existing stages', async function (assert) {
        // given
        const stage1 = server.create('stage', { id: 100, title: 'premier palier' });
        const stage2 = server.create('stage', { id: 101, title: 'deuxième palier' });
        stageCollection.update({ stages: [stage1, stage2] });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/insights');
        assert.dom(screen.getAllByText('premier palier')[0]).exists();
        assert.dom(screen.getAllByText('deuxième palier')[0]).exists();
      });

      test('it should display stage details when clicking on "Voir détail"', async function (assert) {
        // given
        const stage = server.create('stage', {
          id: 100,
          level: 1,
          threshold: null,
          isFirstSkill: false,
          title: 'premier palier',
          message: 'message palier',
          prescriberTitle: 'titre prescripteur',
          prescriberDescription: 'description prescripteur',
        });
        stageCollection.update({ stages: [stage] });

        // when
        const screen = await visit('/target-profiles/1/insights');
        await clickByName('Voir le détail du palier 100');

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
        const stage = server.create('stage', { id: 100, title: 'premier palier' });
        stageCollection.update({ stages: [stage] });

        // when
        await visit('/target-profiles/1/stages/100');
        await clickByName('Profil cible extra croustillant');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/insights');
      });

      test('it should cancel stage edition', async function (assert) {
        // given
        const stage = server.create('stage', { id: 100, title: 'titre initial' });
        stageCollection.update({ stages: [stage] });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');
        await clickByName('Voir le détail du palier 100');
        await clickByName('Modifier');
        await fillByLabel(/Titre du palier/, 'titre modifié');
        await clickByName('Annuler');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/stages/100');
        assert.dom(screen.getByText('Titre : titre initial')).exists();
        assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
      });

      module('Stage level', function () {
        test('it should add new stages', async function (assert) {
          // when
          const screen = await visit('/target-profiles/1');
          await clickByName('Clés de lecture');
          await clickByName('Palier par niveau');
          await clickByName('Nouveau palier');
          await clickByName('Nouveau palier');
          await clickByName('Nouveau palier "1er acquis"');

          const [firstStageTitleInput, secondStageTitleInput, firstSkillStageTitleInput] =
            screen.getAllByLabelText(/Titre du palier/);
          const [firstStageLevelButton, secondStageLevelButton] = screen.getAllByLabelText('Niveau du palier');
          const [firstStageLevelMessage, secondStageLevelMessage, firstSkillStageLevelMessage] =
            screen.getAllByLabelText(/Message du palier/);

          await fillIn(firstStageTitleInput, 'mon premier palier');
          await fillIn(secondStageTitleInput, 'mon deuxième palier');
          await fillIn(firstSkillStageTitleInput, 'mon palier premier acquis');

          await click(secondStageLevelButton);
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: '3' }));
          await waitForElementToBeRemoved(() => screen.queryByRole('listbox'));

          await fillIn(firstStageLevelMessage, 'mon message un');
          await fillIn(secondStageLevelMessage, 'mon message deux');
          await fillIn(firstSkillStageLevelMessage, 'mon message premier acquis');

          await clickByName('Enregistrer');

          // then
          assert.true(firstStageLevelButton.hasAttributes('aria-disabled', 'true'));
          assert.dom(screen.getAllByText('mon premier palier')[0]).exists();
          assert.dom(screen.getAllByText('mon deuxième palier')[0]).exists();
          assert.dom(screen.getAllByText('mon palier premier acquis')[0]).exists();
          assert.dom(screen.getAllByText('3')[0]).exists();
          assert.dom(screen.getAllByText('0')[0]).exists();
          assert.dom(screen.getAllByText('1er acquis')[0]).exists();
          assert.dom(screen.getByText('mon message un')).exists();
          assert.dom(screen.getByText('mon message deux')).exists();
          assert.dom(screen.getByText('mon message premier acquis')).exists();
          assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
        });

        test('it should not display delete button stage on level 0 when there are other stages', async function (assert) {
          // given
          const stage = server.create('stage', {
            id: 100,
            level: 0,
            threshold: null,
            title: 'premier palier',
            message: 'message palier',
            prescriberTitle: 'titre prescripteur',
            prescriberDescription: 'description prescripteur',
          });
          const anotherStage = server.create('stage', {
            id: 101,
            level: 1,
            threshold: null,
            title: 'deuxième palier',
            message: 'message palier',
            prescriberTitle: 'titre prescripteur',
            prescriberDescription: 'description prescripteur',
          });
          stageCollection.update({ stages: [stage, anotherStage] });

          // when
          await visit('/target-profiles/1/insights');

          // then
          assert.dom('[aria-label="Voir le détail du palier 100"]').exists();
          assert.dom('[aria-label="Voir le détail du palier 101"]').exists();
          assert.dom('[aria-label="Supprimer le palier 100"]').doesNotExist();
          assert.dom('[aria-label="Supprimer le palier 101"]').exists();
        });

        test('it should edit the stage information', async function (assert) {
          // given
          const stage = server.create('stage', {
            id: 100,
            level: 2,
            threshold: null,
            title: 'ancien titre',
            message: 'ancien message',
            prescriberTitle: 'ancien titre prescripteur',
            prescriberDescription: 'ancienne description prescripteur',
          });
          stageCollection.update({ stages: [stage] });

          // when
          const screen = await visit('/target-profiles/1');
          await clickByName('Clés de lecture');
          await clickByName('Voir le détail du palier 100');
          await clickByName('Modifier');
          await click(screen.getByRole('button', { name: 'Niveau' }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: '1' }));
          await fillByLabel(/Titre du palier/, 'nouveau titre');
          await fillByLabel('Message', 'nouveau message');
          await fillByLabel('Titre pour le prescripteur', 'nouveau titre prescripteur');
          await fillByLabel('Description pour le prescripteur', 'nouvelle description prescripteur');
          await clickByName('Enregistrer');

          // then
          assert.strictEqual(currentURL(), '/target-profiles/1/stages/100');
          assert.dom(screen.getByText('ID : 100')).exists();
          assert.dom(screen.getByText('Niveau : 1')).exists();
          assert.dom(screen.getByText('Titre : nouveau titre')).exists();
          assert.dom(screen.getByText('Message : nouveau message')).exists();
          assert.dom(screen.getByText('Titre pour le prescripteur : nouveau titre prescripteur')).exists();
          assert.dom(screen.getByText('Description pour le prescripteur : nouvelle description prescripteur')).exists();
          assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
        });
      });

      module('Stage threshold', function () {
        test('it should add new stages', async function (assert) {
          // when
          const screen = await visit('/target-profiles/1');
          await clickByName('Clés de lecture');
          await clickByName('Palier par seuil');
          await clickByName('Nouveau palier');
          await clickByName('Nouveau palier');

          const [firstStageTitleInput, secondStageTitleInput] = screen.getAllByLabelText(/Titre du palier/);
          const [firstStageThresholdInput, secondStageThresholdInput] = screen.getAllByLabelText(/Seuil/);
          const [firstStageLevelMessage, secondStageLevelMessage] = screen.getAllByLabelText(/Message du palier/);
          await fillIn(firstStageTitleInput, 'mon premier palier');
          await fillIn(secondStageTitleInput, 'mon deuxième palier');
          await fillIn(secondStageThresholdInput, 50);
          await fillIn(firstStageLevelMessage, 'mon message 1');
          await fillIn(secondStageLevelMessage, 'mon message 2');
          await clickByName('Enregistrer');

          // then
          assert.true(firstStageThresholdInput.hasAttributes('value', '0'));
          assert.dom(screen.getAllByText('mon premier palier')[0]).exists();
          assert.dom(screen.getAllByText('mon deuxième palier')[0]).exists();
          assert.dom(screen.getAllByText('0%')[0]).exists();
          assert.dom(screen.getAllByText('50%')[0]).exists();
          assert.dom(screen.getByText('mon message 1')).exists();
          assert.dom(screen.getByText('mon message 2')).exists();
          assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
        });

        test('it should not display delete button stage on threshold 0 when there are other stages', async function (assert) {
          // given
          const stage = server.create('stage', {
            id: 100,
            level: null,
            threshold: 0,
            title: 'premier palier',
            message: 'message palier',
            prescriberTitle: 'titre prescripteur',
            prescriberDescription: 'description prescripteur',
          });
          const anotherStage = server.create('stage', {
            id: 101,
            level: null,
            threshold: 50,
            title: 'deuxième palier',
            message: 'message palier',
            prescriberTitle: 'titre prescripteur',
            prescriberDescription: 'description prescripteur',
          });
          stageCollection.update({ stages: [stage, anotherStage] });

          // when
          await visit('/target-profiles/1/insights');

          // then
          assert.dom('[aria-label="Voir le détail du palier 100"]').exists();
          assert.dom('[aria-label="Voir le détail du palier 101"]').exists();
          assert.dom('[aria-label="Supprimer le palier 100"]').doesNotExist();
          assert.dom('[aria-label="Supprimer le palier 101"]').exists();
        });

        test('it should edit the stage information', async function (assert) {
          // given
          const stage = server.create('stage', {
            id: 100,
            threshold: 10,
            level: null,
            title: 'ancien titre',
            message: 'ancien message',
            prescriberTitle: 'ancien titre prescripteur',
            prescriberDescription: 'ancienne description prescripteur',
          });
          stageCollection.update({ stages: [stage] });

          // when
          const screen = await visit('/target-profiles/1');
          await clickByName('Clés de lecture');
          await clickByName('Voir le détail du palier 100');
          await clickByName('Modifier');
          await fillByLabel(/Seuil/, 20);
          await fillByLabel(/Titre du palier/, 'nouveau titre');
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
          screen.getByTestId('campaign-criterion-text').innerText,
          "L'évalué doit obtenir 50% sur l'ensemble des sujets du profil cible.",
        );
      });

      test('it should go back to insights when clicking on target profile header in details page', async function (assert) {
        const badge = server.create('badge', { id: 100, key: 'KEY_BADGE_1', title: 'tagada' });
        targetProfile.update({ badges: [badge] });

        // when
        await visit('/target-profiles/1/badges/100');
        await clickByName('Profil cible extra croustillant');

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
        await clickByName('Modifier');
        await fillByLabel('* Titre :', 'nouveau titre');
        await fillByLabel('* Clé :', 'NEW_KEY');
        await fillByLabel('Message :', 'nouveau message');
        await fillByLabel("* Nom de l'image (svg) :", 'new_image.svg');
        await fillByLabel('* Message Alternatif :', 'nouveau alt');
        await clickByName('Certifiable');
        await clickByName('Lacunes');
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
        assert.dom(screen.queryByTestId('save-badge-edit')).doesNotExist();
      });

      test('it should cancel badge edition', async function (assert) {
        // given
        const badge = server.create('badge', { id: 100, title: 'tagada' });
        targetProfile.update({ badges: [badge] });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');
        await clickByName('Détails du badge tagada');
        await clickByName('Modifier');
        await fillByLabel('* Titre :', 'tsouintsouin');
        await clickByName('Annuler');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/badges/100');
        assert.dom(screen.getByText('Nom du résultat thématique : tagada')).exists();
        assert.dom(screen.queryByTestId('save-badge-edit')).doesNotExist();
      });

      test('it should create a badge', async function (assert) {
        // given
        const tubeThematicDeux = server.create('tube', {
          id: 'tubeThematicDeuxNiveauQuatre',
          name: '@tubeThematicDeuxNiveauQuatre',
          practicalTitle: 'Mon tube thématique 2 de niveau quatre',
          practicalDescription: 'Un tube très intéressant de niveau quatre',
          mobile: false,
          tablet: true,
          level: 4,
        });
        const tubeThematicUn = server.create('tube', {
          id: 'tubeThematicUnNiveauDeux',
          name: '@tubeThematicUnNiveauDeux',
          practicalTitle: 'Mon tube thématique 1 de niveau deux',
          mobile: false,
          tablet: false,
          level: 2,
        });
        const thematicDeux = server.create('thematic', {
          id: 'thematicDeux',
          index: '2',
          name: 'thematicDeux',
          tubes: [tubeThematicDeux],
        });
        const thematicUn = server.create('thematic', {
          id: 'thematicUn',
          index: '1',
          name: 'thematicUn',
          tubes: [tubeThematicUn],
        });
        const competenceUn = server.create('competence', {
          id: 'competenceUn',
          name: 'competenceUn',
          index: '1.1',
          thematics: [thematicUn, thematicDeux],
        });
        const areaUn = server.create('area', {
          id: 'areaUn',
          title: 'areaUn',
          code: '1',
          color: 'blue',
          frameworkId: 'frameworkId',
          competences: [competenceUn],
        });
        targetProfile.update({ areas: [areaUn] });

        // when
        const screen = await visit('/target-profiles/1');
        await clickByName('Clés de lecture');
        await clickByName('Nouveau résultat thématique');
        await fillByLabel(/Nom du résultat thématique :/, 'Mon nouveau RT');
        await fillByLabel("* Nom de l'image (svg) :", 'troll.png');
        await fillByLabel(/Texte alternatif pour l'image :/, 'Je mets du png je fais ce que je veux');
        await fillByLabel('Message :', 'message de mon RT');
        await fillByLabel(/Clé/, 'MY_BADGE');
        await clickByName('Certifiable');
        await clickByName('Lacunes');
        await clickByName("sur l'ensemble du profil cible");
        await clickByName('sur une sélection de sujets du profil cible');
        await clickByName('Ajouter une nouvelle sélection de sujets');

        const [tubeGroupNameInput] = screen.getAllByLabelText('Nom du critère :');
        await fillIn(tubeGroupNameInput, "Le tube de l'année");

        const thresholdInputs = screen.getAllByLabelText('* Taux de réussite requis :');
        await fillIn(thresholdInputs[0], 50);
        await fillIn(thresholdInputs[1], 60);
        await fillIn(thresholdInputs[2], 70);

        const areaButtons = screen.getAllByText('1 · areaUn');
        await click(areaButtons[0]);
        await click(areaButtons[1]);

        const competenceButtons = screen.getAllByText('1.1 competenceUn');
        await click(competenceButtons[0]);
        await click(competenceButtons[1]);

        const thematicUnButtons = screen.getAllByText('thematicUn');
        await click(thematicUnButtons[0]);
        const thematicDeuxButtons = screen.getAllByText('thematicDeux');
        await click(thematicDeuxButtons[1]);

        const selectLevelTubeThematicUnNiveauDeux = screen.getAllByRole('button', {
          name: 'Sélection du niveau du sujet suivant : Mon tube thématique 1 de niveau deux',
        });
        await click(selectLevelTubeThematicUnNiveauDeux[0]);
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: '2' }));
        await waitForElementToBeRemoved(() => screen.queryByRole('listbox'));

        const selectLevelTubeThematicDeuxNiveauQuatre = screen.getAllByRole('button', {
          name: 'Sélection du niveau du sujet suivant : Mon tube thématique 2 de niveau quatre',
        });

        await click(selectLevelTubeThematicDeuxNiveauQuatre[1]);
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: '3' }));
        await waitForElementToBeRemoved(() => screen.queryByRole('listbox'));

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
        assert.dom(screen.getByText("Critère d'obtention basé sur l'ensemble du profil cible :")).exists();
        assert.deepEqual(
          screen.getByTestId('campaign-criterion-text').innerText,
          "L'évalué doit obtenir 50% sur l'ensemble des sujets du profil cible.",
        );
        assert
          .dom(screen.getByText("Liste des critères d'obtention basés sur une sélection de sujets du profil cible :"))
          .exists();
        const labelsForCappedTubes = screen.getAllByTestId('toujourstriste');
        assert.deepEqual(
          labelsForCappedTubes[0].innerText,
          "L'évalué doit obtenir 60% sur le groupe Le tube de l'année possédant les sujets plafonnés par niveau suivants :",
        );
        assert.deepEqual(
          labelsForCappedTubes[1].innerText,
          "L'évalué doit obtenir 70% sur tous les sujets plafonnés par niveau suivants :",
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

      test('it should edit a campaign criterion', async function (assert) {
        // given
        const badge = server.create('badge');
        targetProfile.update({ badges: [badge] });

        // when
        const screen = await visit(`/target-profiles/1/badges/${badge.id}`);
        await clickByName('Modifier le critère');
        await screen.findByRole('dialog');
        await fillByLabel(/Nouveau seuil d'obtention du critère :/, 99);
        await click(screen.getByRole('button', { name: 'Enregistrer' }));

        // then
        assert.dom(screen.getByText("Seuil d'obtention du critère modifié avec succès.")).exists();
        assert.deepEqual(
          screen.getByTestId('campaign-criterion-text').innerText,
          "L'évalué doit obtenir 99% sur l'ensemble des sujets du profil cible.",
        );
      });
    });
  });
});
