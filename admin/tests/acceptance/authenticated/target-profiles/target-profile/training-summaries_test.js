import { clickByName, visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';
import { currentURL } from '@ember/test-helpers';

module('Acceptance | Target Profile Training Summaries', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('Access restriction stuff', function () {
    module('When admin member is not logged in', function () {
      test('it should not be accessible by an unauthenticated user', async function (assert) {
        // when
        await visit('/target-profiles/1/training-summaries');

        // then
        assert.strictEqual(currentURL(), '/login');
      });
    });

    module('When admin member is logged in', function () {
      module('when admin member has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function (hooks) {
        hooks.beforeEach(async function () {
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
          server.create('training', { id: 456, title: 'My training' });
          server.create('target-profile', { id: 1, trainingsSummaries: [456], name: 'Mon super profil cible' });
        });

        test('it should be accessible for an authenticated user', async function (assert) {
          // when
          await visit('/target-profiles/1/training-summaries');

          // then
          assert.strictEqual(currentURL(), '/target-profiles/1/training-summaries');
        });
      });

      module('when admin member has role "CERTIF"', function () {
        test('it should be redirected to Organizations page', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isCertif: true })(server);
          server.create('training', { id: 456, title: 'My training' });
          server.create('target-profile', { id: 2, trainingsSummaries: [456], name: 'Mon super profil cible' });

          // when
          await visit('/target-profiles/2/training-summaries');

          // then
          assert.strictEqual(currentURL(), '/organizations/list');
        });
      });
    });
  });

  module('Target profile training summaries', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      server.create('target-profile', { id: 1, name: 'Profil cible du ghetto' });
    });

    module('with multiple trainings', function (hooks) {
      hooks.beforeEach(async function () {
        server.create('training', { id: 456, title: 'My training', targetProfileIds: [1] });
        server.create('training-summary', { id: 456, title: 'My training', targetProfileIds: [1] });
        server.create('training-summary', { id: 789, title: 'My other training', targetProfileIds: [1] });
      });

      test('should list trainings', async function (assert) {
        // then
        const screen = await visit('/target-profiles/1');

        // when
        await clickByName('Contenus formatifs du profil cible');

        // then
        assert.dom(screen.getByText('My training')).exists();
        assert.dom(screen.getByText('My other training')).exists();
      });

      test('it should redirect to training details on click', async function (assert) {
        // given
        await visit('/target-profiles/1/training-summaries');
        await clickByName('Contenus formatifs du profil cible');

        // when
        await clickByName('My training');

        // then
        assert.deepEqual(currentURL(), '/trainings/456/triggers');
      });
    });
  });
});
