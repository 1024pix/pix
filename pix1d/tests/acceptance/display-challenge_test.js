import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('displays challenge page', async function (assert) {
    const assessment = this.server.create('assessment');
    const challenge = this.server.create('challenge');
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    // then
    assert.dom(screen.getByText(challenge.instruction)).exists();
    assert.dom(screen.getByRole('button', { name: 'Vérifier' })).exists();
  });
});
