import { clickByText, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../helpers';
import identifyLearner from '../helpers/identify-learner';

module('Acceptance | End mission', function (hooks) {
  setupApplicationTest(hooks);
  test('displays mission validated objectives', async function (assert) {
    // given
    const mission = this.server.create('mission');
    const assessment = this.server.create('assessment', { missionId: mission.id });
    identifyLearner(this.owner);

    // when
    const screen = await visit(`/assessments/${assessment.id}/results`);

    // then
    assert.dom(screen.getByText('Recherche sur internet')).exists();
    assert.dom(screen.getByText('validatedObjectives')).exists();
    assert.dom(screen.getByText(this.intl.t('pages.missions.end-page.back-to-missions'))).exists();
  });

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
