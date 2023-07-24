import { visit } from '@1024pix/ember-testing-library';
import { module, skip } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click } from '@ember/test-helpers';

module('Acceptance | Challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  //TODO Trouver comment tester l'affichage réel de la popup. L'assert répond toujours ok :(
  skip('displays warning modal', async function (assert) {
    const assessment = this.server.create('assessment');
    this.server.create('challenge');
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    await click(screen.getByRole('button', { name: 'Je continue' }));

    // then
    assert.dom(screen.getByText("Pour valider la mission, tu dois terminer l'activité.")).isVisible();
  });
});
