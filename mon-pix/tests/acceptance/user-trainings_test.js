import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, currentURL, find } from '@ember/test-helpers';
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
      await visit('/mes-formations');

      // then
      assert.strictEqual(currentURL(), '/mes-formations');
      assert.dom('.user-trainings-banner__title').exists();
      assert.ok(find('.user-trainings-banner__title').textContent.includes('Mes formations'));
      assert.dom('.user-trainings-banner__description').exists();
      assert.ok(
        find('.user-trainings-banner__description').textContent.includes(
          'Continuez à progresser grâce aux formations recommandées à l’issue de vos parcours d’évaluation.'
        )
      );
      assert.dom('.user-trainings-content__container').exists();
      assert.dom('.user-trainings-content-list__item').exists();
      assert.dom('.user-trainings-content-list__item').exists({ count: 2 });

      const pixPaginationTextContent = find('.pix-pagination__navigation').textContent;
      assert.ok(pixPaginationTextContent.includes('2 éléments'));
      assert.ok(pixPaginationTextContent.includes('Page 1 / 1'));
    });
  });
});
