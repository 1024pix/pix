import { visit, within } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import identifiyLearner from '../helpers/identify-learner';

module('Acceptance | Display missions list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('displays missions list page', async function (assert) {
    // given
    identifiyLearner({ firstName: 'Élisa' }, this.owner);
    // when
    const screen = await visit('/');
    // then
    assert.dom(within(screen.getByText('Recherche sur internet').parentElement).getByText('Terminé')).exists();
    assert.dom(within(screen.getByText('Données personnelles').parentElement).queryByText('Terminé')).doesNotExist();
  });
});
