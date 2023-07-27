import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | ChallengePreview', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('displays challenge preview', async function (assert) {
    // given
    const challenge = this.server.create('challenge');
    // when
    const screen = await visit(`/challenges/${challenge.id}/preview`);
    // then
    assert.dom(screen.getByText(`${challenge.instruction}`)).exists();
  });
});
