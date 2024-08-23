import { clickByName, render } from '@1024pix/ember-testing-library';
import ModulixStepper from 'mon-pix/components/module/stepper';
import { module, test } from 'qunit';
import sinon from 'sinon';

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
      assert
        .dom(screen.getByRole('button', { name: this.intl.t('pages.modulix.buttons.stepper.next.ariaLabel') }))
        .exists();
    });

    module('When step contains answerable elements', function () {
      module('When the only answerable element is unanswered', function () {
        test('should not display the Next button', async function (assert) {
          // given
          const steps = [
            {
              elements: [
                {
                  id: 'd0690f26-978c-41c3-9a21-da931857739c',
                  instruction: 'Instruction',
                  proposals: [
                    { id: '1', content: 'radio1' },
                    { id: '2', content: 'radio2' },
                  ],
                  isAnswerable: true,
                  type: 'qcu',
                },
              ],
            },
            {
              elements: [
                {
                  id: '768441a5-a7d6-4987-ada9-7253adafd842',
                  type: 'text',
                  content: '<p>Text 2</p>',
                  isAnswerable: false,
                },
              ],
            },
          ];
          function getLastCorrectionForElementStub() {}

          const store = this.owner.lookup('service:store');
          const passage = store.createRecord('passage');
          passage.getLastCorrectionForElement = getLastCorrectionForElementStub;

          // when
          const screen = await render(
            <template>
              <ModulixStepper
                @passage={{passage}}
                @steps={{steps}}
                @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
              />
            </template>,
          );

          // then
          assert
            .dom(screen.queryByRole('button', { name: this.intl.t('pages.modulix.buttons.stepper.next.ariaLabel') }))
            .doesNotExist();
        });
      });

      module('When we verify an answerable element', function () {
        test('should call the onElementAnswer action', async function (assert) {
          // given
          const steps = [
            {
              elements: [
                {
                  id: 'd0690f26-978c-41c3-9a21-da931857739c',
                  instruction: 'Instruction',
                  proposals: [
                    { id: '1', content: 'radio1' },
                    { id: '2', content: 'radio2' },
                  ],
                  isAnswerable: true,
                  type: 'qcu',
                },
              ],
            },
            {
              elements: [
                {
                  id: '768441a5-a7d6-4987-ada9-7253adafd842',
                  type: 'text',
                  content: '<p>Text 2</p>',
                  isAnswerable: false,
                },
              ],
            },
          ];
          function getLastCorrectionForElementStub() {}
          const onElementAnswerStub = sinon.stub();
          const store = this.owner.lookup('service:store');
          const passage = store.createRecord('passage');
          passage.getLastCorrectionForElement = getLastCorrectionForElementStub;

          // when
          await render(
            <template>
              <ModulixStepper
                @passage={{passage}}
                @steps={{steps}}
                @onElementAnswer={{onElementAnswerStub}}
                @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
              />
            </template>,
          );

          // then
          await clickByName('radio1');
          await clickByName(this.intl.t('pages.modulix.buttons.activity.verify'));
          sinon.assert.calledOnce(onElementAnswerStub);
          assert.ok(true);
        });
      });

      module('When we retry an answerable element', function () {
        test('should call the onElementRetry action', async function (assert) {
          // given
          const steps = [
            {
              elements: [
                {
                  id: 'd0690f26-978c-41c3-9a21-da931857739c',
                  instruction: 'Instruction',
                  proposals: [
                    { id: '1', content: 'radio1' },
                    { id: '2', content: 'radio2' },
                  ],
                  isAnswerable: true,
                  type: 'qcu',
                },
              ],
            },
            {
              elements: [
                {
                  id: '768441a5-a7d6-4987-ada9-7253adafd842',
                  type: 'text',
                  content: '<p>Text 2</p>',
                  isAnswerable: false,
                },
              ],
            },
          ];
          const onElementRetryStub = sinon.stub();
          const store = this.owner.lookup('service:store');
          const passage = store.createRecord('passage');
          const correctionResponse = store.createRecord('correction-response', {
            feedback: 'Too bad!',
            status: 'ko',
            solution: '1',
          });
          store.createRecord('element-answer', {
            correction: correctionResponse,
            elementId: 'd0690f26-978c-41c3-9a21-da931857739c',
            passage,
          });
          function getLastCorrectionForElementStub(element) {
            if (element.id === 'd0690f26-978c-41c3-9a21-da931857739c') {
              return correctionResponse;
            }
            return undefined;
          }

          // when
          await render(
            <template>
              <ModulixStepper
                @passage={{passage}}
                @steps={{steps}}
                @onElementRetry={{onElementRetryStub}}
                @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
              />
            </template>,
          );

          // then
          await clickByName('radio1');
          await clickByName(this.intl.t('pages.modulix.buttons.activity.retry'));
          sinon.assert.calledOnce(onElementRetryStub);
          assert.ok(true);
        });
      });

      module('When at least one of the answerable elements is unanswered', function () {
        test('should not display the Next button', async function (assert) {
          // given
          const steps = [
            {
              elements: [
                {
                  id: 'd0690f26-978c-41c3-9a21-da931857739c',
                  instruction: 'Instruction',
                  proposals: [
                    { id: '1', content: 'radio1' },
                    { id: '2', content: 'radio2' },
                  ],
                  isAnswerable: true,
                  type: 'qcu',
                },
                {
                  id: '69f08624-6e63-4be1-b662-6e6bc820d99f',
                  instruction: 'Instruction',
                  proposals: [
                    { id: '1', content: 'radio3' },
                    { id: '2', content: 'radio4' },
                  ],
                  isAnswerable: true,
                  type: 'qcu',
                },
              ],
            },
            {
              elements: [
                {
                  id: '768441a5-a7d6-4987-ada9-7253adafd842',
                  type: 'text',
                  content: '<p>Text 2</p>',
                  isAnswerable: false,
                },
              ],
            },
          ];
          function getLastCorrectionForElementStub(element) {
            if (element.id === 'd0690f26-978c-41c3-9a21-da931857739c') {
              return Symbol('Correction');
            } else {
              return undefined;
            }
          }

          const store = this.owner.lookup('service:store');
          const passage = store.createRecord('passage');
          passage.getLastCorrectionForElement = getLastCorrectionForElementStub;

          // when
          const screen = await render(
            <template>
              <ModulixStepper
                @passage={{passage}}
                @steps={{steps}}
                @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
              />
            </template>,
          );

          // then
          assert
            .dom(screen.queryByRole('button', { name: this.intl.t('pages.modulix.buttons.stepper.next.ariaLabel') }))
            .doesNotExist();
        });
      });

      module('When all answerable elements are answered', function () {
        test('should display the next button', async function (assert) {
          // given
          const steps = [
            {
              elements: [
                {
                  id: 'd0690f26-978c-41c3-9a21-da931857739c',
                  instruction: 'Instruction',
                  proposals: [
                    { id: '1', content: 'radio1' },
                    { id: '2', content: 'radio2' },
                  ],
                  isAnswerable: true,
                  type: 'qcu',
                },
              ],
            },
            {
              elements: [
                {
                  id: '768441a5-a7d6-4987-ada9-7253adafd842',
                  type: 'text',
                  content: '<p>Text 2</p>',
                  isAnswerable: false,
                },
              ],
            },
          ];
          function getLastCorrectionForElementStub() {}

          const store = this.owner.lookup('service:store');
          const passage = store.createRecord('passage');
          const correction = store.createRecord('correction-response');
          store.createRecord('element-answer', {
            elementId: 'd0690f26-978c-41c3-9a21-da931857739c',
            correction,
            passage,
          });

          // when
          const screen = await render(
            <template>
              <ModulixStepper
                @passage={{passage}}
                @steps={{steps}}
                @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
              />
            </template>,
          );

          // then
          assert
            .dom(screen.queryByRole('button', { name: this.intl.t('pages.modulix.buttons.stepper.next.ariaLabel') }))
            .exists();
        });
      });
    });

    module('When stepper contains unsupported elements', function () {
      module('When there is no supported elements in one step', function () {
        test('should not display the Step', async function (assert) {
          // given
          const steps = [
            {
              elements: [
                {
                  id: '768441a5-a7d6-4987-ada9-7253adafd842',
                  type: 'unknown',
                  content: 'content',
                },
              ],
            },
            {
              elements: [
                {
                  id: 'd0690f26-978c-41c3-9a21-da931857739c',
                  type: 'text',
                  content: '<p>Text 2</p>',
                  isAnswerable: false,
                },
              ],
            },
          ];
          function getLastCorrectionForElementStub() {}

          const store = this.owner.lookup('service:store');
          const passage = store.createRecord('passage');

          // when
          const screen = await render(
            <template>
              <ModulixStepper
                @passage={{passage}}
                @steps={{steps}}
                @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
              />
            </template>,
          );

          // then
          assert.strictEqual(screen.getAllByRole('heading', { level: 3 }).length, 1);
          assert.dom(screen.getByRole('heading', { level: 3, name: 'Étape 1 sur 1' })).exists();
          assert
            .dom(screen.queryByRole('button', { name: this.intl.t('pages.modulix.buttons.stepper.next.ariaLabel') }))
            .doesNotExist();
        });
      });

      module('When there are no supported elements at all', function () {
        test('should not display the Stepper', async function (assert) {
          // given
          const steps = [
            {
              elements: [
                {
                  id: '768441a5-a7d6-4987-ada9-7253adafd842',
                  type: 'unknown',
                  content: 'content',
                },
              ],
            },
            {
              elements: [
                {
                  id: 'd0690f26-978c-41c3-9a21-da931857739c',
                  type: 'unknown',
                  content: '<p>Text 2</p>',
                },
              ],
            },
          ];
          function getLastCorrectionForElementStub() {}

          const store = this.owner.lookup('service:store');
          const passage = store.createRecord('passage');

          // when
          const screen = await render(
            <template>
              <ModulixStepper
                @passage={{passage}}
                @steps={{steps}}
                @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
              />
            </template>,
          );

          // then
          assert.strictEqual(screen.queryAllByRole('heading', { level: 3 }).length, 0);
          assert.dom(screen.queryByRole('heading', { level: 3, name: 'Étape 1 sur 1' })).doesNotExist();
        });
      });
    });

    module('When user clicks on the Next button', function () {
      test('should display the next step', async function (assert) {
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

        function stepperIsFinished() {}
        function onStepperNextStepStub() {}

        const screen = await render(
          <template>
            <ModulixStepper
              @steps={{steps}}
              @stepperIsFinished={{stepperIsFinished}}
              @onStepperNextStep={{onStepperNextStepStub}}
            />
          </template>,
        );

        // when
        await clickByName(this.intl.t('pages.modulix.buttons.stepper.next.ariaLabel'));

        // then
        assert.strictEqual(screen.getAllByRole('heading', { level: 3 }).length, 2);
      });

      test('should not display the Next button when there are no steps left', async function (assert) {
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

        function stepperIsFinished() {}
        function onStepperNextStepStub() {}

        const screen = await render(
          <template>
            <ModulixStepper
              @steps={{steps}}
              @stepperIsFinished={{stepperIsFinished}}
              @onStepperNextStep={{onStepperNextStepStub}}
            />
          </template>,
        );

        // when
        await clickByName(this.intl.t('pages.modulix.buttons.stepper.next.ariaLabel'));
        assert
          .dom(screen.queryByRole('button', { name: this.intl.t('pages.modulix.buttons.stepper.next.ariaLabel') }))
          .doesNotExist();
      });
    });

    module('When isFolded parameter is false', function () {
      test('should display all the steps', async function (assert) {
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
        const screen = await render(<template><ModulixStepper @steps={{steps}} @isFolded={{false}} /></template>);

        // then
        assert.strictEqual(screen.getAllByRole('heading', { level: 3 }).length, 2);
        assert.dom(screen.getByRole('heading', { level: 3, name: 'Étape 1 sur 2' })).exists();
        assert.dom(screen.getByRole('heading', { level: 3, name: 'Étape 2 sur 2' })).exists();
      });

      module('When has unsupported elements', function () {
        test('should display all the steps but filter out unsupported element', async function (assert) {
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
            {
              elements: [
                {
                  id: 'd7870bf4-e018-482a-829c-6a124066b352',
                  type: 'nope',
                },
              ],
            },
          ];

          // when
          const screen = await render(<template><ModulixStepper @steps={{steps}} @isFolded={{false}} /></template>);

          // then
          assert.strictEqual(screen.getAllByRole('heading', { level: 3 }).length, 2);
          assert.dom(screen.getByRole('heading', { level: 3, name: 'Étape 1 sur 2' })).exists();
          assert.dom(screen.getByRole('heading', { level: 3, name: 'Étape 2 sur 2' })).exists();
        });
      });
    });
  });
});
