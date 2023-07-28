import { clickByText, visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { currentURL } from '@ember/test-helpers';

module('Acceptance | Challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('redirect to home page after clicking on return button', async function (assert) {
    // given
    const mission = this.server.create('mission');
    const assessment = this.server.create('assessment', { missionId: mission.id });

    // when
    await visit(`/assessments/${assessment.id}/results`);
    await clickByText('Retour aux missions');

    // then
    assert.strictEqual(currentURL(), '/');
  });
});
