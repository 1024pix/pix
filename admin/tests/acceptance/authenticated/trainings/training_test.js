import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupIntl from '../../../helpers/setup-intl';
import { visit, screen } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
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
    let targetProfileTabTitle;
    let trainingId;

    hooks.beforeEach(async function () {
      triggersTabName = this.intl.t('pages.trainings.training.triggers.tabName');
      targetProfilesTabName = this.intl.t('pages.trainings.training.targetProfiles.tabName');
      prerequisiteTriggerHeading = this.intl.t('pages.trainings.training.triggers.prerequisite.title');
      goalTriggerHeading = this.intl.t('pages.trainings.training.triggers.goal.title');
      targetProfileTabTitle = this.intl.t('pages.trainings.training.targetProfiles.title');
      trainingId = 2;

      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      server.create('training', {
        id: 1,
        title: 'Devenir tailleur de citrouille',
        link: 'http://www.example2.net',
        type: 'autoformation',
        duration: '10:00:00',
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
        duration: '10:00:00',
        locale: 'fr-fr',
        editorName: "Ministère de l'éducation nationale et de la jeunesse",
        editorLogoUrl: 'https://mon-logo.svg',
        prerequisiteThreshold: null,
        goalThreshold: null,
      });
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
      assert.dom(screen.getByRole('heading', { name: 'Apprendre à piloter des chauves-souris' })).exists();
      assert.dom(screen.getByRole('link', { name: triggersTabName })).exists();
      assert.dom(screen.getByRole('link', { name: targetProfilesTabName })).exists();
      assert.dom(screen.getByRole('link', { name: targetProfilesTabName })).hasClass('active');
      assert.dom(screen.getByRole('heading', { name: targetProfileTabTitle })).exists();
    });
  });
});
