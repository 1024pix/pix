import { clickByText, visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import identifyLearner from '../helpers/identify-learner';
import { setupApplicationTest } from '../helpers';

module('Acceptance | End mission', function (hooks) {
  setupApplicationTest(hooks);
  test('redirect to home page after clicking on return button', async function (assert) {
    // given
    const mission = this.server.create('mission');
    const assessment = this.server.create('assessment', { missionId: mission.id });
    identifyLearner(this.owner);

    // when
    await visit(`/assessments/${assessment.id}/results`);
    await clickByText(this.intl.t('pages.missions.end-page.back-to-missions'));

    // then
    assert.strictEqual(currentURL(), '/');
  });
});
