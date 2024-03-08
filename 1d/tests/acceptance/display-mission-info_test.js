import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../helpers';
import identifyLearner from '../helpers/identify-learner';

module('Acceptance | Display informations about the mission', function (hooks) {
  setupApplicationTest(hooks);
  test('displays mission page', async function (assert) {
    // given
    identifyLearner(this.owner);
    const mission = this.server.create('mission');
    // when
    const screen = await visit(`/missions/${mission.id}`);
    // then
    assert.dom(screen.getByText('Recherche sur internet')).exists();
    assert.dom(screen.getByText('learningObjectives')).exists();
    assert.dom(screen.getByText(this.intl.t('pages.missions.start-page.start-mission'))).exists();
  });
});
