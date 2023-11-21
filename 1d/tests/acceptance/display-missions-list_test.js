import { visit, within } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import identifyLearner from '../helpers/identify-learner';
import { setupApplicationTest } from '../helpers';

module('Acceptance | Display missions list', function (hooks) {
  setupApplicationTest(hooks);
  test('displays missions list page', async function (assert) {
    // given
    identifyLearner(this.owner);
    // when
    const screen = await visit('/');
    // then
    assert.dom(within(screen.getByText('Recherche sur internet').parentElement).getByText('Terminé')).exists();
    assert.dom(within(screen.getByText('Données personnelles').parentElement).queryByText('Terminé')).doesNotExist();
  });
});
