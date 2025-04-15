import { clickByName, render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import ModuleGrain from 'mon-pix/components/module/grain/grain';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Grain', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display given grain', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const grain = store.createRecord('grain', { id: '12345-abcdef', title: 'Grain title' });
    this.set('grain', grain);

    // when
    const screen = await render(hbs`
      <Module::Grain::Grain @grain={{this.grain}} />`);

    // then
    assert.ok(screen.getByRole('heading', { name: grain.title, level: 2 }));
    assert.dom('.grain').hasAttribute('id', 'grain_12345-abcdef');
  });

  module('when grain has an empty title', function () {
    test('should not display heading', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const grain = store.createRecord('grain', { id: '12345-abcdef', title: '' });
      this.set('grain', grain);

      // when
      const screen = await render(hbs`
      <Module::Grain::Grain @grain={{this.grain}} />`);

      // then
      assert.deepEqual(screen.queryByRole('heading', { name: grain.title, level: 2 }), null);
      assert.dom('.grain').hasAttribute('id', 'grain_12345-abcdef');
    });
  });

  module('when grain has transition', function () {
    test('should display transition', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const grain = store.createRecord('grain', { title: 'Grain title' });
      const transition = { content: 'transition text' };
      this.set('grain', grain);
      this.set('transition', transition);

      // when
      const screen = await render(hbs`
        <Module::Grain::Grain @grain={{this.grain}} @transition={{this.transition}} />`);

      // then
      assert.ok(screen.getByText('transition text'));
    });
  });

  module('when grain has no transition', function () {
    test('should not create header', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const grain = store.createRecord('grain', { title: 'Grain title' });
      this.set('grain', grain);

      // when
      await render(hbs`
        <Module::Grain::Grain @grain={{this.grain}} />`);

      // then
      assert.dom('.grain__header').doesNotExist();
    });
  });

  module('type', function () {
    test('should have the "activity" color and tag if grain is of type activity', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const grain = store.createRecord('grain', { type: 'activity', title: 'Grain title' });
      this.set('grain', grain);

      // when
      const screen = await render(hbs`
        <Module::Grain::Grain @grain={{this.grain}} />`);

      // then
      assert.dom(find('.grain-card--activity')).exists();
      assert.dom(screen.getByText('Activité')).exists();
    });

    test('should have the "lesson" color and tag if grain is of type lesson', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const grain = store.createRecord('grain', { type: 'lesson', title: 'Grain title' });
      this.set('grain', grain);

      // when
      const screen = await render(hbs`
        <Module::Grain::Grain @grain={{this.grain}} />`);

      // then
      assert.dom(find('.grain-card--lesson')).exists();
      assert.dom(screen.getByText('Leçon')).exists();
    });

    test('should have the "lesson" color and tag if grain is of undefined type', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const grain = store.createRecord('grain', { title: 'Grain title' });
      this.set('grain', grain);

      // when
      const screen = await render(hbs`
        <Module::Grain::Grain @grain={{this.grain}} />`);

      // then
      assert.dom(find('.grain-card--lesson')).exists();
      assert.dom(screen.getByText('Leçon')).exists();
    });

    test('should have the "lesson" color and tag if grain is of unknown type', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const grain = store.createRecord('grain', { type: 'yolo', title: 'Grain title' });
      this.set('grain', grain);

      // when
      const screen = await render(hbs`
        <Module::Grain::Grain @grain={{this.grain}} />`);

      // then
      assert.dom(find('.grain-card--lesson')).exists();
      assert.dom(screen.getByText('Leçon')).exists();
    });

    test('should have the "discovery" color and tag if grain is of type discovery', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const grain = store.createRecord('grain', { type: 'discovery', title: 'Grain title' });
      this.set('grain', grain);

      // when
      const screen = await render(hbs`
        <Module::Grain::Grain @grain={{this.grain}} />`);

      // then
      assert.dom(find('.grain-card--discovery')).exists();
      assert.dom(screen.getByText('Découverte')).exists();
    });

    test('should have the "challenge" color and tag if grain is of type challenge', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const grain = store.createRecord('grain', { type: 'challenge', title: 'Grain title' });
      this.set('grain', grain);

      // when
      const screen = await render(hbs`
        <Module::Grain::Grain @grain={{this.grain}} />`);

      // then
      assert.dom(find('.grain-card--challenge')).exists();
      assert.dom(screen.getByText('Défi')).exists();
    });

    test('should have the "summary" color and tag if grain is of type summary', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const grain = store.createRecord('grain', { type: 'summary', title: 'Grain title' });
      this.set('grain', grain);

      // when
      const screen = await render(hbs`
        <Module::Grain::Grain @grain={{this.grain}} />`);

      // then
      assert.dom(find('.grain-card--summary')).exists();
      assert.dom(screen.getByText("Récap'")).exists();
    });
  });

  module('when component is an element', function () {
    module('when element is a custom element', function () {
      test('should display a "CustomElement" element', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
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
        const grain = store.createRecord('grain', {
          title: 'Grain title',
          components: [{ type: 'element', element: customElement }],
        });

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
        const store = this.owner.lookup('service:store');
        const textElement = {
          content: 'element content',
          type: 'text',
          isAnswerable: false,
        };
        const grain = store.createRecord('grain', {
          title: 'Grain title',
          components: [{ type: 'element', element: textElement }],
        });
        this.set('grain', grain);

        // when
        const screen = await render(hbs`
          <Module::Grain::Grain @grain={{this.grain}} />`);

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
        const grain = store.createRecord('grain', {
          title: 'Grain title',
          components: [{ type: 'element', element: qcuElement }],
        });
        this.set('grain', grain);
        const passage = store.createRecord('passage');
        this.set('passage', passage);

        // when
        const screen = await render(hbs`
          <Module::Grain::Grain @grain={{this.grain}} @passage={{this.passage}} />`);

        // then
        assert.strictEqual(screen.getAllByRole('radio').length, qcuElement.proposals.length);
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
              defaultValue: '',
            },
            {
              input: 'premiere-partie',
              type: 'select',
              display: 'inline',
              placeholder: '',
              ariaLabel: 'Réponse 2',
              defaultValue: '',
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
        const grain = store.createRecord('grain', {
          title: 'Grain title',
          components: [{ type: 'element', element: qrocmElement }],
        });
        this.set('grain', grain);
        const passage = store.createRecord('passage');
        this.set('passage', passage);

        // when
        const screen = await render(hbs`
          <Module::Grain::Grain @grain={{this.grain}} @passage={{this.passage}} />`);

        // then
        assert.ok(screen);
        assert.dom(screen.getByText('Mon instruction')).exists({ count: 1 });
      });
    });

    module('when element is an image', function () {
      test('should display image element', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const url =
          'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg';
        const imageElement = {
          url,
          alt: 'alt text',
          alternativeText: 'alternative instruction',
          type: 'image',
        };
        const grain = store.createRecord('grain', {
          title: 'Grain title',
          components: [{ type: 'element', element: imageElement }],
        });
        this.set('grain', grain);

        // when
        const screen = await render(hbs`
          <Module::Grain::Grain @grain={{this.grain}} />`);

        // then
        assert.ok(screen.getByRole('img', { name: 'alt text' }).hasAttribute('src', url));
      });
    });

    module('when element is of type flashcards', function () {
      test('should display a flashcards element', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const flashCardsElement = {
          id: '71de6394-ff88-4de3-8834-a40057a50ff4',
          type: 'flashcards',
          title: "Introduction à l'adresse e-mail",
          instruction: '<p>...</p>',
          introImage: { url: 'https://images.pix.fr/modulix/placeholder-details.svg' },
          cards: [
            {
              id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
              recto: {
                image: {
                  url: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
                },
                text: "A quoi sert l'arobase dans mon adresse email ?",
              },
              verso: {
                image: { url: 'https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg' },
                text: "Parce que c'est joli",
              },
            },
          ],
        };
        const grain = store.createRecord('grain', {
          title: 'Grain title',
          components: [{ type: 'element', element: flashCardsElement }],
        });
        this.set('grain', grain);

        // when
        const screen = await render(hbs`
          <Module::Grain::Grain @grain={{this.grain}} />`);

        // then
        assert.dom(screen.getByRole('button', { name: 'Commencer' })).exists();
      });
    });

    module('when element is an expand', function () {
      test('should display an "Expand" element', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const title = 'An Expand title';
        const expandElement = {
          title,
          content: '<p>My Content</p>',
          type: 'expand',
        };
        const grain = store.createRecord('grain', {
          title: 'Grain title',
          components: [{ type: 'element', element: expandElement }],
        });
        this.set('grain', grain);

        // when
        const screen = await render(hbs`
          <Module::Grain::Grain @grain={{this.grain}} />`);

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
        const grain = store.createRecord('grain', {
          title: 'Grain title',
          components: [{ type: 'element', element }],
        });
        this.set('grain', grain);
        const passage = store.createRecord('passage');
        this.set('passage', passage);

        const correction = store.createRecord('correction-response');
        store.createRecord('element-answer', { elementId: element.id, correction, passage });

        // when
        const screen = await render(hbs`
          <Module::Grain::Grain @grain={{this.grain}} @canMoveToNextGrain={{true}} @passage={{this.passage}} />`);

        // then
        assert.dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.grain.skip') })).doesNotExist();
      });

      module('when canMoveToNextGrain is true', function () {
        test('should display continue button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const element = { id: 'qcu-id', type: 'qcu', isAnswerable: true };
          const grain = store.createRecord('grain', {
            title: '1st Grain title',
            components: [{ type: 'element', element }],
          });
          store.createRecord('module', { grains: [grain] });
          this.set('grain', grain);
          const passage = store.createRecord('passage');
          this.set('passage', passage);

          const correction = store.createRecord('correction-response');
          store.createRecord('element-answer', { elementId: element.id, correction, passage });

          // when
          const screen = await render(hbs`
            <Module::Grain::Grain @grain={{this.grain}} @canMoveToNextGrain={{true}} @passage={{this.passage}} />`);

          // then
          assert.dom(screen.queryByRole('button', { name: 'Continuer' })).exists();
        });
      });
      module('when canMoveToNextGrain is false', function () {
        test('should not display continue button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const element = { type: 'qcu', isAnswerable: true };
          const grain = store.createRecord('grain', {
            title: '1st Grain title',
            components: [{ type: 'element', element }],
          });
          store.createRecord('module', { grains: [grain] });
          this.set('grain', grain);
          const passage = store.createRecord('passage');
          this.set('passage', passage);

          // when
          const screen = await render(hbs`
            <Module::Grain::Grain @grain={{this.grain}} @canMoveToNextGrain={{false}} @passage={{this.passage}} />`);

          // then
          assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
        });
      });
    });

    module('when at least one element has not been answered', function () {
      module('when canMoveToNextGrain is true', function () {
        test('should not display continue button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const element = { type: 'qcu', isAnswerable: true };
          const grain = store.createRecord('grain', {
            title: 'Grain title',
            components: [{ type: 'element', element }],
          });
          this.set('grain', grain);
          const passage = store.createRecord('passage');
          this.set('passage', passage);

          // when
          const screen = await render(hbs`
            <Module::Grain::Grain @grain={{this.grain}} @canMoveToNextGrain={{true}} @passage={{this.passage}} />`);

          // then
          assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
        });

        test('should display skip button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const element = { type: 'qcu', isAnswerable: true };
          const grain = store.createRecord('grain', {
            title: '1st Grain title',
            components: [{ type: 'element', element }],
          });
          store.createRecord('module', { grains: [grain] });
          this.set('grain', grain);
          const passage = store.createRecord('passage');
          this.set('passage', passage);

          // when
          const screen = await render(hbs`
            <Module::Grain::Grain @grain={{this.grain}} @canMoveToNextGrain={{true}} @passage={{this.passage}} />`);

          // then
          assert.dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.grain.skip') })).exists();
        });
      });

      module('when canMoveToNextGrain is false', function () {
        test('should not display continue button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const element = { type: 'qcu', isAnswerable: true };
          const grain = store.createRecord('grain', {
            title: 'Grain title',
            components: [{ type: 'element', element }],
          });
          this.set('grain', grain);
          const passage = store.createRecord('passage');
          this.set('passage', passage);

          // when
          const screen = await render(hbs`
            <Module::Grain::Grain @grain={{this.grain}} @canMoveToNextGrain={{false}} @passage={{this.passage}} />`);

          // then
          assert.dom(screen.queryByRole('button', { name: 'Continuer' })).doesNotExist();
        });

        test('should not display skip button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const element = { type: 'qcu', isAnswerable: true };
          const grain = store.createRecord('grain', {
            title: 'Grain title',
            components: [{ type: 'element', element }],
          });
          store.createRecord('module', { grains: [grain] });
          this.set('grain', grain);
          const passage = store.createRecord('passage');
          this.set('passage', passage);

          // when
          const screen = await render(hbs`
            <Module::Grain::Grain @grain={{this.grain}} @canMoveToNextGrain={{false}} @passage={{this.passage}} />`);

          // then
          assert.dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.grain.skip') })).doesNotExist();
        });
      });
    });
  });

  module('when onGrainContinue is called', function () {
    test('should call onGrainContinue pass in argument', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const element = { type: 'text', isAnswerable: false };
      const grain = store.createRecord('grain', {
        title: '1st Grain title',
        components: [{ type: 'element', element }],
      });
      store.createRecord('module', { id: 'module-id', grains: [grain] });
      this.set('grain', grain);

      const stubonGrainContinue = sinon.stub();
      this.set('onGrainContinue', stubonGrainContinue);

      // when
      await render(
        hbs`
          <Module::Grain::Grain @grain={{this.grain}} @canMoveToNextGrain={{true}}
                         @onGrainContinue={{this.onGrainContinue}} />`,
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
      const grain = store.createRecord('grain', { title: 'Grain title', components: [{ type: 'element', element }] });
      store.createRecord('module', { id: 'module-id', grains: [grain] });
      this.set('grain', grain);
      const passage = store.createRecord('passage');
      this.set('passage', passage);

      const onGrainSkipStub = sinon.stub();
      this.set('onGrainSkip', onGrainSkipStub);

      this.set('onGrainContinue', () => {});

      // when
      await render(
        hbs`
          <Module::Grain::Grain @grain={{this.grain}} @canMoveToNextGrain={{true}}
                         @onGrainContinue={{this.onGrainContinue}} @onGrainSkip={{this.onGrainSkip}}
                         @passage={{this.passage}} />`,
      );
      await clickByName(t('pages.modulix.buttons.grain.skip'));

      // then
      sinon.assert.calledOnce(onGrainSkipStub);
      assert.ok(true);
    });
  });

  module('when onElementRetry is called', function () {
    test('should call onElementRetry pass in argument', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const element = { id: 'qcu-id', type: 'qcu', isAnswerable: true };
      const grain = store.createRecord('grain', { title: 'Grain title', components: [{ type: 'element', element }] });
      this.set('grain', grain);
      const passage = store.createRecord('passage');
      this.set('passage', passage);

      const onElementRetryStub = sinon.stub().withArgs({ element });
      this.set('onElementRetry', onElementRetryStub);

      const correction = store.createRecord('correction-response', { status: 'ko' });
      store.createRecord('element-answer', { elementId: element.id, correction, passage });

      // when
      await render(hbs`
        <Module::Grain::Grain @grain={{this.grain}} @onElementRetry={{this.onElementRetry}} @canMoveToNextGrain={{true}}
                       @passage={{this.passage}} />`);
      await clickByName(t('pages.modulix.buttons.activity.retry'));

      // then
      sinon.assert.calledOnce(onElementRetryStub);
      assert.ok(true);
    });
  });

  module('when grain contains a stepper', function () {
    test('should display the stepper', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const textElement = {
        content: 'element content',
        type: 'text',
        isAnswerable: false,
      };
      const grain = store.createRecord('grain', {
        title: 'Grain title',
        components: [{ type: 'stepper', steps: [{ elements: [textElement] }] }],
      });

      // when
      const screen = await render(<template><ModuleGrain @grain={{grain}} /></template>);

      // then
      assert.ok(screen.getByText('element content'));
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
        const grain = store.createRecord('grain', {
          title: 'Grain title',
          components: [
            {
              type: 'stepper',
              steps,
            },
          ],
        });
        const passage = store.createRecord('passage');
        passage.getLastCorrectionForElement = getLastCorrectionForElementStub;
        this.set('grain', grain);
        this.set('passage', passage);
        this.set('onElementAnswer', onElementAnswerStub);

        // when
        await render(hbs`
          <Module::Grain::Grain @grain={{this.grain}} @passage={{this.passage}} @onElementAnswer={{this.onElementAnswer}} />`);

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
        const grain = store.createRecord('grain', {
          title: 'Grain title',
          components: [
            {
              type: 'stepper',
              steps,
            },
          ],
        });
        const passage = store.createRecord('passage');
        const correctionResponse = store.createRecord('correction-response', {
          feedback: { state: 'Too bad!' },
          status: 'ko',
          solution: '1',
        });
        store.createRecord('element-answer', {
          correction: correctionResponse,
          elementId: 'd0690f26-978c-41c3-9a21-da931857739c',
          passage,
        });
        this.set('grain', grain);
        this.set('passage', passage);
        this.set('onElementRetry', onElementRetryStub);

        // when
        await render(hbs`
          <Module::Grain::Grain @grain={{this.grain}} @passage={{this.passage}}  @onElementRetry={{this.onElementRetry}} />`);

        // then
        await clickByName('radio1');
        await clickByName(t('pages.modulix.buttons.activity.retry'));
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

          const store = this.owner.lookup('service:store');
          const grain = store.createRecord('grain', {
            title: 'Grain title',
            components: [
              {
                type: 'stepper',
                steps,
              },
            ],
          });

          const passage = store.createRecord('passage');
          const onElementRetryStub = sinon.stub();

          this.set('grain', grain);
          this.set('passage', passage);
          this.set('onElementRetry', onElementRetryStub);

          // when
          const screen = await render(hbs`
          <Module::Grain::Grain @grain={{this.grain}} @passage={{this.passage}} @canMoveToNextGrain={{true}} @onElementRetry={{this.onElementRetry}}  />`);

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

          const store = this.owner.lookup('service:store');
          const grain = store.createRecord('grain', {
            title: 'Grain title',
            components: [
              {
                type: 'stepper',
                steps,
              },
            ],
          });

          const passage = store.createRecord('passage');
          const onElementRetryStub = sinon.stub();

          this.set('grain', grain);
          this.set('passage', passage);
          this.set('onElementRetry', onElementRetryStub);

          // when
          const screen = await render(hbs`
          <Module::Grain::Grain @grain={{this.grain}} @passage={{this.passage}} @canMoveToNextGrain={{true}} @onElementRetry={{this.onElementRetry}}  />`);

          // then
          assert.dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.grain.continue') })).doesNotExist();
        });
      });

      module('when there is no more steps to display', function (hooks) {
        let passage;
        let onElementRetryStub;
        let onStepperNextStepStub;
        let store;

        hooks.beforeEach(function () {
          store = this.owner.lookup('service:store');
          passage = store.createRecord('passage');
          onElementRetryStub = sinon.stub();
          onStepperNextStepStub = sinon.stub();
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

          const grain = store.createRecord('grain', {
            title: 'Grain title',
            components: [
              {
                type: 'stepper',
                steps,
              },
            ],
          });

          this.set('grain', grain);
          this.set('passage', passage);
          this.set('onElementRetry', onElementRetryStub);
          this.set('onStepperNextStep', onStepperNextStepStub);

          // when
          const screen = await render(hbs`
          <Module::Grain::Grain @grain={{this.grain}} @passage={{this.passage}} @canMoveToNextGrain={{true}} @onElementRetry={{this.onElementRetry}} @onStepperNextStep={{this.onStepperNextStep}} />`);
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

          const grain = store.createRecord('grain', {
            title: 'Grain title',
            components: [
              {
                type: 'stepper',
                steps,
              },
            ],
          });

          this.set('grain', grain);
          this.set('passage', passage);
          this.set('onElementRetry', onElementRetryStub);
          this.set('onStepperNextStep', onStepperNextStepStub);

          // when
          const screen = await render(hbs`
          <Module::Grain::Grain @grain={{this.grain}} @passage={{this.passage}} @canMoveToNextGrain={{true}} @onElementRetry={{this.onElementRetry}} @onStepperNextStep={{this.onStepperNextStep}} />`);
          await clickByName(t('pages.modulix.buttons.stepper.next.ariaLabel'));

          // then
          assert.dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.grain.skip') })).doesNotExist();
        });
      });
    });

    module('when there are answerable elements in stepper', function () {
      module('when user response is not verified', function (hooks) {
        let passage;
        let onElementRetryStub;
        let onStepperNextStepStub;
        let store;

        hooks.beforeEach(function () {
          store = this.owner.lookup('service:store');
          passage = store.createRecord('passage');
          onElementRetryStub = sinon.stub();
          onStepperNextStepStub = sinon.stub();
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
                  },
                ],
              },
            ];

            const grain = store.createRecord('grain', {
              title: 'Grain title',
              components: [
                {
                  type: 'stepper',
                  steps,
                },
              ],
            });

            this.set('grain', grain);
            this.set('passage', passage);
            this.set('onElementRetry', onElementRetryStub);
            this.set('onStepperNextStep', onStepperNextStepStub);

            // when
            const screen = await render(hbs`
          <Module::Grain::Grain @grain={{this.grain}} @passage={{this.passage}} @canMoveToNextGrain={{true}} @onElementRetry={{this.onElementRetry}} @onStepperNextStep={{this.onStepperNextStep}} />`);

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
                  },
                ],
              },
            ];

            const grain = store.createRecord('grain', {
              title: 'Grain title',
              components: [
                {
                  type: 'stepper',
                  steps,
                },
              ],
            });

            this.set('grain', grain);
            this.set('passage', passage);
            this.set('onElementRetry', onElementRetryStub);
            this.set('onStepperNextStep', onStepperNextStepStub);

            // when
            const screen = await render(hbs`
          <Module::Grain::Grain @grain={{this.grain}} @passage={{this.passage}} @canMoveToNextGrain={{true}} @onElementRetry={{this.onElementRetry}} @onStepperNextStep={{this.onStepperNextStep}} />`);

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

              const grain = store.createRecord('grain', {
                title: 'Grain title',
                components: [
                  {
                    type: 'stepper',
                    steps,
                  },
                ],
              });

              this.set('grain', grain);
              this.set('passage', passage);
              this.set('onElementRetry', onElementRetryStub);
              this.set('onStepperNextStep', onStepperNextStepStub);

              // when
              const screen = await render(hbs`
            <Module::Grain::Grain @grain={{this.grain}} @passage={{this.passage}} @canMoveToNextGrain={{true}} @onElementRetry={{this.onElementRetry}} @onStepperNextStep={{this.onStepperNextStep}} />`);
              await clickByName(t('pages.modulix.buttons.stepper.next.ariaLabel'));

              // then
              assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.grain.skip') })).exists();
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

              const grain = store.createRecord('grain', {
                title: 'Grain title',
                components: [
                  {
                    type: 'stepper',
                    steps,
                  },
                ],
              });

              this.set('grain', grain);
              this.set('passage', passage);
              this.set('onElementRetry', onElementRetryStub);
              this.set('onStepperNextStep', onStepperNextStepStub);

              // when
              const screen = await render(hbs`
            <Module::Grain::Grain @grain={{this.grain}} @passage={{this.passage}} @canMoveToNextGrain={{true}} @onElementRetry={{this.onElementRetry}} @onStepperNextStep={{this.onStepperNextStep}} />`);
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
                  },
                ],
              },
            ];

            const store = this.owner.lookup('service:store');
            const grain = store.createRecord('grain', {
              title: 'Grain title',
              components: [
                {
                  type: 'stepper',
                  steps,
                },
              ],
            });

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

            this.set('grain', grain);
            this.set('passage', passage);
            this.set('onElementRetry', onElementRetryStub);

            // when
            const screen = await render(hbs`
          <Module::Grain::Grain @grain={{this.grain}} @passage={{this.passage}} @canMoveToNextGrain={{true}} @onElementRetry={{this.onElementRetry}}  />`);

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
                  },
                ],
              },
            ];

            const store = this.owner.lookup('service:store');
            const grain = store.createRecord('grain', {
              title: 'Grain title',
              components: [
                {
                  type: 'stepper',
                  steps,
                },
              ],
            });

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

            this.set('grain', grain);
            this.set('passage', passage);
            this.set('onElementRetry', onElementRetryStub);

            // when
            const screen = await render(hbs`
          <Module::Grain::Grain @grain={{this.grain}} @passage={{this.passage}} @canMoveToNextGrain={{true}} @onElementRetry={{this.onElementRetry}}  />`);

            // then
            assert
              .dom(screen.queryByRole('button', { name: t('pages.modulix.buttons.grain.continue') }))
              .doesNotExist();
          });
        });

        module('when there is no more steps to display', function (hooks) {
          let passage;
          let onElementRetryStub;
          let onStepperNextStepStub;
          let store;

          hooks.beforeEach(function () {
            store = this.owner.lookup('service:store');
            passage = store.createRecord('passage');
            onElementRetryStub = sinon.stub();
            onStepperNextStepStub = sinon.stub();
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
              const grain = store.createRecord('grain', {
                title: 'Grain title',
                components: [
                  {
                    type: 'stepper',
                    steps,
                  },
                ],
              });

              const correction = store.createRecord('correction-response', {
                status: 'ok',
                feedback: { state: 'super' },
              });
              store.createRecord('element-answer', {
                elementId: 'd0690f26-978c-41c3-9a21-da931857739c',
                correction,
                passage,
              });

              this.set('grain', grain);
              this.set('passage', passage);
              this.set('onElementRetry', onElementRetryStub);
              this.set('onStepperNextStep', onStepperNextStepStub);

              // when
              const screen = await render(hbs`
                <Module::Grain::Grain @grain={{this.grain}} @passage={{this.passage}} @canMoveToNextGrain={{true}} @onElementRetry={{this.onElementRetry}} @onStepperNextStep={{this.onStepperNextStep}} />`);

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
              const grain = store.createRecord('grain', {
                title: 'Grain title',
                components: [
                  {
                    type: 'stepper',
                    steps,
                  },
                ],
              });

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

              this.set('grain', grain);
              this.set('passage', passage);
              this.set('onElementRetry', onElementRetryStub);
              this.set('onStepperNextStep', onStepperNextStepStub);

              // when
              const screen = await render(hbs`
                <Module::Grain::Grain @grain={{this.grain}} @passage={{this.passage}} @canMoveToNextGrain={{true}} @onElementRetry={{this.onElementRetry}} @onStepperNextStep={{this.onStepperNextStep}} />`);

              await clickByName(t('pages.modulix.buttons.stepper.next.ariaLabel'));

              // then
              assert.dom(screen.getByRole('button', { name: t('pages.modulix.buttons.grain.continue') })).exists();
            });
          });
        });
      });
    });
  });
});
