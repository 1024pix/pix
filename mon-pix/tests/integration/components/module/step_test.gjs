import { render } from '@1024pix/ember-testing-library';
import ModulixStep from 'mon-pix/components/module/step';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Step', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('unique element', function () {
    test('should display a step with a text element', async function (assert) {
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

    test('should display a step with a qcu element', async function (assert) {
      // given
      const element = {
        id: 'd0690f26-978c-41c3-9a21-da931857739c',
        instruction: 'Instruction',
        proposals: [
          { id: '1', content: 'radio1' },
          { id: '2', content: 'radio2' },
        ],
        type: 'qcu',
      };
      const step = {
        elements: [element],
      };
      const getLastCorrectionForElementStub = () => {};

      // when
      const screen = await render(
        <template>
          <ModulixStep @step={{step}} @getLastCorrectionForElement={{getLastCorrectionForElementStub}} />
        </template>,
      );

      // then
      assert.dom(screen.queryByRole('button', { name: 'Vérifier' })).exists();
    });
  });
});
