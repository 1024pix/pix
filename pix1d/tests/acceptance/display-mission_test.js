import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Mission', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('displays mission page', async function (assert) {
    // given
    const mission = this.server.create('mission');
    // when
    const screen = await visit(`/missions/${mission.id}`);
    // then
    assert.dom(screen.getByText(`Titre de la mission : ${mission.name}`)).exists();
    assert.dom(screen.getByText('Démarre ton épreuve')).exists();
    assert.dom(`[href="#/missions/${mission.id}/resume"]`).exists();
  });
});
