import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifiers | focus', function (hooks) {
  setupRenderingTest(hooks);

  test('it should focus the item', async function (assert) {
    // when
    const screen = await render(
      hbs`<Input placeholder="Je suis pas focus"/><Input placeholder="Je suis focus" {{focus}}/>`
    );

    // then
    const focusedElement = document.activeElement;
    assert.deepEqual(focusedElement, screen.getByPlaceholderText('Je suis focus'));
  });
});
