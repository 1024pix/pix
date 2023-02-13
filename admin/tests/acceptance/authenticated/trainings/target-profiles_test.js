import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL } from '@ember/test-helpers';
import { visit, fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import setupIntl from '../../../helpers/setup-intl';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Trainings | Target profiles', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let trainingId;

  hooks.beforeEach(async function () {
    trainingId = 2;

    server.create('training', {
      id: 2,
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
    server.create('target-profile', {});
  });

  module('When admin member is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit(`/trainings/1/target-profiles`);

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When admin member is logged in', function () {
    test('it should be accessible by an authenticated user : prerequisite edit', async function (assert) {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      await visit(`/trainings/${trainingId}/target-profiles`);

      // then
      assert.strictEqual(currentURL(), `/trainings/${trainingId}/target-profiles`);
    });

    test('is should attach a target profile to a training', async function (assert) {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      server.create('target-profile-summary', { id: 1, name: 'Super profil cible' });

      // when
      const screen = await visit(`/trainings/${trainingId}/target-profiles`);
      await fillByLabel('ID du ou des profil(s) cible(s)', '1');
      await clickByName('Valider');

      // then
      assert.dom(screen.getByRole('link', { name: 'Super profil cible' })).exists();
    });
  });
});
