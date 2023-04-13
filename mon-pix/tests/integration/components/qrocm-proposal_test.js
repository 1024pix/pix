import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickByName, render } from '@1024pix/ember-testing-library';
import sinon from 'sinon';

module('Integration | Component | QROCm proposal', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When block type is select', function (hooks) {
    hooks.beforeEach(function () {
      this.set('proposals', '${potato§La patate#samurai options=["salad", "tomato", "onion"]}');
    });

    test('should select option', async function (assert) {
      // given
      const onChangeSelectStub = sinon.stub();
      this.set('answersValue', { potato: null });
      this.set('onChangeSelect', onChangeSelectStub);
      const screen = await render(
        hbs`<QrocmProposal @proposals={{this.proposals}} @answersValue={{this.answersValue}} @onChangeSelect={{this.onChangeSelect}}/>`
      );

      // when
      await clickByName('La patate');
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'tomato' }));

      // then
      sinon.assert.calledOnce(onChangeSelectStub);
      assert.ok(true);
    });
  });

  module('When block type is input', function () {
    module('When format is a paragraph', function () {
      test('should display a textarea', async function (assert) {
        // given
        this.set('proposals', '${myInput}');
        this.set('format', 'paragraphe');

        // when
        const screen = await render(hbs`<QrocmProposal @proposals={{this.proposals}} @format={{this.format}} />`);

        // then
        assert.strictEqual(screen.getByRole('textbox', { name: 'Réponse 1' }).tagName, 'TEXTAREA');
      });
    });

    module('When format is a sentence', function () {
      test('should display a input', async function (assert) {
        // given
        this.set('proposals', '${myInput}');
        this.set('format', 'phrase');

        // when
        const screen = await render(hbs`<QrocmProposal @proposals={{this.proposals}} @format={{this.format}} />`);

        // then
        assert.strictEqual(screen.getByRole('textbox', { name: 'Réponse 1' }).tagName, 'INPUT');
      });
    });

    module('When format is a neither a paragraph nor a sentence', function () {
      [
        { format: 'petit', expectedSize: '11' },
        { format: 'mots', expectedSize: '20' },
        { format: 'unreferenced_format', expectedSize: '20' },
      ].forEach((data) => {
        test(`should display an input with expected size (${data.expectedSize}) when format is ${data.format}`, async function (assert) {
          // given
          this.set('proposals', '${myInput}');
          this.set('format', data.format);

          // when
          const screen = await render(hbs`<QrocmProposal @proposals={{this.proposals}} @format={{this.format}} />`);

          // then
          const input = screen.getByRole('textbox', { name: 'Réponse 1' });

          assert.strictEqual(input.tagName, 'INPUT');
          assert.strictEqual(input.getAttribute('size'), data.expectedSize);
        });
      });
    });

    module('Whatever the format', function () {
      [
        { format: 'mots', inputType: 'input' },
        { format: 'phrase', inputType: 'input' },
        { format: 'paragraphe', inputType: 'textarea' },
        { format: 'unreferenced_format', inputType: 'input' },
      ].forEach((data) => {
        module(`Component behavior when the user clicks on the ${data.inputType}`, function () {
          test('should not display autocompletion answers', async function (assert) {
            // given
            const proposals = '${myInput}';
            this.set('proposals', proposals);
            this.set('answerValue', '');
            this.set('format', `${data.format}`);

            // when
            const screen = await render(
              hbs`<QrocmProposal @proposals={{this.proposals}} @format={{this.format}} @answerValue={{this.answerValue}} />`
            );

            // then
            assert.strictEqual(screen.getByRole('textbox', { name: 'Réponse 1' }).getAttribute('autocomplete'), 'nope');
          });
        });
      });

      module('when there are multiple proposals', function () {
        module('when there is no label associated with input', function () {
          test('should each have a specific aria-label', async function (assert) {
            // given
            this.set('proposals', '${rep1}, ${rep2} ${rep3}');
            this.set('answerValue', '');
            this.set('format', 'phrase');

            // when
            const screen = await render(
              hbs`<QrocmProposal @proposals={{this.proposals}} @format={{this.format}} @answerValue={{this.answerValue}} />`
            );

            // then
            assert.dom(screen.getByRole('textbox', { name: 'Réponse 1' })).exists();
            assert.dom(screen.getByRole('textbox', { name: 'Réponse 2' })).exists();
            assert.dom(screen.getByRole('textbox', { name: 'Réponse 3' })).exists();
          });
        });

        module('when there is a label associated with input', function () {
          test('should render label', async function (assert) {
            // given
            this.set('proposals', 'texte : ${rep1}\nautre texte : ${rep2}');
            this.set('answerValue', '');
            this.set('format', 'phrase');

            // when
            const screen = await render(
              hbs`<QrocmProposal @proposals={{this.proposals}} @format={{this.format}} @answerValue={{this.answerValue}} />`
            );

            // then
            assert.dom(screen.getByRole('textbox', { name: 'texte :' })).exists();
            assert.dom(screen.getByRole('textbox', { name: 'autre texte :' })).exists();
          });
        });
      });
    });
  });
});
