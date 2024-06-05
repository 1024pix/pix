import { clickByName, render } from '@1024pix/ember-testing-library';
import ModulixStepper from 'mon-pix/components/module/stepper';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Stepper', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('A Stepper with 2 steps', function () {
    test('should display the first step with the button Next', async function (assert) {
      // given
      const steps = [
        {
          elements: [
            {
              id: '342183f7-af51-4e4e-ab4c-ebed1e195063',
              type: 'text',
              content: '<p>Text 1</p>',
            },
          ],
        },
        {
          elements: [
            {
              id: '768441a5-a7d6-4987-ada9-7253adafd842',
              type: 'text',
              content: '<p>Text 2</p>',
            },
          ],
        },
      ];

      // when
      const screen = await render(<template><ModulixStepper @steps={{steps}} /></template>);

      // then
      assert.strictEqual(screen.getAllByRole('heading', { level: 3 }).length, 1);
      assert.dom(screen.getByRole('heading', { level: 3, name: 'Étape 1 sur 2' })).exists();
      assert.dom(screen.getByRole('button', { name: this.intl.t('pages.modulix.buttons.stepper.next') })).exists();
    });

    test('should display the next step by clicking on the Next button', async function (assert) {
      // given
      const steps = [
        {
          elements: [
            {
              id: '342183f7-af51-4e4e-ab4c-ebed1e195063',
              type: 'text',
              content: '<p>Text 1</p>',
            },
          ],
        },
        {
          elements: [
            {
              id: '768441a5-a7d6-4987-ada9-7253adafd842',
              type: 'text',
              content: '<p>Text 2</p>',
            },
          ],
        },
      ];
      const screen = await render(<template><ModulixStepper @steps={{steps}} /></template>);

      // when
      await clickByName(this.intl.t('pages.modulix.buttons.stepper.next'));

      // then
      assert.strictEqual(screen.getAllByRole('heading', { level: 3 }).length, 2);
    });
  });
});
