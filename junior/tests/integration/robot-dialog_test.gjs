import { render } from '@1024pix/ember-testing-library';
import RobotDialog from 'junior/components/robot-dialog';
import { setupRenderingTest } from 'junior/helpers/tests';
import { module, test } from 'qunit';

module('Integration | Component | Robot-dialog', function (hooks) {
  setupRenderingTest(hooks);

  test('displays robot dialog with a dynamic class', async function (assert) {
    const className = 'happy';

    const screen = await render(<template><RobotDialog @class={{className}} /></template>);

    assert
      .dom(screen.getByRole('img', { name: 'mascotte pix1d' }))
      .hasAttribute('src', '/images/robot/dialog-robot-happy.svg');
  });
});
