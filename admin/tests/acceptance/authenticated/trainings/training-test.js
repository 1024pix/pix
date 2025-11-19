import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { screen } from '@testing-library/dom';
import { t } from 'ember-intl/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Trainings | Training', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'fr');

  module('When admin member is logged in', function (hooks) {
    let triggersTabName;
    let targetProfilesTabName;
    let prerequisiteTriggerHeading;
    let goalTriggerHeading;
    let trainingId;
    let targetProfileInternalName;

    hooks.beforeEach(async function () {
      triggersTabName = t('pages.trainings.training.triggers.tabName');
      targetProfilesTabName = t('pages.trainings.training.targetProfiles.tabName');
      prerequisiteTriggerHeading = t('pages.trainings.training.triggers.prerequisite.title');
      goalTriggerHeading = t('pages.trainings.training.triggers.goal.title');
      trainingId = 2;
      targetProfileInternalName = 'Profile Cible 1';

      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      server.create('training', {
        id: 1,
        title: 'Devenir tailleur de citrouille',
        internalTitle: 'Devenir tailleur de citrouille parce que c‘est génial',
        link: 'http://www.example2.net',
        type: 'autoformation',
        duration: { days: 0, hours: 10, minutes: 0 },
        locale: 'fr-fr',
        editorName: "Ministère de l'éducation nationale et de la jeunesse. Liberté égalité fraternité",
        editorLogoUrl: 'https://mon-logo.svg',
        prerequisiteThreshold: null,
        goalThreshold: null,
      });

      server.create('training', {
        id: 2,
        title: 'Apprendre à piloter des chauves-souris',
        internalTitle: 'Apprendre à piloter des chauves-souris comme Batman',
        link: 'http://www.example2.net',
        type: 'webinaire',
        duration: { days: 0, hours: 10, minutes: 0 },
        locale: 'fr-fr',
        editorName: "Ministère de l'éducation nationale et de la jeunesse. Liberté égalité fraternité",
        editorLogoUrl: 'https://mon-logo.svg',
        prerequisiteThreshold: null,
        goalThreshold: null,
        targetProfileSummaries: [
          server.create('target-profile-summary', {
            id: 1,
            internalName: targetProfileInternalName,
            outdated: true,
          }),
        ],
      });
    });

    module('creation page', function () {
      test('it should set trainings menubar item active', async function (assert) {
        // when
        const screen = await visit(`/trainings/new`);

        // then
        assert.dom(screen.getByRole('link', { name: 'Contenus formatifs' })).hasClass('active');
      });

      test('should be redirected to training detail page after training creation', async function (assert) {
        // when
        await visit(`/trainings/list`);
        await clickByName('Nouveau contenu formatif');

        await fillByLabel('Titre public :', 'Nouveau contenu formatif');
        await fillByLabel('Titre interne :', 'Mon titre interne');
        await fillByLabel('Lien', 'http://www.example.net');
        await click(screen.getByText('Webinaire'));

        await fillByLabel('Jours (JJ)', 1);
        await fillByLabel('Heures (HH)', 0);
        await fillByLabel('Minutes (MM)', 0);
        await click(screen.getByText('Francophone (fr)'));
        await fillByLabel('Nom du fichier du logo éditeur', 'Logo.svg', { exact: false });
        await fillByLabel("Nom de l'éditeur", 'Editeur', { exact: false });
        await click(screen.getByRole('button', { name: 'Créer le contenu formatif' }));

        // then
        assert.strictEqual(currentURL(), `/trainings/3/triggers`);
      });

      test('should be redirected to training list when user click on cancel button', async function (assert) {
        // when
        await visit(`/trainings/list`);
        await clickByName('Nouveau contenu formatif');

        // given
        await clickByName('Annuler');

        // then
        assert.strictEqual(currentURL(), `/trainings/list`);
      });
    });

    module('triggers details page', function () {
      test('it should set trainings menubar item active', async function (assert) {
        // when
        const screen = await visit(`/trainings/${trainingId}/triggers`);

        // then
        assert.dom(screen.getByRole('link', { name: 'Contenus formatifs' })).hasClass('active');
      });
    });

    module('triggers target-profiles page', function () {
      test('it should set trainings menubar item active', async function (assert) {
        // when
        const screen = await visit(`/trainings/${trainingId}/target-profiles`);

        // then
        assert.dom(screen.getByRole('link', { name: 'Contenus formatifs' })).hasClass('active');
      });
    });

    test('triggers should be accessible for an authenticated user', async function (assert) {
      // when
      await visit(`/trainings/${trainingId}/`);

      // then
      assert.strictEqual(currentURL(), `/trainings/${trainingId}/triggers`);
      assert.dom(screen.getByRole('heading', { name: 'Apprendre à piloter des chauves-souris comme Batman' })).exists();
      assert.dom(screen.getByRole('link', { name: triggersTabName })).exists();
      assert.dom(screen.getByRole('link', { name: triggersTabName })).hasClass('active');
      assert.dom(screen.getByRole('link', { name: targetProfilesTabName })).exists();
      assert.dom(screen.getByRole('heading', { name: prerequisiteTriggerHeading })).exists();
      assert.dom(screen.getByRole('heading', { name: goalTriggerHeading })).exists();
    });

    test('target profiles should be accessible for an authenticated user', async function (assert) {
      // when
      await visit(`/trainings/${trainingId}/target-profiles`);

      // then
      assert.strictEqual(currentURL(), `/trainings/${trainingId}/target-profiles`);
      assert.dom(screen.getByRole('link', { name: triggersTabName })).exists();
      assert.dom(screen.getByRole('link', { name: targetProfilesTabName })).exists();
      assert.dom(screen.getByRole('link', { name: targetProfilesTabName })).hasClass('active');
      assert.dom(screen.getByRole('heading', { name: targetProfilesTabName })).exists();
      assert.dom(screen.getByRole('link', { name: targetProfileInternalName })).exists();
      assert.ok(screen.getByText('Obsolète'));
    });

    module('when admin role is "SUPER_ADMIN" or "METIER"', function () {
      test('should be possible to edit training details', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        await visit(`/trainings/${trainingId}`);

        // when
        await click(screen.getByRole('button', { name: 'Modifier' }));
        await fillByLabel('Titre public :', 'Nouveau contenu formatif modifié');
        await fillByLabel('Titre interne :', 'Mon titre interne');
        await click(screen.getByRole('button', { name: 'Modifier le contenu formatif' }));

        // then
        assert.dom(screen.getByRole('heading', { name: 'Mon titre interne' })).exists();
      });

      test('should be possible to duplicate displayed training', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        await visit(`/trainings/${trainingId}`);

        // when
        await clickByName('Dupliquer ce contenu formatif');
        await screen.findByRole('button', { name: 'Valider' });
        await clickByName('Valider');

        // then
        const title = await screen.findByRole('heading', {
          name: `[Copie] Apprendre à piloter des chauves-souris comme Batman`,
          level: 1,
        });
        assert.dom(title).exists();
        assert.strictEqual(currentURL(), '/trainings/3/triggers');
      });
    });

    module('when admin role is "SUPPORT', function () {
      test('should not be possible to edit training details', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSupport: true })(server);

        // when
        await visit(`/trainings/${trainingId}`);

        // then
        assert.notOk(screen.queryByRole('button', { name: 'Modifier' }));
      });
    });
  });
});
