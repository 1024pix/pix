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
    assert.equal(screen.getAllByText(`${mission.name}`).length, 2);
    assert.dom(screen.getByText('Je commence')).exists();
    assert.dom(`[href="/missions/${mission.id}/resume"]`).exists();
  });
});
