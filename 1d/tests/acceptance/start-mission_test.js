import { clickByText, visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import identifyLearner from '../helpers/identify-learner';
import { setupApplicationTest } from '../helpers';

module('Acceptance | Start mission', function (hooks) {
  setupApplicationTest(hooks);

  test('redirect to first challenge page after clicking on start mission', async function (assert) {
    // given
    identifyLearner(this.owner);
    const mission = this.server.create('mission');
    this.server.create('challenge');

    // when
    try {
      await visit(`/missions/${mission.id}`);
      await clickByText(this.intl.t('pages.missions.start-page.start-mission'));
    } catch (error) {
      const { message } = error;
      if (message !== 'TransitionAborted') {
        throw error;
      }
    }
    // then
    assert.strictEqual(currentURL(), `/assessments/1/challenges`);
  });
});
