import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, findAll, find, click } from '@ember/test-helpers';
import { authenticateByEmail } from '../../helpers/authentication';

module('Acceptance | User-tutorials-v2 | Recommended', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;

  hooks.beforeEach(async function () {
    user = server.create('user', 'withEmail');
    await authenticateByEmail(user);
    await server.db.tutorials.remove();
  });

  module('When there are recommended tutorials', function () {
    test('should display paginated tutorial cards', async function (assert) {
      // given
      server.createList('tutorial', 100);

      // when
      await visit('/mes-tutos/recommandes');

      //then
      assert.dom(findAll('.tutorial-card-v2')).exists();
      assert.equal(findAll('.tutorial-card-v2').length, 10);
      assert.dom(find('.pix-pagination__navigation').textContent).hasText('Page 1 / 10');
    });

    module('when a tutorial is saved', function () {
      test('should not remove it from the list when clicking on the remove button', async function (assert) {
        // given
        server.createList('tutorial', 1, 'withUserTutorial');
        await visit('/mes-tutos/recommandes');

        // when
        await click(find('[aria-label="Marquer ce tuto comme utile"]'));

        // then
        assert.equal(findAll('.tutorial-card-v2').length, 1);
      });
    });

    module('when a tutorial is liked', function () {
      test('should retrieve the appropriate status when changing page', async function (assert) {
        // given
        server.createList('tutorial', 1, 'withUserTutorial', 'withTutorialEvaluation');
        await visit('/mes-tutos/recommandes');

        // when
        await click(find('[aria-label="Ne plus considérer ce tuto comme utile"]'));
        await visit('/mes-tutos/enregistres');

        // then
        assert.dom(find('[aria-label="Marquer ce tuto comme utile"]')).exists();
      });
    });
  });
});
