import { clickByText, visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('displays answer modal', async function (assert) {
    const assessment = this.server.create('assessment');
    this.server.create('challenge');
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    await clickByText('Vérifier');

    // then
    assert.dom(screen.getByText("Bravo ! C'est la bonne réponse !")).exists();
  });
});
