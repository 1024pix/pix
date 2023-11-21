import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from '../../../helpers/tests';

module('Integration | Component | Bubble', function (hooks) {
  setupRenderingTest(hooks);
  test('displays message in a bubble', async function (assert) {
    this.set('message', 'Bim');

    const screen = await render(hbs`<Bubble @message={{this.message}} />`);

    assert.dom(screen.getByText('Bim')).exists();
  });

  test('displays bubble with a specific color', async function (assert) {
    this.set('color', 'success');

    await render(hbs`<Bubble @color={{this.color}} />`);

    assert.dom('.bubble--success').exists();
  });
});
