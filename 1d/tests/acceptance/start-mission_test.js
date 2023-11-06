import { clickByText, visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { currentURL } from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
import identifyLearner from '../helpers/identify-learner';

module('Acceptance | Start mission', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('redirect to first challenge page after clicking on start mission', async function (assert) {
    // given
    identifyLearner(this.owner);
    const mission = this.server.create('mission');
    this.server.create('challenge');
    // when
    await visit(`/missions/${mission.id}`);
    await clickByText(this.intl.t('pages.missions.start-page.start-mission'));
    // then
    assert.strictEqual(currentURL(), `/assessments/1/challenges`);
  });
});
