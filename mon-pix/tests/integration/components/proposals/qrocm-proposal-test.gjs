import { clickByName, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import QrocmProposal from 'mon-pix/components/proposals/qrocm-proposal';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | QROCm proposal', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When block type is select', function () {
    test('should select option', async function (assert) {
      // given
      const proposals = '${potato§La patate#samurai options=["salad", "tomato", "onion"]}';
      const onChangeSelectStub = sinon.stub();
      const answersValue = { potato: null };
      const onChangeSelect = onChangeSelectStub;
      const screen = await render(
        <template>
          <QrocmProposal @proposals={{proposals}} @answersValue={{answersValue}} @onChangeSelect={{onChangeSelect}} />
        </template>,
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
        const proposals = '${myInput}';
        const format = 'paragraphe';

        // when
        const screen = await render(<template><QrocmProposal @proposals={{proposals}} @format={{format}} /></template>);

        // then
        assert.strictEqual(screen.getByRole('textbox', { name: 'Réponse 1' }).tagName, 'TEXTAREA');
      });
    });

    module('When format is a sentence', function () {
      test('should display a input', async function (assert) {
        // given
        const proposals = '${myInput}';
        const format = 'phrase';

        // when
        const screen = await render(<template><QrocmProposal @proposals={{proposals}} @format={{format}} /></template>);

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
          const proposals = '${myInput}';
          const format = data.format;

          // when
          const screen = await render(
            <template><QrocmProposal @proposals={{proposals}} @format={{format}} /></template>,
          );

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
            const answerValue = '';
            const format = `${data.format}`;

            // when
            const screen = await render(
              <template>
                <QrocmProposal @proposals={{proposals}} @format={{format}} @answerValue={{answerValue}} />
              </template>,
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
            const proposals = '${rep1}, ${rep2} ${rep3}';
            const answerValue = '';
            const format = 'phrase';

            // when
            const screen = await render(
              <template>
                <QrocmProposal @proposals={{proposals}} @format={{format}} @answerValue={{answerValue}} />
              </template>,
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
            const proposals = 'texte : ${rep1}\nautre texte : ${rep2}';
            const answerValue = '';
            const format = 'phrase';

            // when
            const screen = await render(
              <template>
                <QrocmProposal @proposals={{proposals}} @format={{format}} @answerValue={{answerValue}} />
              </template>,
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
