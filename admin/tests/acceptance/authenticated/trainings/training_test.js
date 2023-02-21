import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupIntl from '../../../helpers/setup-intl';
import { visit, screen, fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import { currentURL, click } from '@ember/test-helpers';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Trainings | Training', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('When admin member is logged in', function (hooks) {
    let triggersTabName;
    let targetProfilesTabName;
    let prerequisiteTriggerHeading;
    let goalTriggerHeading;
    let trainingId;
    let targetProfileName;

    hooks.beforeEach(async function () {
      triggersTabName = this.intl.t('pages.trainings.training.triggers.tabName');
      targetProfilesTabName = this.intl.t('pages.trainings.training.targetProfiles.tabName');
      prerequisiteTriggerHeading = this.intl.t('pages.trainings.training.triggers.prerequisite.title');
      goalTriggerHeading = this.intl.t('pages.trainings.training.triggers.goal.title');
      trainingId = 2;
      targetProfileName = 'Profile Cible 1';

      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      server.create('training', {
        id: 1,
        title: 'Devenir tailleur de citrouille',
        link: 'http://www.example2.net',
        type: 'autoformation',
        duration: { days: 0, hours: 10, minutes: 0 },
        locale: 'fr-fr',
        editorName: "Ministère de l'éducation nationale et de la jeunesse",
        editorLogoUrl: 'https://mon-logo.svg',
        prerequisiteThreshold: null,
        goalThreshold: null,
      });

      server.create('training', {
        id: 2,
        title: 'Apprendre à piloter des chauves-souris',
        link: 'http://www.example2.net',
        type: 'webinaire',
        duration: { days: 0, hours: 10, minutes: 0 },
        locale: 'fr-fr',
        editorName: "Ministère de l'éducation nationale et de la jeunesse",
        editorLogoUrl: 'https://mon-logo.svg',
        prerequisiteThreshold: null,
        goalThreshold: null,
        targetProfileSummaries: [
          server.create('target-profile-summary', {
            id: 1,
            name: targetProfileName,
            outdated: true,
          }),
        ],
      });
    });

    test('should be redirected to training detail page after training creation', async function (assert) {
      // when
      await visit(`/trainings/list`);
      await clickByName('Nouveau contenu formatif');

      await fillByLabel('Titre', 'Nouveau contenu formatif');
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

    test('triggers should be accessible for an authenticated user', async function (assert) {
      // when
      await visit(`/trainings/${trainingId}/`);

      // then
      assert.strictEqual(currentURL(), `/trainings/${trainingId}/triggers`);
      assert.dom(screen.getByRole('heading', { name: 'Apprendre à piloter des chauves-souris' })).exists();
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
      assert.dom(screen.getByRole('link', { name: targetProfileName })).exists();
      assert.ok(screen.getByText('Obsolète'));
    });

    test('should be possible to edit training details', async function (assert) {
      // given
      await visit(`/trainings/${trainingId}`);

      // when
      await click(screen.getByRole('button', { name: 'Editer' }));
      await fillByLabel('Titre', 'Nouveau contenu formatif modifié');
      await click(screen.getByRole('button', { name: 'Modifier le contenu formatif' }));

      // then
      assert.dom(screen.getByRole('heading', { name: 'Nouveau contenu formatif modifié' })).exists();
    });
  });
});
