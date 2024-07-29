import { visit, within } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../helpers';
import identifyLearner from '../helpers/identify-learner';

module('Acceptance | Display missions list', function (hooks) {
  setupApplicationTest(hooks);
  test('displays all the available missions', async function (assert) {
    this.server.create('mission', { name: 'mission_1' });
    this.server.create('mission', { name: 'mission_2' });

    // given
    identifyLearner(this.owner);
    // when
    const screen = await visit('/');
    // then
    assert.equal(screen.getAllByRole('button').length, 2);
    assert.dom(screen.getByText('mission_1')).exists();
    assert.dom(screen.getByText('mission_2')).exists();
  });

  test('Should mark one mission as completed', async function (assert) {
    // given
    this.server.create('mission', { id: '1', name: 'mission_1' });
    this.server.create('mission', { id: '2', name: 'mission_2' });
    const learner = this.server.create('organization-learner', { name: 'learner', completedMissionIds: ['2'] });
    identifyLearner(this.owner, { id: learner.id });

    // when
    const screen = await visit('/');

    // then
    assert.dom(within(screen.getByText('mission_1').parentElement).queryByText('Terminé')).doesNotExist();
    assert.dom(within(screen.getByText('mission_2').parentElement).getByText('Terminé')).exists();
  });
});
