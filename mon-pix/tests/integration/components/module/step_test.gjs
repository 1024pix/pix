import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import ModulixStep from 'mon-pix/components/module/step';
import { module, test } from 'qunit';

module('Integration | Component | Module | Step', function (hooks) {
  setupRenderingTest(hooks);

  test('should display a step with an element', async function (assert) {
    // given
    const element = {
      id: '768441a5-a7d6-4987-ada9-7253adafd842',
      type: 'text',
      content: 'content',
    };
    const step = {
      elements: [element],
    };

    // when
    const screen = await render(<template><ModulixStep @step={{step}} /></template>);

    // then
    assert.dom(screen.getByText(element.content)).exists();
  });
});
