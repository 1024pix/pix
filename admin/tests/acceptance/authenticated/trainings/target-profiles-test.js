import { clickByName, fillByLabel, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupIntl from 'pix-admin/tests/helpers/setup-intl';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { waitForDialogClose } from 'pix-admin/tests/helpers/wait-for';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Trainings | Target profiles', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'fr');

  let trainingId, targetProfileSummaryId, targetProfileSummary;

  hooks.beforeEach(async function () {
    trainingId = 2;
    targetProfileSummaryId = 1111;

    targetProfileSummary = server.create('target-profile-summary', {
      id: targetProfileSummaryId,
      internalName: 'Super profil cible 2',
      isPartOfCombinedCourse: false,
    });
    server.create('training', {
      id: trainingId,
      title: 'Devenir tailleur de citrouille',
      link: 'http://www.example2.net',
      type: 'autoformation',
      duration: '10:00:00',
      locale: 'fr-fr',
      editorName: "Ministère de l'éducation nationale et de la jeunesse. Liberté égalité fraternité",
      editorLogoUrl: 'http://localhost:4202/logo-placeholder.png',
      prerequisiteThreshold: null,
      goalThreshold: null,
      targetProfileSummaries: [targetProfileSummary],
    });
    server.create('target-profile', {});
  });

  module('When admin member is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit(`/trainings/${trainingId}/target-profiles`);

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

    module('when admin role is "SUPER_ADMIN" or "METIER"', function () {
      test('is should attach a target profile to a training', async function (assert) {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        server.create('target-profile-summary', { id: 1, internalName: 'Super profil cible' });

        // when
        const screen = await visit(`/trainings/${trainingId}/target-profiles`);
        await fillByLabel('ID du ou des profil(s) cible(s)', '1');
        await clickByName('Valider');

        // then
        assert.dom(await screen.findByRole('link', { name: 'Super profil cible' })).exists();
      });

      test('it should be able to detach a target profile from a training', async function (assert) {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

        // when
        const screen = await visit(`/trainings/${trainingId}/target-profiles`);
        await clickByName('Détacher');

        // then
        assert.dom(await screen.findByText('Aucun profil cible associé à ce contenu formatif')).exists();
      });

      module('when target profile is part of a combined course', function (hooks) {
        hooks.beforeEach(function () {
          targetProfileSummary.update('isPartOfCombinedCourse', true);
        });
        hooks.afterEach(function () {
          targetProfileSummary.update('isPartOfCombinedCourse', false);
        });

        test('it should ask confirmation to detach target', async function (assert) {
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          // when
          const screen = await visit(`/trainings/${trainingId}/target-profiles`);
          await clickByName('Détacher');
          const modal = await screen.findByRole('dialog');
          await click(within(modal).getByRole('button', { name: 'Confirmer' }));

          await waitForDialogClose();

          // then
          assert.dom(await screen.findByText('Aucun profil cible associé à ce contenu formatif')).exists();
        });
      });
    });

    module('when admin role is "SUPPORT"', function () {
      test('is should not be able to attach a target profile to a training', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSupport: true })(server);
        server.create('target-profile-summary', { id: 1, internalName: 'Super profil cible' });

        // when
        const screen = await visit(`/trainings/${trainingId}/target-profiles`);

        // then
        assert.dom(screen.queryByText('ID du ou des profil(s) cible(s)')).doesNotExist();
      });
    });
  });
});
