import { clickByText, visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { currentURL } from '@ember/test-helpers';

module('Acceptance | Challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('redirect to first challenge page after clicking on start mission', async function (assert) {
    // given
    const mission = this.server.create('mission');
    this.server.create('challenge');
    // when
    await visit(`#/missions/${mission.id}`);
    await clickByText('Démarre ton épreuve');
    // then
    assert.strictEqual(currentURL(), `/assessments/1/challenges`);
  });
});
