import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
// eslint-disable-next-line no-restricted-imports
import { click, find } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { VERIFY_RESPONSE_DELAY } from 'mon-pix/components/module/component/element';
import ModulixStepper, { NEXT_STEP_BUTTON_DELAY } from 'mon-pix/components/module/component/stepper';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Stepper', function (hooks) {
  setupIntlRenderingTest(hooks);

  let clock;

  hooks.beforeEach(function () {
    clock = sinon.useFakeTimers();
  });

  hooks.afterEach(function () {
    clock.restore();
  });

  module('When stepper is vertical', function () {
    module('A Stepper with 2 steps', function () {
      test('it should set vertical class', async function (assert) {
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
        await render(<template><ModulixStepper @steps={{steps}} @direction="vertical" /></template>);

        // then
        assert.dom(find('.stepper--vertical')).exists();
      });

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
        const screen = await render(<template><ModulixStepper @steps={{steps}} @direction="vertical" /></template>);

        // then
        assert.strictEqual(screen.getAllByLabelText('1 sur 2').length, 1);
        assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.next.ariaLabel') })).exists();
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
                  @direction="vertical"
                  @passage={{passage}}
                  @steps={{steps}}
                  @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
                />
              </template>,
            );

            // then
            assert
              .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.stepper.next.ariaLabel') }))
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
            const passageEventService = this.owner.lookup('service:passage-events');
            sinon.stub(passageEventService, 'record');
            const getLastCorrectionForElementStub = sinon.stub();
            const onElementAnswerStub = sinon.stub();
            const store = this.owner.lookup('service:store');
            const passage = store.createRecord('passage');
            passage.getLastCorrectionForElement = getLastCorrectionForElementStub;

            // when
            await render(
              <template>
                <ModulixStepper
                  @direction="vertical"
                  @passage={{passage}}
                  @steps={{steps}}
                  @onElementAnswer={{onElementAnswerStub}}
                  @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
                />
              </template>,
            );

            // then
            await clickByName('radio1');
            await clickByName(t('pages.modulix.buttons.activity.verify'));
            sinon.assert.calledOnce(onElementAnswerStub);
            assert.ok(true);
          });
        });

        module('When we retry an answerable element', function () {
          test('should call the onElementRetry action', async function (assert) {
            // given
            const passageEventService = this.owner.lookup('service:passage-events');
            const steps = [
              {
                elements: [
                  {
                    id: 'd0690f26-978c-41c3-9a21-da931857739c',
                    instruction: 'Instruction',
                    proposals: [
                      { id: '1', content: 'radio1', feedback: { state: 'ok' } },
                      { id: '2', content: 'radio2', feedback: { state: 'ko' } },
                    ],
                    isAnswerable: true,
                    solution: '1',
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
            const onElementAnswerStub = sinon.stub();
            const store = this.owner.lookup('service:store');
            const passage = store.createRecord('passage');
            sinon.stub(passageEventService, 'record');

            function getLastCorrectionForElementStub(element) {
              if (element.id === 'd0690f26-978c-41c3-9a21-da931857739c') {
                return {};
              }
              return undefined;
            }

            // when
            const screen = await render(
              <template>
                <ModulixStepper
                  @direction="vertical"
                  @passage={{passage}}
                  @steps={{steps}}
                  @onElementAnswer={{onElementAnswerStub}}
                  @onElementRetry={{onElementRetryStub}}
                  @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
                />
              </template>,
            );

            // then
            await clickByName('radio2');
            const verifyButton = screen.getByRole('button', { name: 'Vérifier ma réponse' });
            await click(verifyButton);
            await clock.tickAsync(VERIFY_RESPONSE_DELAY);
            const retryButton = screen.getByRole('button', { name: t('pages.modulix.buttons.activity.retry') });
            await click(retryButton);
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
                  @direction="vertical"
                  @passage={{passage}}
                  @steps={{steps}}
                  @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
                />
              </template>,
            );

            // then
            assert
              .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.stepper.next.ariaLabel') }))
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
                  @direction="vertical"
                  @passage={{passage}}
                  @steps={{steps}}
                  @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
                />
              </template>,
            );

            // then
            assert
              .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.stepper.next.ariaLabel') }))
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
                  @direction="vertical"
                  @passage={{passage}}
                  @steps={{steps}}
                  @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
                />
              </template>,
            );

            // then
            assert.strictEqual(screen.getAllByLabelText('1 sur 1').length, 1);

            assert
              .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.stepper.next.ariaLabel') }))
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
                  @direction="vertical"
                  @passage={{passage}}
                  @steps={{steps}}
                  @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
                />
              </template>,
            );

            // then
            assert.dom(screen.queryByLabelText('1 sur 1')).doesNotExist();
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
                @direction="vertical"
                @steps={{steps}}
                @stepperIsFinished={{stepperIsFinished}}
                @onStepperNextStep={{onStepperNextStepStub}}
              />
            </template>,
          );

          // when
          await clickByName(t('pages.modulix.buttons.stepper.next.ariaLabel'));

          // then
          assert.strictEqual(screen.getAllByLabelText('1 sur 2').length, 1);
          assert.strictEqual(screen.getAllByLabelText('2 sur 2').length, 1);
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
                @direction="vertical"
                @steps={{steps}}
                @stepperIsFinished={{stepperIsFinished}}
                @onStepperNextStep={{onStepperNextStepStub}}
              />
            </template>,
          );

          // when
          await clickByName(t('pages.modulix.buttons.stepper.next.ariaLabel'));
          assert
            .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.stepper.next.ariaLabel') }))
            .doesNotExist();
        });
      });

      module('when preview mode is enabled', function () {
        test('should display preview information', async function (assert) {
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

          class PreviewModeServiceStub extends Service {
            isEnabled = true;
          }

          this.owner.register('service:modulixPreviewMode', PreviewModeServiceStub);

          // when
          const screen = await render(<template><ModulixStepper @steps={{steps}} @direction="vertical" /></template>);

          // then
          assert.dom(screen.getByText('Preview : stepper vertical')).exists();
        });

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

          class PreviewModeServiceStub extends Service {
            isEnabled = true;
          }

          this.owner.register('service:modulixPreviewMode', PreviewModeServiceStub);

          // when
          const screen = await render(<template><ModulixStepper @steps={{steps}} @direction="vertical" /></template>);

          // then
          assert.strictEqual(screen.getAllByLabelText('1 sur 2').length, 1);
          assert.strictEqual(screen.getAllByLabelText('2 sur 2').length, 1);
        });

        module('when has unsupported elements', function () {
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

            class PreviewModeServiceStub extends Service {
              isEnabled = true;
            }

            this.owner.register('service:modulixPreviewMode', PreviewModeServiceStub);

            // when
            const screen = await render(<template><ModulixStepper @steps={{steps}} @direction="vertical" /></template>);

            // then
            assert.strictEqual(screen.getAllByLabelText('1 sur 2').length, 1);
            assert.strictEqual(screen.getAllByLabelText('2 sur 2').length, 1);
          });
        });
      });
    });
  });

  module('When stepper is horizontal', function () {
    module('A Stepper with 2 steps', function () {
      test('it should set accessible stepper', async function (assert) {
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
        const screen = await render(
          <template><ModulixStepper @id="stepper-container-id-1" @steps={{steps}} @direction="horizontal" /></template>,
        );

        // then
        assert.dom(find('#stepper-container-id-1')).exists();
        assert
          .dom(screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.controls.previous.ariaLabel') }))
          .hasAria('controls', 'stepper-container-id-1');
        assert
          .dom(screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.controls.next.ariaLabel') }))
          .hasAria('controls', 'stepper-container-id-1');
        assert
          .dom(find('.stepper--horizontal'))
          .hasAria('roleDescription', t('pages.modulix.stepper.aria-role-description'));
        assert
          .dom(screen.getByRole('group'))
          .hasAria('roleDescription', t('pages.modulix.stepper.step.aria-role-description'));
      });

      test('it should display current step number', async function (assert) {
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

        // when
        const screen = await render(
          <template>
            <ModulixStepper
              @stepperIsFinished={{stepperIsFinished}}
              @onStepperNextStep={{onStepperNextStepStub}}
              @steps={{steps}}
              @direction="horizontal"
            />
          </template>,
        );

        // then
        const title = screen.getByRole('paragraph', {
          name: t('pages.modulix.stepper.step.aria-label', {
            currentStep: 1,
            totalSteps: 2,
          }),
        });
        assert.dom(title).exists();
      });

      module('on the first step', function () {
        test('should display disabled controls buttons', async function (assert) {
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
          const screen = await render(<template><ModulixStepper @steps={{steps}} @direction="horizontal" /></template>);

          // then
          assert
            .dom(screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.controls.previous.ariaLabel') }))
            .hasAria('disabled', 'true');
          assert
            .dom(screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.controls.next.ariaLabel') }))
            .hasAria('disabled', 'true');
        });

        test('should not be able to navigate to negative step', async function (assert) {
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
          const screen = await render(<template><ModulixStepper @steps={{steps}} @direction="horizontal" /></template>);

          // then
          await click(
            screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.controls.previous.ariaLabel') }),
          );
          assert
            .dom(
              screen.getByRole('group', {
                name: t('pages.modulix.stepper.step.aria-label', {
                  currentStep: 1,
                  totalSteps: 2,
                }),
              }),
            )
            .exists();
        });
      });

      module('on the last step', function () {
        test('should not display the Next button', async function (assert) {
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
                @direction="horizontal"
                @steps={{steps}}
                @stepperIsFinished={{stepperIsFinished}}
                @onStepperNextStep={{onStepperNextStepStub}}
              />
            </template>,
          );

          // when
          await clickByName(t('pages.modulix.buttons.stepper.next.ariaLabel'));

          //then
          assert
            .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.stepper.next.ariaLabel') }))
            .doesNotExist();
        });
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
                  @direction="horizontal"
                  @passage={{passage}}
                  @steps={{steps}}
                  @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
                />
              </template>,
            );

            // then
            assert
              .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.stepper.next.ariaLabel') }))
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
            const passageEventService = this.owner.lookup('service:passage-events');
            sinon.stub(passageEventService, 'record');
            const getLastCorrectionForElementStub = sinon.stub();
            const onElementAnswerStub = sinon.stub();
            const store = this.owner.lookup('service:store');
            const passage = store.createRecord('passage');
            passage.getLastCorrectionForElement = getLastCorrectionForElementStub;

            // when
            await render(
              <template>
                <ModulixStepper
                  @direction="horizontal"
                  @passage={{passage}}
                  @steps={{steps}}
                  @onElementAnswer={{onElementAnswerStub}}
                  @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
                />
              </template>,
            );

            // then
            await clickByName('radio1');
            await clickByName(t('pages.modulix.buttons.activity.verify'));
            await clock.tickAsync(NEXT_STEP_BUTTON_DELAY + 100);
            sinon.assert.calledOnce(onElementAnswerStub);
            assert.ok(true);
          });
        });

        module('When we retry an answerable element', function () {
          test('should call the onElementRetry action', async function (assert) {
            // given
            const passageEventService = this.owner.lookup('service:passage-events');
            const steps = [
              {
                elements: [
                  {
                    id: 'd0690f26-978c-41c3-9a21-da931857739c',
                    instruction: 'Instruction',
                    proposals: [
                      { id: '1', content: 'radio1', feedback: { state: 'ok' } },
                      { id: '2', content: 'radio2', feedback: { state: 'ko' } },
                    ],
                    isAnswerable: true,
                    solution: '1',
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
            const onElementAnswerStub = sinon.stub();
            const store = this.owner.lookup('service:store');
            const passage = store.createRecord('passage');
            sinon.stub(passageEventService, 'record');

            function getLastCorrectionForElementStub(element) {
              if (element.id === 'd0690f26-978c-41c3-9a21-da931857739c') {
                return {};
              }
              return undefined;
            }

            // when
            const screen = await render(
              <template>
                <ModulixStepper
                  @direction="horizontal"
                  @passage={{passage}}
                  @steps={{steps}}
                  @onElementAnswer={{onElementAnswerStub}}
                  @onElementRetry={{onElementRetryStub}}
                  @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
                />
              </template>,
            );

            // then
            await clickByName('radio2');
            const verifyButton = screen.getByRole('button', { name: 'Vérifier ma réponse' });
            await click(verifyButton);
            await clock.tickAsync(VERIFY_RESPONSE_DELAY);
            const retryButton = screen.getByRole('button', { name: t('pages.modulix.buttons.activity.retry') });
            await click(retryButton);
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
                  @direction="horizontal"
                  @passage={{passage}}
                  @steps={{steps}}
                  @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
                />
              </template>,
            );

            // then
            assert
              .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.stepper.next.ariaLabel') }))
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

            function getLastCorrectionForElementStub(element) {
              if (element.id === 'd0690f26-978c-41c3-9a21-da931857739c') {
                return Symbol('Correction');
              } else {
                return undefined;
              }
            }
            const onElementAnswerStub = sinon.stub();
            const store = this.owner.lookup('service:store');
            const passage = store.createRecord('passage');
            const passageEventService = this.owner.lookup('service:passage-events');
            sinon.stub(passageEventService, 'record');

            // when
            const screen = await render(
              <template>
                <ModulixStepper
                  @direction="horizontal"
                  @passage={{passage}}
                  @steps={{steps}}
                  @onElementAnswer={{onElementAnswerStub}}
                  @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
                />
              </template>,
            );

            // then
            assert
              .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.stepper.next.ariaLabel') }))
              .doesNotExist();

            // when
            await clickByName('radio2');
            await click(screen.getByRole('button', { name: 'Vérifier ma réponse' }));
            passage.getLastCorrectionForElement = getLastCorrectionForElementStub;

            // then
            assert
              .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.stepper.next.ariaLabel') }))
              .doesNotExist();
            await clock.tickAsync(NEXT_STEP_BUTTON_DELAY + 100);
            assert
              .dom(screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.next.ariaLabel') }))
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
                  @direction="horizontal"
                  @passage={{passage}}
                  @steps={{steps}}
                  @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
                />
              </template>,
            );

            // then
            assert
              .dom(
                screen.getByRole('group', {
                  name: t('pages.modulix.stepper.step.aria-label', {
                    currentStep: 1,
                    totalSteps: 1,
                  }),
                }),
              )
              .exists();
            assert
              .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.stepper.next.ariaLabel') }))
              .doesNotExist();
          });
        });

        module('When there are no supported elements at all', function () {
          test('should not display the Stepper', async function (assert) {
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
                  @direction="horizontal"
                  @passage={{passage}}
                  @steps={{steps}}
                  @getLastCorrectionForElement={{getLastCorrectionForElementStub}}
                />
              </template>,
            );

            // then
            assert.dom(screen.queryByLabelText('1 sur 1')).doesNotExist();
          });
        });
      });

      module('When user clicks on the Next button', function () {
        test('should display the next step', async function (assert) {
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
                @direction="horizontal"
                @steps={{steps}}
                @stepperIsFinished={{stepperIsFinished}}
                @onStepperNextStep={{onStepperNextStepStub}}
              />
            </template>,
          );

          // when
          await clickByName(t('pages.modulix.buttons.stepper.next.ariaLabel'));

          // then
          assert.strictEqual(screen.getAllByLabelText('1 sur 2', { disabled: true }).length, 1);
          assert.strictEqual(screen.getAllByRole('group', { name: '2 sur 2' }).length, 1);
          assert.dom(screen.getByRole('group', { name: '2 sur 2' })).isFocused();
        });

        test('should enable the controls previous button', async function (assert) {
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
                @direction="horizontal"
                @steps={{steps}}
                @stepperIsFinished={{stepperIsFinished}}
                @onStepperNextStep={{onStepperNextStepStub}}
              />
            </template>,
          );

          // when
          await click(screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.next.ariaLabel') }));
          // then
          assert
            .dom(screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.controls.previous.ariaLabel') }))
            .doesNotHaveAria('disabled');
        });

        module('when user clicks the controls previous button', function () {
          test('should go back to previous step', async function (assert) {
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
                  @direction="horizontal"
                  @steps={{steps}}
                  @stepperIsFinished={{stepperIsFinished}}
                  @onStepperNextStep={{onStepperNextStepStub}}
                />
              </template>,
            );

            // when
            await click(screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.next.ariaLabel') }));
            await click(
              screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.controls.previous.ariaLabel') }),
            );

            // then
            assert.strictEqual(screen.getAllByRole('group', { name: '1 sur 2' }).length, 1);
            assert
              .dom(screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.controls.previous.ariaLabel') }))
              .isFocused();
          });

          test('should enable next button', async function (assert) {
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
                  @direction="horizontal"
                  @steps={{steps}}
                  @stepperIsFinished={{stepperIsFinished}}
                  @onStepperNextStep={{onStepperNextStepStub}}
                />
              </template>,
            );

            // when
            await click(screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.next.ariaLabel') }));
            await click(
              screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.controls.previous.ariaLabel') }),
            );

            // then
            assert
              .dom(screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.controls.next.ariaLabel') }))
              .doesNotHaveAria('disabled');
          });

          module('when user clicks the controls next button', function () {
            test('should go back to next step', async function (assert) {
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
                    @direction="horizontal"
                    @steps={{steps}}
                    @stepperIsFinished={{stepperIsFinished}}
                    @onStepperNextStep={{onStepperNextStepStub}}
                  />
                </template>,
              );

              // when
              await click(screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.next.ariaLabel') }));
              await click(
                screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.controls.previous.ariaLabel') }),
              );
              await click(
                screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.controls.next.ariaLabel') }),
              );

              // then
              assert.strictEqual(screen.getAllByRole('group', { name: '2 sur 2' }).length, 1);
              assert
                .dom(screen.getByRole('button', { name: t('pages.modulix.buttons.stepper.controls.next.ariaLabel') }))
                .isFocused();
            });
          });
        });
      });
    });

    module('when in preview mode', function () {
      test('should display preview information', async function (assert) {
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

        class PreviewModeServiceStub extends Service {
          isEnabled = true;
        }
        this.owner.register('service:modulixPreviewMode', PreviewModeServiceStub);

        // when
        const screen = await render(
          <template><ModulixStepper @id="stepper-container-id-1" @steps={{steps}} @direction="horizontal" /></template>,
        );

        // then
        assert.dom(screen.getByText('Preview : stepper horizontal')).exists();
      });

      test('should display all steps (becomes vertical stepper)', async function (assert) {
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

        class PreviewModeServiceStub extends Service {
          isEnabled = true;
        }
        this.owner.register('service:modulixPreviewMode', PreviewModeServiceStub);

        // when
        const screen = await render(
          <template><ModulixStepper @id="stepper-container-id-1" @steps={{steps}} @direction="horizontal" /></template>,
        );

        // then
        assert.dom(screen.getByText('Text 1')).exists();
        assert.dom(screen.getByText('Text 2')).exists();
        assert.dom(find('.stepper--vertical')).exists();
      });

      test('should not display controls buttons', async function (assert) {
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

        class PreviewModeServiceStub extends Service {
          isEnabled = true;
        }
        this.owner.register('service:modulixPreviewMode', PreviewModeServiceStub);

        // when
        const screen = await render(
          <template><ModulixStepper @id="stepper-container-id-1" @steps={{steps}} @direction="horizontal" /></template>,
        );

        // then
        assert
          .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.stepper.controls.previous.ariaLabel') }))
          .doesNotExist();
        assert
          .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.stepper.controls.next.ariaLabel') }))
          .doesNotExist();
      });

      module('when has unsupported elements', function () {
        test('should display all the steps but filter out unsupported element', async function (assert) {
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

          class PreviewModeServiceStub extends Service {
            isEnabled = true;
          }

          this.owner.register('service:modulixPreviewMode', PreviewModeServiceStub);

          // when
          const screen = await render(<template><ModulixStepper @steps={{steps}} @direction="horizontal" /></template>);

          // then
          assert.strictEqual(screen.getAllByRole('group', { name: '1 sur 2' }).length, 1);
          assert.strictEqual(screen.getAllByRole('group', { name: '2 sur 2' }).length, 1);
        });
      });
    });
  });
});
