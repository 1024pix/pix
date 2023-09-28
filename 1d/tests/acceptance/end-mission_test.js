import { clickByText, visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';

module('Acceptance | Challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('redirect to home page after clicking on return button', async function (assert) {
    // given
    const mission = this.server.create('mission');
    const assessment = this.server.create('assessment', { missionId: mission.id });

    // when
    await visit(`/assessments/${assessment.id}/results`);
    await clickByText(this.intl.t('pages.missions.end-page.back-to-missions'));

    // then
    assert.strictEqual(currentURL(), '/missions');
  });
});
