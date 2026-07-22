import { clickByName, render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { click, find, findAll } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { VERIFY_RESPONSE_DELAY } from 'mon-pix/components/module/component/element';
import { NEXT_STEP_BUTTON_DELAY } from 'mon-pix/components/module/component/stepper';
import ModuleGrain from 'mon-pix/components/module/grain/grain';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Grain', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display given grain with its current step', async function (assert) {
    // given
    const grain = { id: '12345-abcdef', components: [] };
    const currentStep = 1;
    const totalSteps = 10;

    // when
    const screen = await render(
      <template><ModuleGrain @grain={{grain}} @currentStep={{currentStep}} @totalSteps={{totalSteps}} /></template>,
    );

    // then
    assert.ok(screen.getByRole('heading', { name: `Étape ${currentStep} sur ${totalSteps}`, level: 3 }));
    assert.dom('.grain').hasAttribute('id', 'grain_12345-abcdef');
  });

  module('when component is an element', function () {
    module('when element is a custom element', function () {
      test('should display a "CustomElement" element', async function (assert) {
        // given
        const customElement = {
          type: 'custom',
          tagName: 'qcu-image',
          props: {
            name: "Liste d'applications",
            maxChoicesPerLine: 3,
            imageChoicesSize: 'icon',
            choices: [
              {
                name: 'Google',
                image: {
                  width: 534,
                  height: 544,
                  loading: 'lazy',
                  decoding: 'async',
                  src: 'https://epreuves.pix.fr/_astro/Google.B1bcY5Go_1BynY8.svg',
                },
              },
              {
                name: 'LibreOffice Writer',
                image: {
                  width: 205,
                  height: 246,
                  loading: 'lazy',
                  decoding: 'async',
                  src: 'https://epreuves.pix.fr/_astro/writer.3bR8N2DK_Z1iWuJ9.webp',
                },
              },
              {
                name: 'Explorateur',
                image: {
                  width: 128,
                  height: 128,
                  loading: 'lazy',
                  decoding: 'async',
                  src: 'https://epreuves.pix.fr/_astro/windows-file-explorer.CnF8MYwI_23driA.webp',
                },
              },
              {
                name: 'Geogebra',
                image: {
                  width: 640,
                  height: 640,
                  loading: 'lazy',
                  decoding: 'async',
                  src: 'https://epreuves.pix.fr/_astro/geogebra.CZH9VYqc_19v4nj.webp',
                },
              },
            ],
          },
        };
        const grain = {
          components: [{ type: 'element', element: customElement }],
        };

        // when
        await render(<template><ModuleGrain @grain={{grain}} /></template>);

        // then
        assert.strictEqual(findAll('.element-custom').length, 1);
        assert.strictEqual(findAll('qcu-image').length, 1);
      });
    });

    module('when element is a text', function () {
      test('should display text element', async function (assert) {
        // given
        const textElement = {
          content: 'element content',
          type: 'text',
          isAnswerable: false,
          tag: ' ',
        };
        const grain = {
          components: [{ type: 'element', element: textElement }],
        };

        // when
        const screen = await render(<template><ModuleGrain @grain={{grain}} /></template>);

        // then
        assert.ok(screen.getByText('element content'));
      });
    });

    module('when element is a qcu', function () {
      test('should display qcu element', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qcuElement = {
          instruction: 'instruction',
          proposals: ['radio1', 'radio2'],
          type: 'qcu',
          isAnswerable: true,
        };
        const grain = {
          components: [{ type: 'element', element: qcuElement }],
        };
        const passage = store.createRecord('passage');

        // when
        const screen = await render(<template><ModuleGrain @grain={{grain}} @passage={{passage}} /></template>);

        // then
        assert.strictEqual(screen.getAllByRole('radio').length, qcuElement.proposals.length);
      });
    });

    module('when element is a qcu-declarative', function () {
      test('should display qcu-declarative element', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qcuDeclarativeElement = {
          instruction: 'instruction',
          proposals: ['prop1', 'prop2'],
          type: 'qcu-declarative',
          isAnswerable: true,
        };
        const grain = {
          components: [{ type: 'element', element: qcuDeclarativeElement }],
        };
        const passage = store.createRecord('passage');

        // when
        const screen = await render(<template><ModuleGrain @grain={{grain}} @passage={{passage}} /></template>);

        // then
        assert.ok(screen.getByText('Il n’y a pas de bonne ou de mauvaise réponse.'));
      });
    });

    module('when element is a qab', function () {
      test('should display qab element', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qabElement = {
          id: 'ed795d29-5f04-499c-a9c8-4019125c5cb1',
          type: 'qab',
          instruction: '<p><strong>Maintenant, entraînez-vous sur des exemples concrets !</strong></p>',
          isAnswerable: true,
          cards: [
            {
              id: 'e222b060-7c18-4ee2-afe2-2ae27c28946a',
              image: {
                url: 'https://assets.pix.org/modules/bac-a-sable/boules-de-petanque.jpg',
                altText: '',
              },
              text: 'Les boules de pétanques sont creuses.',
              proposalA: 'Vrai',
              proposalB: 'Faux',
              solution: 'A',
            },
          ],
        };
        const grain = {
          components: [{ type: 'element', element: qabElement }],
        };
        const passage = store.createRecord('passage');

        // when
        const screen = await render(<template><ModuleGrain @grain={{grain}} @passage={{passage}} /></template>);

        // then
        assert.ok(screen.getByText('Les boules de pétanques sont creuses.'));
      });
    });

    module('when element is a qrocm', function () {
      test('should display qrocm element', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qrocmElement = {
          instruction: 'Mon instruction',
          proposals: [
            {
              type: 'text',
              content: '<p>Le symbole</>',
            },
            {
              input: 'symbole',
              type: 'input',
              inputType: 'text',
              size: 1,
              display: 'inline',
              placeholder: '',
              ariaLabel: 'Réponse 1',
            },
            {
              input: 'premiere-partie',
              type: 'select',
              display: 'inline',
              placeholder: '',
              ariaLabel: 'Réponse 2',
              options: [
                {
                  id: '1',
                  content: "l'identifiant",
                },
                {
                  id: '2',
                  content: "le fournisseur d'adresse mail",
                },
              ],
            },
          ],
          type: 'qrocm',
          isAnswerable: true,
        };
        const grain = {
          components: [{ type: 'element', element: qrocmElement }],
        };
        const passage = store.createRecord('passage');

        // when
        const screen = await render(<template><ModuleGrain @grain={{grain}} @passage={{passage}} /></template>);

        // then
        assert.ok(screen);
        assert.dom(screen.getByText('Mon instruction')).exists({ count: 1 });
      });
    });

    module('when element is an image', function () {
      test('should display image element', async function (assert) {
        // given
        const url =
          'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg';
        const imageElement = {
          url,
          alt: 'alt text',
          alternativeText: 'alternative instruction',
          type: 'image',
        };
        const grain = {
          components: [{ type: 'element', element: imageElement }],
        };

        // when
        const screen = await render(<template><ModuleGrain @grain={{grain}} /></template>);

        // then
        assert.ok(screen.getByRole('img', { name: 'alt text' }).hasAttribute('src', url));
      });
    });

    module('when element is a short video', function () {
      test('should display a short video element', async function (assert) {
        // given
        const url = 'https://assets.pix.org/modules/placeholder-video.mp4';
        const shortVideoElement = {
          id: 'f6869b46-30b8-4d41-b937-542e405862d1',
          url,
          transcription: 'transcription',
          type: 'short-video',
        };
        const grain = {
          components: [{ type: 'element', element: shortVideoElement }],
        };

        // when
        await render(<template><ModuleGrain @grain={{grain}} /></template>);

        // then
        assert.dom('video').hasAttribute('src', url);
      });
    });

    module('when element is of type flashcards', function () {
      test('should display a flashcards element', async function (assert) {
        // given
        const flashCardsElement = {
          id: '71de6394-ff88-4de3-8834-a40057a50ff4',
          type: 'flashcards',
          title: "Introduction à l'adresse e-mail",
          instruction: '<p>...</p>',
          introImage: { url: 'https://assets.pix.org/modules/placeholder-details.svg' },
          isAnswerable: true,
          cards: [
            {
              id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
              recto: {
                image: {
                  url: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
                },
                text: "A quoi sert l'arobase dans mon adresse email ?",
              },
              verso: {
                image: { url: 'https://assets.pix.org/modules/didacticiel/ordi-spatial.svg' },
                text: "Parce que c'est joli",
              },
            },
          ],
        };
        const grain = {
          components: [{ type: 'element', element: flashCardsElement }],
        };

        // when
        const screen = await render(<template><ModuleGrain @grain={{grain}} /></template>);

        // then
        assert.dom(screen.getByRole('button', { name: 'Commencer' })).exists();
      });
    });

    module('when element is an expand', function () {
      test('should display an "Expand" element', async function (assert) {
        // given
        const title = 'An Expand title';
        const expandElement = {
          title,
          content: '<p>My Content</p>',
          type: 'expand',
        };
        const grain = {
          components: [{ type: 'element', element: expandElement }],
        };

        // when
        const screen = await render(<template><ModuleGrain @grain={{grain}} /></template>);

        // then
        const details = screen.getByRole('group');
        assert.dom(details).exists();
      });
    });

    module('when all elements are answered', function () {
      test('should not display skip button', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const element = { id: 'qcu-id', type: 'qcu', isAnswerable: true };
        const grain = {
          components: [{ type: 'element', element }],
        };
        const passage = store.createRecord('passage');

        const correction = store.createRecord('correction-response');
        store.createRecord('element-answer', { elementId: element.id, correction, passage });

        // when
        const screen = await render(
          <template><ModuleGrain @grain={{grain}} @canMoveToNextGrain={{true}} @passage={{passage}} /></template>,
        );

        // then
        assert
          .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.grain.skipActivity') }))
          .doesNotExist();
      });

      module('when canMoveToNextGrain is true', function () {
        test('should display continue button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const passageEventService = this.owner.lookup('service:passage-events');
          sinon.stub(passageEventService, 'record');
          const element = { id: 'qcu-id', type: 'qcu', isAnswerable: true };
          const qcuDeclarativeElement = {
            id: '6a6944be-a8a3-4138-b5dc-af664cf40b07',
            isAnswerable: true,
            type: 'qcu-declarative',
            instruction: '<p>Quand faut-il mouiller sa brosse à dents&nbsp;?</p>',
            proposals: [
              {
                id: '1',
                content: 'Avant de mettre le dentifrice',
                feedback: {
                  diagnosis: "<p>C'est l'approche de la plupart des gens.</p>",
                },
              },
              {
                id: '2',
                content: 'Après avoir mis le dentifrice',
                feedback: {
                  diagnosis: '<p>Possible, mais attention à ne pas faire tomber le dentifrice !</p>',
                },
              },
              {
                id: '3',
                content: 'Pendant que le dentifrice est mis',
                feedback: {
                  diagnosis: '<p>Digne des plus grands acrobates !</p>',
                },
              },
            ],
          };

          const grain = {
            components: [
              { type: 'element', element },
              { type: 'element', element: qcuDeclarativeElement },
            ],
          };
          store.createRecord('module', { grains: [grain] });
          const passage = store.createRecord('passage');

          const correction = store.createRecord('correction-response');
          store.createRecord('element-answer', { elementId: element.id, correction, passage });

          // when
          const screen = await render(
            <template><ModuleGrain @grain={{grain}} @canMoveToNextGrain={{true}} @passage={{passage}} /></template>,
          );
          await click(screen.getByRole('button', { name: qcuDeclarativeElement.proposals[0].content }));

          // then
          assert.dom(screen.queryByRole('button', { name: 'Continuer' })).exists();
        });
      });
      module('when canMoveToNextGrain is false', function () {
        test('should not display continue button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const element = { type: 'qcu', isAnswerable: true };
          const grain = {
            components: [{ type: 'element', element }],
          };
          store.createRecord('module', { grains: [grain] });
          const passage = store.createRecord('passage');

          // when
          const screen = await render(
            <template><ModuleGrain @grain={{grain}} @canMoveToNextGrain={{false}} @passage={{passage}} /></template>,
          );

          // then
          assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
        });
      });
    });

    module('when at least one element has not been answered', function () {
      module('when this element is a locally answerable element', function () {
        test('should not display continue button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const element = { type: 'qcu-declarative', isAnswerable: true };
          const grain = {
            title: 'Grain title',
            components: [{ type: 'element', element }],
          };
          const passage = store.createRecord('passage');

          // when
          const screen = await render(
            <template><ModuleGrain @grain={{grain}} @canMoveToNextGrain={{true}} @passage={{passage}} /></template>,
          );

          // then
          assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
        });
      });

      module('when canMoveToNextGrain is true', function () {
        test('should not display continue button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const element = { type: 'qcu', isAnswerable: true };
          const grain = {
            components: [{ type: 'element', element }],
          };
          const passage = store.createRecord('passage');

          // when
          const screen = await render(
            <template><ModuleGrain @grain={{grain}} @canMoveToNextGrain={{true}} @passage={{passage}} /></template>,
          );

          // then
          assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
        });

        test('should display skip button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const element = { type: 'qcu', isAnswerable: true };
          const grain = {
            components: [{ type: 'element', element }],
          };
          store.createRecord('module', { grains: [grain] });
          const passage = store.createRecord('passage');

          // when
          const screen = await render(
            <template><ModuleGrain @grain={{grain}} @canMoveToNextGrain={{true}} @passage={{passage}} /></template>,
          );

          // then
          assert.dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.grain.skipActivity') })).exists();
        });
      });

      module('when canMoveToNextGrain is false', function () {
        test('should not display continue button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const element = { type: 'qcu', isAnswerable: true };
          const grain = {
            components: [{ type: 'element', element }],
          };
          const passage = store.createRecord('passage');

          // when
          const screen = await render(
            <template><ModuleGrain @grain={{grain}} @canMoveToNextGrain={{false}} @passage={{passage}} /></template>,
          );

          // then
          assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
        });

        test('should not display skip button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const element = { type: 'qcu', isAnswerable: true };
          const grain = {
            components: [{ type: 'element', element }],
          };
          store.createRecord('module', { grains: [grain] });
          const passage = store.createRecord('passage');

          // when
          const screen = await render(
            <template><ModuleGrain @grain={{grain}} @canMoveToNextGrain={{false}} @passage={{passage}} /></template>,
          );

          // then
          assert
            .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.grain.skipActivity') }))
            .doesNotExist();
        });
      });
    });

    module('when element is a qcm', function (hooks) {
      let clock;

      hooks.beforeEach(function () {
        clock = sinon.useFakeTimers();
      });
      hooks.afterEach(function () {
        clock.restore();
      });
      module('when verify button is clicked with answers', function () {
        test('should disable skip activity button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const element = {
            type: 'qcm',
            proposals: [
              { id: '1', content: 'checkbox1' },
              { id: '2', content: 'checkbox2' },
              { id: '3', content: 'checkbox3' },
            ],
            feedbacks: {
              valid: {
                state: 'Correct!',
                diagnosis: '<p>Good job!</p>',
              },
              invalid: {
                state: 'Pas Bravo!',
                diagnosis: '<p>Vous nous avez mal cernés</p>',
              },
            },
            solutions: ['1', '2'],
            isAnswerable: true,
          };
          const grain = {
            title: 'Grain title',
            components: [{ type: 'element', element }],
          };
          const passage = store.createRecord('passage');

          const onElementAnswer = sinon.stub();

          // when
          const screen = await render(
            <template>
              <ModuleGrain
                @grain={{grain}}
                @canMoveToNextGrain={{true}}
                @onElementAnswer={{onElementAnswer}}
                @passage={{passage}}
              />
            </template>,
          );
          await click(screen.getByLabelText('checkbox1'));
          await click(screen.getByLabelText('checkbox2'));
          const verifyButton = screen.getByRole('button', { name: 'Vérifier ma réponse' });
          await click(verifyButton);

          // then
          assert.dom(screen.getByRole('button', { name: 'Passer l’activité' })).hasAttribute('aria-disabled', 'true');
        });
      });

      module('when verify button is clicked with no selected answers', function () {
        test('should disable skip activity button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const element = { type: 'qcm', isAnswerable: true };
          const grain = {
            title: 'Grain title',
            components: [{ type: 'element', element }],
          };
          const passage = store.createRecord('passage');

          // when
          const screen = await render(
            <template><ModuleGrain @grain={{grain}} @canMoveToNextGrain={{true}} @passage={{passage}} /></template>,
          );
          const verifyButton = screen.getByRole('button', { name: 'Vérifier ma réponse' });
          await click(verifyButton);

          // then
          assert.dom(screen.getByRole('button', { name: 'Passer l’activité' })).hasAttribute('aria-disabled', 'true');
        });
      });
    });

    module('when type of element is not supported', function () {
      test('it should not display this element', async function (assert) {
        // given
        const title = 'An Expand title';
        const expandElement = {
          title,
          content: '<p>My Content</p>',
          type: 'not-supported-element-type',
        };
        const grain = {
          components: [{ type: 'element', element: expandElement }],
        };

        // when
        await render(<template><ModuleGrain @grain={{grain}} /></template>);

        // then
        assert.dom(find('.grain-card-content__element')).doesNotExist();
      });
    });
  });

  module('when onGrainContinue is called', function () {
    test('should call onGrainContinue pass in argument', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const element = { type: 'text', isAnswerable: false, tag: ' ' };
      const grain = {
        components: [{ type: 'element', element }],
      };
      store.createRecord('module', { id: 'module-id', grains: [grain] });

      const stubonGrainContinue = sinon.stub();

      // when
      await render(
        <template>
          <ModuleGrain @grain={{grain}} @canMoveToNextGrain={{true}} @onGrainContinue={{stubonGrainContinue}} />
        </template>,
      );
      await clickByName('Continuer');

      // then
      sinon.assert.calledOnce(stubonGrainContinue);
      assert.ok(true);
    });
  });

  module('when onGrainSkip is called', function () {
    test('should call onGrainSkip pass in argument', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const element = { type: 'qcu', isAnswerable: true };
      const grain = { components: [{ type: 'element', element }] };
      store.createRecord('module', { id: 'module-id', grains: [grain] });
      const passage = store.createRecord('passage');

      const onGrainSkipStub = sinon.stub();

      const onGrainContinue = () => {};

      // when
      await render(
        <template>
          <ModuleGrain
            @grain={{grain}}
            @canMoveToNextGrain={{true}}
            @onGrainContinue={{onGrainContinue}}
            @onGrainSkip={{onGrainSkipStub}}
            @passage={{passage}}
          />
        </template>,
      );
      await clickByName(t('pages.modulix.buttons.grain.skipActivity'));

      // then
      sinon.assert.calledOnce(onGrainSkipStub);
      assert.ok(true);
    });
  });

  module('when onElementRetry is called', function (hooks) {
    let clock;

    hooks.beforeEach(function () {
      clock = sinon.useFakeTimers();
    });

    hooks.afterEach(function () {
      clock.restore();
    });
    test('should call onElementRetry pass in argument', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const passageEvents = this.owner.lookup('service:passage-events');
      const element = {
        id: 'qcu-id',
        type: 'qcu',
        isAnswerable: true,
        proposals: [
          { id: 'qcu-1-proposal-1', content: 'I am the wrong answer!', feedback: { state: 'ko' } },
          {
            id: 'qcu-1-proposal-2',
            content: 'I am the right answer!',
            feedback: { state: "Bravo ! C'est la bonne réponse." },
          },
        ],
        solution: 'qcu-1-proposal-2',
      };
      const grain = { components: [{ type: 'element', element }] };
      const passage = store.createRecord('passage');

      const onElementRetryStub = sinon.stub().withArgs({ element });

      const onElementAnswerStub = sinon.stub().withArgs({ element });

      passageEvents.record = sinon.stub();
      store.createRecord = sinon.stub().returns({
        save: sinon.stub(),
      });

      // when
      const screen = await render(
        <template>
          <ModuleGrain
            @grain={{grain}}
            @onElementAnswer={{onElementAnswerStub}}
            @onElementRetry={{onElementRetryStub}}
            @canMoveToNextGrain={{true}}
            @passage={{passage}}
          />
        </template>,
      );
      await click(screen.getByLabelText('I am the wrong answer!'));
      const verifyButton = screen.getByRole('button', { name: 'Vérifier ma réponse' });
      await click(verifyButton);
      await clock.tickAsync(VERIFY_RESPONSE_DELAY);
      const retryButton = screen.getByRole('button', { name: t('pages.modulix.buttons.activity.retry') });
      await click(retryButton);

      // then
      sinon.assert.calledOnce(onElementRetryStub);
      assert.ok(true);
    });
  });

  module('when grain contains a stepper', function () {
    module('when grain is type activity', function () {
      test('it should set direction param to horizontal', async function (assert) {
        // given
        const textElement = {
          content: 'element content',
          type: 'text',
          isAnswerable: false,
          tag: ' ',
        };
        const grain = {
          type: 'activity',
          components: [{ type: 'stepper', steps: [{ elements: [textElement] }] }],
        };

        // when
        await render(<template><ModuleGrain @grain={{grain}} /></template>);

        // then
        assert.dom(find('.stepper--horizontal')).exists();
      });
    });

    module('when grain is type discovery', function () {
      test('it should set direction param to horizontal', async function (assert) {
        // given
        const textElement = {
          content: 'element content',
          type: 'text',
          isAnswerable: false,
          tag: ' ',
        };
        const grain = {
          type: 'discovery',
          components: [{ type: 'stepper', steps: [{ elements: [textElement] }] }],
        };

        // when
        await render(<template><ModuleGrain @grain={{grain}} /></template>);

        // then
        assert.dom(find('.stepper--horizontal')).exists();
      });
    });

    module('when grain is type challenge', function () {
      test('it should set direction param to horizontal', async function (assert) {
        // given
        const textElement = {
          content: 'element content',
          type: 'text',
          isAnswerable: false,
          tag: ' ',
        };
        const grain = {
          type: 'challenge',
          components: [{ type: 'stepper', steps: [{ elements: [textElement] }] }],
        };

        // when
        await render(<template><ModuleGrain @grain={{grain}} /></template>);

        // then
        assert.dom(find('.stepper--horizontal')).exists();
      });
    });

    module('when grain is type lesson', function () {
      test('it should set direction param to vertical', async function (assert) {
        // given
        const textElement = {
          content: 'element content',
          type: 'text',
          isAnswerable: false,
          tag: ' ',
        };
        const grain = {
          type: 'lesson',
          components: [{ type: 'stepper', steps: [{ elements: [textElement] }] }],
        };

        // when
        await render(<template><ModuleGrain @grain={{grain}} /></template>);

        // then
        assert.dom(find('.stepper--vertical')).exists();
      });
    });

    module('when grain is type summary', function () {
      test('it should set direction param to vertical', async function (assert) {
        // given
        const textElement = {
          content: 'element content',
          type: 'text',
          isAnswerable: false,
          tag: ' ',
        };
        const grain = {
          type: 'summary',
          components: [{ type: 'stepper', steps: [{ elements: [textElement] }] }],
        };

        // when
        await render(<template><ModuleGrain @grain={{grain}} /></template>);

        // then
        assert.dom(find('.stepper--vertical')).exists();
      });
    });

    module('when grain is type transition', function () {
      test('it should set direction param to vertical', async function (assert) {
        // given
        const textElement = {
          content: 'element content',
          type: 'text',
          isAnswerable: false,
          tag: ' ',
        };
        const grain = {
          type: 'transition',
          components: [{ type: 'stepper', steps: [{ elements: [textElement] }] }],
        };

        // when
        await render(<template><ModuleGrain @grain={{grain}} /></template>);

        // then
        assert.dom(find('.stepper--vertical')).exists();
      });
    });

    test('should display the stepper', async function (assert) {
      // given
      const textElement = {
        content: 'element content',
        type: 'text',
        isAnswerable: false,
        tag: ' ',
      };
      const grain = {
        components: [{ type: 'stepper', steps: [{ elements: [textElement] }] }],
      };

      // when
      const screen = await render(<template><ModuleGrain @grain={{grain}} /></template>);

      // then
      assert.ok(screen.getByText('element content'));
    });

    module('When we verify an answerable element', function (hooks) {
      let clock;

      hooks.beforeEach(function () {
        clock = sinon.useFakeTimers();
      });

      hooks.afterEach(function () {
        clock.restore();
      });

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
                tag: ' ',
              },
            ],
          },
        ];

        function getLastCorrectionForElementStub() {}

        const onElementAnswerStub = sinon.stub();
        const passageEventService = this.owner.lookup('service:passage-events');
        sinon.stub(passageEventService, 'record');
        const store = this.owner.lookup('service:store');
        const grain = {
          components: [
            {
              type: 'stepper',
              steps,
            },
          ],
        };
        const passage = store.createRecord('passage');
        passage.getLastCorrectionForElement = getLastCorrectionForElementStub;

        // when
        await render(
          <template>
            <ModuleGrain @grain={{grain}} @passage={{passage}} @onElementAnswer={{onElementAnswerStub}} />
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

    module('When we retry an answerable element', function (hooks) {
      let clock;

      hooks.beforeEach(function () {
        clock = sinon.useFakeTimers();
      });

      hooks.afterEach(function () {
        clock.restore();
      });

      test('should call the onElementRetry action', async function (assert) {
        // given
        const passageEvents = this.owner.lookup('service:passage-events');
        const steps = [
          {
            elements: [
              {
                id: 'd0690f26-978c-41c3-9a21-da931857739c',
                instruction: 'Instruction',
                proposals: [
                  { id: '1', content: 'radio1', feedback: { state: 'wrong answer' } },
                  { id: '2', content: 'radio2', feedback: { state: 'right answer' } },
                ],
                isAnswerable: true,
                type: 'qcu',
                solution: '2',
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
                tag: ' ',
              },
            ],
          },
        ];
        const onElementAnswerStub = sinon.stub();

        const onElementRetryStub = sinon.stub();
        const store = this.owner.lookup('service:store');
        const grain = {
          components: [
            {
              type: 'stepper',
              steps,
            },
          ],
        };
        const passage = store.createRecord('passage');
        passageEvents.record = sinon.stub();

        // when
        const screen = await render(
          <template>
            <ModuleGrain
              @grain={{grain}}
              @passage={{passage}}
              @onElementAnswer={{onElementAnswerStub}}
              @onElementRetry={{onElementRetryStub}}
            />
          </template>,
        );

        // then
        await clickByName('radio1');
        const verifyButton = screen.getByRole('button', { name: 'Vérifier ma réponse' });
        await click(verifyButton);
        await clock.tickAsync(VERIFY_RESPONSE_DELAY);

        await click(screen.getByRole('button', { name: t('pages.modulix.buttons.activity.retry') }));
        sinon.assert.calledOnce(onElementRetryStub);
        assert.ok(true);
      });
    });

    module('when there are only unanswerable elements in stepper', function () {
      module('when there are still steps to display', function () {
        test('should display skip button', async function (assert) {
          // given
          const steps = [
            {
              elements: [
                {
                  id: 'd0690f26-978c-41c3-9a21-da931857739c',
                  type: 'text',
                  content: '<p>Text 1</p>',
                  isAnswerable: false,
                  tag: ' ',
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
                  tag: ' ',
                },
              ],
            },
          ];

          const store = this.owner.lookup('service:store');
          const grain = {
            components: [
              {
                type: 'stepper',
                steps,
              },
            ],
          };

          const passage = store.createRecord('passage');
          const onElementRetryStub = sinon.stub();

          // when
          const screen = await render(
            <template>
              <ModuleGrain
                @grain={{grain}}
                @passage={{passage}}
                @canMoveToNextGrain={{true}}
                @onElementRetry={{onElementRetryStub}}
              />
            </template>,
          );

          // then
          assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.grain.skip') })).exists();
        });
        test('should not display continue button', async function (assert) {
          // given
          const steps = [
            {
              elements: [
                {
                  id: 'd0690f26-978c-41c3-9a21-da931857739c',
                  type: 'text',
                  content: '<p>Text 1</p>',
                  isAnswerable: false,
                  tag: ' ',
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
                  tag: ' ',
                },
              ],
            },
          ];

          const store = this.owner.lookup('service:store');
          const grain = {
            components: [
              {
                type: 'stepper',
                steps,
              },
            ],
          };

          const passage = store.createRecord('passage');
          const onElementRetryStub = sinon.stub();

          // when
          const screen = await render(
            <template>
              <ModuleGrain
                @grain={{grain}}
                @passage={{passage}}
                @canMoveToNextGrain={{true}}
                @onElementRetry={{onElementRetryStub}}
              />
            </template>,
          );

          // then
          assert.dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.grain.continue') })).doesNotExist();
        });
      });

      module('when there is no more steps to display', function (hooks) {
        const state = {};
        let store;

        hooks.beforeEach(function () {
          store = this.owner.lookup('service:store');
          state.passage = store.createRecord('passage');
          state.onElementRetryStub = sinon.stub();
          state.onStepperNextStepStub = sinon.stub();
        });

        test('should display continue button', async function (assert) {
          // given
          const steps = [
            {
              elements: [
                {
                  id: 'd0690f26-978c-41c3-9a21-da931857739c',
                  type: 'text',
                  content: '<p>Text 1</p>',
                  isAnswerable: false,
                  tag: ' ',
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
                  tag: ' ',
                },
              ],
            },
          ];

          const grain = {
            components: [
              {
                type: 'stepper',
                steps,
              },
            ],
          };

          // when
          const screen = await render(
            <template>
              <ModuleGrain
                @grain={{grain}}
                @passage={{state.passage}}
                @canMoveToNextGrain={{true}}
                @onElementRetry={{state.onElementRetryStub}}
                @onStepperNextStep={{state.onStepperNextStepStub}}
              />
            </template>,
          );
          await clickByName(t('pages.modulix.buttons.stepper.next.ariaLabel'));

          // then
          assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.grain.continue') })).exists();
        });

        test('should not display skip button', async function (assert) {
          // given
          const steps = [
            {
              elements: [
                {
                  id: 'd0690f26-978c-41c3-9a21-da931857739c',
                  type: 'text',
                  content: '<p>Text 1</p>',
                  isAnswerable: false,
                  tag: ' ',
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
                  tag: ' ',
                },
              ],
            },
          ];

          const grain = {
            components: [
              {
                type: 'stepper',
                steps,
              },
            ],
          };

          // when
          const screen = await render(
            <template>
              <ModuleGrain
                @grain={{grain}}
                @passage={{state.passage}}
                @canMoveToNextGrain={{true}}
                @onElementRetry={{state.onElementRetryStub}}
                @onStepperNextStep={{state.onStepperNextStepStub}}
              />
            </template>,
          );
          await clickByName(t('pages.modulix.buttons.stepper.next.ariaLabel'));

          // then
          assert
            .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.grain.skipActivity') }))
            .doesNotExist();
        });
      });
    });

    module('when there are answerable elements in stepper', function () {
      module('when user response is not verified', function (hooks) {
        const state = {};
        let store;

        hooks.beforeEach(function () {
          store = this.owner.lookup('service:store');
          state.passage = store.createRecord('passage');
          state.onElementRetryStub = sinon.stub();
          state.onStepperNextStepStub = sinon.stub();
        });

        module('when there are still steps to display', function () {
          test('should display skip button', async function (assert) {
            // given
            const steps = [
              {
                elements: [
                  {
                    id: 'd0690f26-978c-41c3-9a21-da931857739c',
                    instruction: 'instruction',
                    proposals: ['radio1', 'radio2'],
                    type: 'qcu',
                    isAnswerable: true,
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
                    tag: ' ',
                  },
                ],
              },
            ];

            const grain = {
              components: [
                {
                  type: 'stepper',
                  steps,
                },
              ],
            };

            // when
            const screen = await render(
              <template>
                <ModuleGrain
                  @grain={{grain}}
                  @passage={{state.passage}}
                  @canMoveToNextGrain={{true}}
                  @onElementRetry={{state.onElementRetryStub}}
                  @onStepperNextStep={{state.onStepperNextStepStub}}
                />
              </template>,
            );

            // then
            assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.grain.skipActivity') })).exists();
          });

          test('should not display continue button', async function (assert) {
            // given
            const steps = [
              {
                elements: [
                  {
                    id: 'd0690f26-978c-41c3-9a21-da931857739c',
                    instruction: 'instruction',
                    proposals: ['radio1', 'radio2'],
                    type: 'qcu',
                    isAnswerable: true,
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
                    tag: ' ',
                  },
                ],
              },
            ];

            const grain = {
              components: [
                {
                  type: 'stepper',
                  steps,
                },
              ],
            };

            // when
            const screen = await render(
              <template>
                <ModuleGrain
                  @grain={{grain}}
                  @passage={{state.passage}}
                  @canMoveToNextGrain={{true}}
                  @onElementRetry={{state.onElementRetryStub}}
                  @onStepperNextStep={{state.onStepperNextStepStub}}
                />
              </template>,
            );

            // then
            assert
              .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.grain.continue') }))
              .doesNotExist();
          });
        });

        module('when there is no more steps to display', function () {
          module('when the last step contains an answerable element', function () {
            test('should display skip button', async function (assert) {
              // given
              const steps = [
                {
                  elements: [
                    {
                      id: '768441a5-a7d6-4987-ada9-7253adafd842',
                      type: 'text',
                      content: '<p>Text 2</p>',
                      isAnswerable: false,
                      tag: ' ',
                    },
                  ],
                },
                {
                  elements: [
                    {
                      id: 'd0690f26-978c-41c3-9a21-da931857739c',
                      instruction: 'instruction',
                      proposals: ['radio1', 'radio2'],
                      type: 'qcu',
                      isAnswerable: true,
                    },
                  ],
                },
              ];

              const grain = {
                components: [
                  {
                    type: 'stepper',
                    steps,
                  },
                ],
              };

              // when
              const screen = await render(
                <template>
                  <ModuleGrain
                    @grain={{grain}}
                    @passage={{state.passage}}
                    @canMoveToNextGrain={{true}}
                    @onElementRetry={{state.onElementRetryStub}}
                    @onStepperNextStep={{state.onStepperNextStepStub}}
                  />
                </template>,
              );
              await clickByName(t('pages.modulix.buttons.stepper.next.ariaLabel'));

              // then
              assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.grain.skipActivity') })).exists();
            });

            test('should not display continue button', async function (assert) {
              // given
              const steps = [
                {
                  elements: [
                    {
                      id: '768441a5-a7d6-4987-ada9-7253adafd842',
                      type: 'text',
                      content: '<p>Text 2</p>',
                      isAnswerable: false,
                      tag: ' ',
                    },
                  ],
                },
                {
                  elements: [
                    {
                      id: 'd0690f26-978c-41c3-9a21-da931857739c',
                      instruction: 'instruction',
                      proposals: ['radio1', 'radio2'],
                      type: 'qcu',
                      isAnswerable: true,
                    },
                  ],
                },
              ];

              const grain = {
                components: [
                  {
                    type: 'stepper',
                    steps,
                  },
                ],
              };

              // when
              const screen = await render(
                <template>
                  <ModuleGrain
                    @grain={{grain}}
                    @passage={{state.passage}}
                    @canMoveToNextGrain={{true}}
                    @onElementRetry={{state.onElementRetryStub}}
                    @onStepperNextStep={{state.onStepperNextStepStub}}
                  />
                </template>,
              );
              await clickByName(t('pages.modulix.buttons.stepper.next.ariaLabel'));

              // then
              assert
                .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.grain.continue') }))
                .doesNotExist();
            });
          });
        });
      });

      module('when user response has been verified', function () {
        module('when there are still steps to display', function () {
          test('should display skip button', async function (assert) {
            // given
            const steps = [
              {
                elements: [
                  {
                    id: 'd0690f26-978c-41c3-9a21-da931857739c',
                    instruction: 'instruction',
                    proposals: [
                      { id: '1', content: 'radio1' },
                      { id: '2', content: 'radio2' },
                    ],
                    type: 'qcu',
                    isAnswerable: true,
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
                    tag: ' ',
                  },
                ],
              },
            ];

            const store = this.owner.lookup('service:store');
            const grain = {
              components: [
                {
                  type: 'stepper',
                  steps,
                },
              ],
            };

            const passage = store.createRecord('passage');
            const correction = store.createRecord('correction-response', {
              status: 'ok',
              feedback: { state: 'super' },
            });
            store.createRecord('element-answer', {
              elementId: 'd0690f26-978c-41c3-9a21-da931857739c',
              correction,
              passage,
            });
            const onElementRetryStub = sinon.stub();

            // when
            const screen = await render(
              <template>
                <ModuleGrain
                  @grain={{grain}}
                  @passage={{passage}}
                  @canMoveToNextGrain={{true}}
                  @onElementRetry={{onElementRetryStub}}
                />
              </template>,
            );

            // then
            assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.grain.skipActivity') })).exists();
          });
          test('should not display continue button', async function (assert) {
            // given
            const steps = [
              {
                elements: [
                  {
                    id: 'd0690f26-978c-41c3-9a21-da931857739c',
                    instruction: 'instruction',
                    proposals: [
                      { id: '1', content: 'radio1' },
                      { id: '2', content: 'radio2' },
                    ],
                    type: 'qcu',
                    isAnswerable: true,
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
                    tag: ' ',
                  },
                ],
              },
            ];

            const store = this.owner.lookup('service:store');
            const grain = {
              components: [
                {
                  type: 'stepper',
                  steps,
                },
              ],
            };

            const passage = store.createRecord('passage');
            const correction = store.createRecord('correction-response', {
              status: 'ok',
              feedback: { state: 'super' },
            });
            store.createRecord('element-answer', {
              elementId: 'd0690f26-978c-41c3-9a21-da931857739c',
              correction,
              passage,
            });
            const onElementRetryStub = sinon.stub();

            // when
            const screen = await render(
              <template>
                <ModuleGrain
                  @grain={{grain}}
                  @passage={{passage}}
                  @canMoveToNextGrain={{true}}
                  @onElementRetry={{onElementRetryStub}}
                />
              </template>,
            );

            // then
            assert
              .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.grain.continue') }))
              .doesNotExist();
          });
        });

        module('when there is no more steps to display', function (hooks) {
          const state = {};
          let store;

          hooks.beforeEach(function () {
            store = this.owner.lookup('service:store');
            state.passage = store.createRecord('passage');
            state.onElementRetryStub = sinon.stub();
            state.onStepperNextStepStub = sinon.stub();
          });
          module('when the last step contains an answerable element', function () {
            test('should not display skip button', async function (assert) {
              // given
              const steps = [
                {
                  elements: [
                    {
                      id: '768441a5-a7d6-4987-ada9-7253adafd842',
                      type: 'text',
                      content: '<p>Text 2</p>',
                      isAnswerable: false,
                      tag: ' ',
                    },
                  ],
                },
                {
                  elements: [
                    {
                      id: 'd0690f26-978c-41c3-9a21-da931857739c',
                      instruction: 'instruction',
                      proposals: [
                        { id: '1', content: 'radio1' },
                        { id: '2', content: 'radio2' },
                      ],
                      type: 'qcu',
                      isAnswerable: true,
                    },
                  ],
                },
              ];

              const store = this.owner.lookup('service:store');
              const grain = {
                components: [
                  {
                    type: 'stepper',
                    steps,
                  },
                ],
              };

              const correction = store.createRecord('correction-response', {
                status: 'ok',
                feedback: { state: 'super' },
              });
              store.createRecord('element-answer', {
                elementId: 'd0690f26-978c-41c3-9a21-da931857739c',
                correction,
                passage: state.passage,
              });

              // when
              const screen = await render(
                <template>
                  <ModuleGrain
                    @grain={{grain}}
                    @passage={{state.passage}}
                    @canMoveToNextGrain={{true}}
                    @onElementRetry={{state.onElementRetryStub}}
                    @onStepperNextStep={{state.onStepperNextStepStub}}
                  />
                </template>,
              );

              await clickByName(t('pages.modulix.buttons.stepper.next.ariaLabel'));

              // then
              assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.grain.continue') })).exists();
            });

            test('should display continue button', async function (assert) {
              // given
              const steps = [
                {
                  elements: [
                    {
                      id: '768441a5-a7d6-4987-ada9-7253adafd842',
                      type: 'text',
                      content: '<p>Text 2</p>',
                      isAnswerable: false,
                      tag: ' ',
                    },
                  ],
                },
                {
                  elements: [
                    {
                      id: 'd0690f26-978c-41c3-9a21-da931857739c',
                      instruction: 'instruction',
                      proposals: [
                        { id: '1', content: 'radio1' },
                        { id: '2', content: 'radio2' },
                      ],
                      type: 'qcu',
                      isAnswerable: true,
                    },
                  ],
                },
              ];

              const store = this.owner.lookup('service:store');
              const grain = {
                components: [
                  {
                    type: 'stepper',
                    steps,
                  },
                ],
              };

              const correction = store.createRecord('correction-response', {
                status: 'ok',
                feedback: { state: 'super' },
              });
              store.createRecord('element-answer', {
                elementId: 'd0690f26-978c-41c3-9a21-da931857739c',
                correction,
                passage: state.passage,
              });
              const onElementRetryStub = sinon.stub();

              // when
              const screen = await render(
                <template>
                  <ModuleGrain
                    @grain={{grain}}
                    @passage={{state.passage}}
                    @canMoveToNextGrain={{true}}
                    @onElementRetry={{onElementRetryStub}}
                    @onStepperNextStep={{state.onStepperNextStepStub}}
                  />
                </template>,
              );

              await clickByName(t('pages.modulix.buttons.stepper.next.ariaLabel'));

              // then
              assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.grain.continue') })).exists();
            });
          });
        });
      });
    });

    module('when there are locally answerable elements in stepper', function () {
      module('when elements have not been answered', function () {
        test('should not display continue button', async function (assert) {
          const store = this.owner.lookup('service:store');
          const passage = store.createRecord('passage');
          const onElementRetryStub = sinon.stub();
          const onStepperNextStepStub = sinon.stub();

          const qabElement = {
            id: 'ed795d29-5f04-499c-a9c8-4019125c5cb1',
            type: 'qab',
            instruction:
              '<p><strong>Maintenant, entraînez-vous sur des exemples concrets !</strong> </p> <p> Pour chaque exemple, choisissez si l’affirmation est <strong>vraie</strong> ou <strong>fausse</strong>.</p>',
            isAnswerable: true,
            cards: [
              {
                id: 'e222b060-7c18-4ee2-afe2-2ae27c28946a',
                image: {
                  url: 'https://assets.pix.org/modules/bac-a-sable/boules-de-petanque.jpg',
                  altText: '',
                },
                text: 'Les boules de pétanques sont creuses.',
                proposalA: 'Vrai',
                proposalB: 'Faux',
                solution: 'A',
              },
              {
                id: '57056894-8e1b-4da9-96b6-0bd4187412b8',
                text: 'Les chiens ne transpirent pas.',
                proposalA: 'Vrai',
                proposalB: 'Faux',
                solution: 'B',
              },
            ],
          };

          const steps = [
            {
              elements: [qabElement],
            },
            {
              elements: [
                {
                  id: '768441a5-a7d6-4987-ada9-7253adafd842',
                  type: 'text',
                  content: '<p>Text 2</p>',
                  isAnswerable: false,
                  tag: ' ',
                },
              ],
            },
          ];

          const grain = {
            title: 'Grain title',
            components: [
              {
                type: 'stepper',
                steps,
              },
            ],
          };

          // when
          const screen = await render(
            <template>
              <ModuleGrain
                @grain={{grain}}
                @passage={{passage}}
                @canMoveToNextGrain={{true}}
                @onElementRetry={{onElementRetryStub}}
                @onStepperNextStep={{onStepperNextStepStub}}
              />
            </template>,
          );

          // then
          assert.dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.grain.continue') })).doesNotExist();
        });
      });
    });
  });

  module('when grain has type ‘Activity‘', function () {
    test('should display the corresponding tag', async function (assert) {
      // given
      const textElement = {
        content: 'element content',
        type: 'text',
        isAnswerable: false,
        tag: ' ',
      };
      const grain = {
        id: '12345-abcdef',
        type: 'activity',
        components: [{ type: 'element', element: textElement }],
      };

      // when
      const screen = await render(<template><ModuleGrain @grain={{grain}} /></template>);

      // then
      assert.dom(screen.getByText('Activité')).exists();
    });
  });

  module('when grain has type ‘lesson‘', function () {
    test('should display a title', async function (assert) {
      // given
      const textElement = {
        content: 'element content',
        type: 'text',
        isAnswerable: false,
        tag: ' ',
      };
      const grain = {
        id: '12345-abcdef',
        type: 'lesson',
        components: [{ type: 'element', element: textElement }],
      };

      // when
      const screen = await render(<template><ModuleGrain @grain={{grain}} /></template>);

      // then
      assert.dom(screen.getByText('Leçon')).exists();
    });
  });

  module('when grain has type ‘short-lesson‘', function () {
    test('should not display a title with value "Leçon"', async function (assert) {
      // given
      const contentText = 'element content';
      const textElement = {
        content: contentText,
        type: 'text',
        isAnswerable: false,
        tag: ' ',
      };
      const grain = {
        id: '12345-abcdef',
        type: 'short-lesson',
        components: [{ type: 'element', element: textElement }],
      };

      // when
      const screen = await render(<template><ModuleGrain @grain={{grain}} /></template>);

      // then
      assert.dom(screen.queryByText('Leçon')).doesNotExist();
      assert.dom(screen.getByText(contentText)).exists();
    });
  });

  module('when grain has type ‘Summary‘', function () {
    test('should display a title', async function (assert) {
      // given
      const textElement = {
        content: 'element content',
        type: 'text',
        isAnswerable: false,
        tag: ' ',
      };
      const grain = {
        id: '12345-abcdef',
        type: 'summary',
        components: [{ type: 'element', element: textElement }],
      };

      // when
      const screen = await render(<template><ModuleGrain @grain={{grain}} /></template>);

      // then
      assert.dom(screen.getByText('Récapitulatif')).exists();
    });
  });
});
