import { visit } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { click, find } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../../helpers/authentication';

module('Acceptance | User-tutorials | Saved', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;

  hooks.beforeEach(async function () {
    const numberOfTutorials = 100;
    user = server.create('user', 'withEmail');
    await authenticate(user);
    await server.db.tutorials.remove();
    server.createList('tutorial', numberOfTutorials, 'withUserSavedTutorial');
  });

  module('When there are tutorials saved', function () {
    test('should display paginated tutorial cards', async function (assert) {
      await visit('/mes-tutos/enregistres');
      assert.dom('.tutorial-card').exists();
      assert.dom('.tutorial-card').exists({ count: 10 });

      const pixPaginationTextContent = find('.pix-pagination__navigation').textContent;
      assert.ok(pixPaginationTextContent.includes('100 éléments'));
      assert.ok(pixPaginationTextContent.includes('Page 1 / 10'));
    });

    module('when user clicking save again', function () {
      test('should remove tutorial ', async function (assert) {
        // given
        const numberOfTutorials = 10;
        await server.db.tutorials.remove();
        await server.db.userSavedTutorials.remove();
        server.createList('tutorial', numberOfTutorials, 'withUserSavedTutorial');
        await visit('/mes-tutos/enregistres');

        // when
        await click('[aria-label="Retirer de ma liste de tutos"]');

        // then
        assert.dom('.tutorial-card').exists({ count: 9 });
      });
    });
  });
});
