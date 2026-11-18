import { visit, within } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { currentURL, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';

module('Acceptance | mes-formations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;

  module('When user has recommended trainings', function () {
    test('should display menu item "Mes formations"', async function (assert) {
      // given
      user = server.create('user', 'withEmail', 'withSomeTrainings');

      // when
      await authenticate(user);
      await visit('/');

      // then
      const menuItem = find('[href="/mes-formations"]');
      assert.ok(menuItem.textContent.includes('Mes formations'));
    });
  });

  module('When the user tries to reach /mes-formations', function () {
    test('the user-trainings page is displayed to the user', async function (assert) {
      // given
      user = server.create('user', 'withEmail', 'withSomeTrainings');

      // when
      await authenticate(user);
      const screen = await visit('/mes-formations');

      // then
      assert.strictEqual(currentURL(), '/mes-formations');
      assert.dom('h1').hasText('Mes formations');
      assert
        .dom(
          screen.getByText(
            'Continuez à progresser grâce aux formations recommandées à l’issue de vos parcours d’évaluation.',
          ),
        )
        .exists();

      const mainContent = find('main');
      const trainings = within(mainContent).getAllByRole('listitem');
      assert.ok(trainings.length, 2);
      assert.dom(screen.getByText('Devenir tailleur de citrouille')).exists();
      assert.dom(screen.getByText('Apprendre à piloter des chauves-souris')).exists();

      assert.dom(screen.getByText('2 éléments')).exists();
      assert.dom(screen.getByText('Page 1 / 1')).exists();
    });
  });
});
