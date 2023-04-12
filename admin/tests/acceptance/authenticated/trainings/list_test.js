import { module, test } from 'qunit';
import { currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { clickByName, visit } from '@1024pix/ember-testing-library';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Trainings | List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When admin member is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/trainings/list');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When admin member is logged in', function () {
    module('when admin member has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function (hooks) {
      hooks.beforeEach(async () => {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      });

      test('it should be accessible for an authenticated user', async function (assert) {
        // when
        await visit('/trainings/list');

        // then
        assert.strictEqual(currentURL(), '/trainings/list');
      });

      test('it should list training summaries', async function (assert) {
        // given
        server.createList('training-summary', 10);
        server.create('training-summary', { id: 11, title: 'Formation 11' });
        server.create('training-summary', { id: 12, title: 'Formation 12' });

        // when
        const screen = await visit('/trainings/list');
        await click(screen.getByRole('button', { name: 'Aller à la page suivante' }));

        // then
        assert.dom(screen.getByText('Formation 11')).exists();
        assert.dom(screen.getByText('Formation 12')).exists();
      });

      module('when filters are used', function (hooks) {
        hooks.beforeEach(async () => {
          server.create('training-summary', { id: 1, title: 'Premier' });
          server.create('training-summary', { id: 2, title: 'Deuxième' });
        });

        test('it should display the current filter when trainings are filtered by title', async function (assert) {
          // when
          const screen = await visit('/trainings/list?title=Premier');

          // then
          assert
            .dom(screen.getByRole('textbox', { name: 'Filtrer les contenus formatifs par un titre' }))
            .hasValue('Premier');
          assert.dom(screen.getByText('Premier')).exists();
        });

        test('it should display the current filter when trainings are filtered by id', async function (assert) {
          // when
          const screen = await visit('/trainings/list?id=2');

          // then
          assert.dom(screen.getByRole('textbox', { name: 'Filtrer les contenus formatifs par un id' })).hasValue('2');
          assert.dom(screen.getByText('Deuxième')).exists();
        });
      });

      test('it should redirect to training creation form on click "Nouveau contenu formatif"', async function (assert) {
        // given
        await visit('/trainings/list');

        // when
        await clickByName('Nouveau contenu formatif');

        // then
        assert.strictEqual(currentURL(), '/trainings/new');
      });

      test('it should redirect to training details page when clicking on training name in the list', async function (assert) {
        // given
        server.create('training-summary', { id: 1, title: 'Formation 1' });
        server.create('training', { id: 1, title: 'Formation 1' });
        const screen = await visit('/trainings/list');

        // when
        await clickByName('Formation 1');

        // then
        assert.strictEqual(currentURL(), '/trainings/1/triggers');
        assert.dom(screen.getByText('Formation 1')).exists();
      });
    });

    module('when admin member has role "SUPPORT"', function (hooks) {
      hooks.beforeEach(async () => {
        await authenticateAdminMemberWithRole({ isSupport: true })(server);
      });

      test('should not create a new training', async function (assert) {
        // given
        const screen = await visit('/trainings/list');

        // then
        assert.dom(screen.queryByRole('link', { name: 'Nouveau contenu formatif' })).doesNotExist();
      });
    });
  });
});
