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
      const screen = await render(
        <template><ModulixStep @step={{step}} @currentStep={{1}} @totalSteps={{4}} /></template>,
      );

      // then
      assert.dom(screen.getByText(element.content)).exists();
      assert.dom(screen.getByRole('heading', { name: 'Étape 1 sur 4', level: 3 })).exists();
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

  module('unsupported element', function () {
    module('when there is no supported elements', function () {
      test('should not display a step', async function (assert) {
        // given
        const element = {
          id: '768441a5-a7d6-4987-ada9-7253adafd842',
          type: 'unknown',
          content: 'content',
        };
        const step = {
          elements: [element],
        };

        // when
        const screen = await render(
          <template><ModulixStep @step={{step}} @currentStep={{1}} @totalSteps={{4}} /></template>,
        );

        // then
        assert.dom(screen.queryByText(element.content)).doesNotExist();
        assert.dom(screen.queryByRole('heading', { name: 'Étape 1 sur 4', level: 3 })).doesNotExist();
      });
    });

    module('when one of the elements is not supported', function () {
      test('should not display this element', async function (assert) {
        // given
        const unknownElement = {
          id: '768441a5-a7d6-4987-ada9-7253adafd842',
          type: 'unknown',
          content: 'content',
        };
        const textElement = {
          id: 'd0690f26-978c-41c3-9a21-da931857739c',
          content: 'Instruction',
          type: 'text',
        };
        const step = {
          elements: [unknownElement, textElement],
        };

        // when
        const screen = await render(
          <template><ModulixStep @step={{step}} @currentStep={{1}} @totalSteps={{4}} /></template>,
        );

        // then
        assert.dom(screen.getByText(textElement.content)).exists();
        assert.dom(screen.queryByText(unknownElement.content)).doesNotExist();
        assert.dom(screen.getByRole('heading', { name: 'Étape 1 sur 4', level: 3 })).exists();
      });
    });
  });
});
