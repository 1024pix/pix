import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, find, findAll, click } from '@ember/test-helpers';
import { authenticateByEmail } from '../../helpers/authentication';

module('Acceptance | User-tutorials-v2 | Saved', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;

  hooks.beforeEach(async function () {
    const numberOfTutorials = 100;
    user = server.create('user', 'withEmail');
    await authenticateByEmail(user);
    await server.db.tutorials.remove();
    server.createList('tutorial', numberOfTutorials, 'withUserTutorial');
  });

  module('When there are tutorials saved', function () {
    test('should display paginated tutorial cards', async function (assert) {
      await visit('/mes-tutos/enregistres');
      assert.dom(findAll('.tutorial-card-v2')).exists();
      assert.equal(findAll('.tutorial-card-v2').length, 10);
      assert.dom(find('.pix-pagination__navigation').textContent).hasText('Page 1 / 10');
    });

    module('when user clicking save again', function () {
      test('should remove tutorial ', async function (assert) {
        // given
        const numberOfTutorials = 10;
        await server.db.tutorials.remove();
        await server.db.userTutorials.remove();
        server.createList('tutorial', numberOfTutorials, 'withUserTutorial');
        await visit('/mes-tutos/enregistres');

        // when
        await click('[aria-label="Retirer de ma liste de tutos"]');

        // then
        assert.equal(findAll('.tutorial-card-v2').length, 9);
      });
    });
  });
});
