import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifiers | focus', function (hooks) {
  setupRenderingTest(hooks);

  test('it should focus the item', async function (assert) {
    // when
    const screen = await render(
      hbs`<label>Pas Focus<Input placeholder='Je suis pas focus' /></label>
<label>Focus<Input placeholder='Je suis focus' {{focus}} /></label>`
    );

    // then
    const focusedElement = document.activeElement;
    assert.deepEqual(focusedElement, screen.getByPlaceholderText('Je suis focus'));
  });
});
