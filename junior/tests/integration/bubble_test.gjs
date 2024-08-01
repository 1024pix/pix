import { render } from '@1024pix/ember-testing-library';
import Bubble from 'junior/components/bubble';
import { setupRenderingTest } from 'junior/helpers/tests';
import { module, test } from 'qunit';

module('Integration | Component | Bubble', function (hooks) {
  setupRenderingTest(hooks);

  test('displays message in a bubble', async function (assert) {
    const screen = await render(<template><Bubble @message="Bim" /></template>);
    assert.dom(screen.getByText('Bim')).exists();
  });

  test('displays bubble with a specific status', async function (assert) {
    await render(<template><Bubble @status="success" /></template>);
    assert.dom('.bubble--success').exists();
  });
});
