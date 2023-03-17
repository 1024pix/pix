import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { find, click, currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { authenticate } from '../../helpers/authentication';
import { waitForDialog } from '../../helpers/wait-for';

module('Acceptance | User-tutorials | Recommended', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  hooks.beforeEach(async function () {
    user = server.create('user', 'withEmail');
    await authenticate(user);
    await server.db.tutorials.remove();
  });

  module('When there are recommended tutorials', function () {
    test('should display paginated tutorial cards', async function (assert) {
      // given
      server.createList('tutorial', 100);

      // when
      await visit('/mes-tutos/recommandes');

      //then
      assert.dom('.tutorial-card').exists();
      assert.dom('.tutorial-card').exists({ count: 10 });

      const pixPaginationTextContent = find('.pix-pagination__navigation').textContent;
      assert.ok(pixPaginationTextContent.includes('100 éléments'));
      assert.ok(pixPaginationTextContent.includes('Page 1 / 10'));
    });

    module('when a tutorial is not already saved', function () {
      test('should saved it when user click on save button', async function (assert) {
        // given
        server.createList('tutorial', 1);
        const screen = await visit('/mes-tutos/recommandes');

        // when
        await click(screen.getByLabelText('Enregistrer dans ma liste de tutos'));

        // then
        assert.dom('.tutorial-card').exists({ count: 1 });
        assert.ok(screen.getByLabelText('Retirer de ma liste de tutos'));
      });
    });

    module('when a tutorial is saved', function () {
      test('should not remove it from the list when clicking on the remove button', async function (assert) {
        // given
        server.createList('tutorial', 1, 'withUserSavedTutorial');
        const screen = await visit('/mes-tutos/recommandes');

        // when
        await click(screen.getByLabelText('Retirer de ma liste de tutos'));

        // then
        assert.dom('.tutorial-card').exists({ count: 1 });
      });
    });

    module('when a tutorial is liked', function () {
      test('should retrieve the appropriate status when changing page', async function (assert) {
        // given
        server.createList('tutorial', 1, 'withUserSavedTutorial', 'withTutorialEvaluation');
        const screen = await visit('/mes-tutos/recommandes');

        // when
        await click(screen.getByLabelText('Ne plus considérer ce tuto comme utile'));
        await visit('/mes-tutos/enregistres');

        // then
        assert.ok(screen.getByLabelText('Marquer ce tuto comme utile'));
      });
    });

    module('when user is filtering by competences', function () {
      test('should filter tutorial by competence and close sidebar', async function (assert) {
        // given
        server.create('area', 'withCompetences');
        server.createList('tutorial', 100);
        const screen = await visit('/mes-tutos/recommandes');
        assert.dom('.tutorial-card').exists({ count: 10 });
        await click(screen.getByRole('button', { name: 'Filtrer' }));
        await waitForDialog();
        await click(screen.getByRole('button', { name: 'Mon super domaine' }));
        await click(screen.getByRole('checkbox', { name: 'Ma superbe compétence' }));

        // when
        await click(screen.getByRole('button', { name: 'Voir les résultats' }));

        // then
        assert.strictEqual(currentURL(), '/mes-tutos/recommandes?competences=1&pageNumber=1');
        assert.dom('.tutorial-card').exists({ count: 1 });
        assert.dom('.pix-sidebar--hidden').exists();
      });

      module('when user access again to tutorials recommended page', function () {
        test('should reset competences filters', async function (assert) {
          // given
          server.createList('tutorial', 1);
          const screen = await visit('/mes-tutos/recommandes?competences=1&pageNumber=1');

          // when
          await click(screen.getByRole('link', { name: 'Enregistrés' }));
          await click(screen.getByRole('link', { name: 'Recommandés' }));

          // then
          assert.strictEqual(currentURL(), '/mes-tutos/recommandes');
        });
      });
    });
  });
});
