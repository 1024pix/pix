import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from '../../../helpers/tests';

module('Integration | Component | Robot dialog', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('displays robot dialog when there is an instruction', async function (assert) {
    this.set('instruction', 'Hello chaton !');

    const screen = await render(hbs`<RobotDialog><Bubble @message={{this.instruction}} /></RobotDialog>`);

    assert.dom('.robot-speaking').exists();
    assert.dom(screen.getByText('Hello chaton !')).exists();
  });

  test('displays robot dialog with a happy class', async function (assert) {
    this.set('instruction', 'Hello chaton !');
    this.set('class', 'happy');

    const screen = await render(hbs`<RobotDialog @class={{this.class}} />`);

    assert.dom(screen.getByRole('img', { name: 'mascotte pix1d' })).hasAttribute('src', '/images/happy-robot.svg');
  });
});
