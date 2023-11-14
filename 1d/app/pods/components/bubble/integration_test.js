import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from '../../../helpers/tests';

module('Integration | Component | Bubble', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('displays message in a bubble', async function (assert) {
    this.set('message', 'Bim');

    const screen = await render(hbs`<Bubble @message={{this.message}} />`);

    assert.dom(screen.getByText('Bim')).exists();
  });

  test('displays bubble with a specific color', async function (assert) {
    this.set('color', 'green');

    await render(hbs`<Bubble @color={{this.color}} />`);

    assert.dom('.bubble--green').exists();
  });
});
