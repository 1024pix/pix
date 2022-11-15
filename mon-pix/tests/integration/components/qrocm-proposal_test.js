import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { fillIn, find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | QROCm proposal', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    await render(hbs`<QrocmProposal />`);

    assert.dom('.qrocm-proposal').exists();
  });

  module('When block type is select', function (hooks) {
    hooks.beforeEach(function () {
      this.set('proposals', '${potato§La patate#samurai options=["salad", "tomato", "onion"]}');
    });

    test('should display a selector with related options', async function (assert) {
      // given
      const placeholderValue = '';
      const expectedOptionValues = [placeholderValue, 'salad', 'tomato', 'onion'];

      // when
      await render(hbs`<QrocmProposal @proposals={{this.proposals}}/>`);

      // then
      const selector = find('select[data-test="challenge-response-proposal-selector"]');
      const options = findAll('select[data-test="challenge-response-proposal-selector"] option');
      const optionValues = options.map((option) => option.value);

      assert.equal(selector.tagName, 'SELECT');
      assert.equal(selector.getAttribute('aria-label'), 'La patate');
      assert.deepEqual(optionValues, expectedOptionValues);
    });

    test('should select option', async function (assert) {
      // given
      this.set('answersValue', { potato: null });

      // when
      await render(hbs`<QrocmProposal @proposals={{this.proposals}} @answersValue={{this.answersValue}}/>`);
      await fillIn('select[data-test="challenge-response-proposal-selector"]', 'tomato');

      // then
      assert.equal(this.answersValue['potato'], 'tomato');
    });
  });

  module('When block type is input', function () {
    module('When format is a paragraph', function () {
      test('should display a textarea', async function (assert) {
        // given
        this.set('proposals', '${myInput}');
        this.set('format', 'paragraphe');

        // when
        await render(hbs`<QrocmProposal @proposals={{this.proposals}} @format={{this.format}} />`);

        // then
        assert.equal(find('.challenge-response__proposal--paragraph').tagName, 'TEXTAREA');
      });
    });

    module('When format is a sentence', function () {
      test('should display a input', async function (assert) {
        // given
        this.set('proposals', '${myInput}');
        this.set('format', 'phrase');

        // when
        await render(hbs`<QrocmProposal @proposals={{this.proposals}} @format={{this.format}} />`);

        // then
        assert.equal(find('.challenge-response__proposal--sentence').tagName, 'INPUT');
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
          await render(hbs`<QrocmProposal @proposals={{this.proposals}} @format={{this.format}} />`);

          // then
          assert.dom('.challenge-response__proposal--paragraph').doesNotExist();
          assert.equal(find('.challenge-response__proposal').tagName, 'INPUT');
          assert.equal(find('.challenge-response__proposal').getAttribute('size'), data.expectedSize);
        });
      });
    });

    module('Whatever the format', function () {
      [
        { format: 'mots', cssClass: '.challenge-response__proposal', inputType: 'input' },
        { format: 'phrase', cssClass: '.challenge-response__proposal--sentence', inputType: 'input' },
        { format: 'paragraphe', cssClass: '.challenge-response__proposal--paragraph', inputType: 'textarea' },
        { format: 'unreferenced_format', cssClass: '.challenge-response__proposal', inputType: 'input' },
      ].forEach((data) => {
        module(`Component behavior when the user clicks on the ${data.inputType}`, function () {
          test('should not display autocompletion answers', async function (assert) {
            // given
            const proposals = '${myInput}';
            this.set('proposals', proposals);
            this.set('answerValue', '');
            this.set('format', `${data.format}`);

            // when
            await render(
              hbs`<QrocmProposal @proposals={{this.proposals}} @format={{this.format}} @answerValue={{this.answerValue}} />`
            );

            // then
            assert.equal(find(`${data.cssClass}`).getAttribute('autocomplete'), 'nope');
          });
        });
      });

      [
        { proposals: '${input}', expectedAriaLabel: ['Réponse 1'] },
        { proposals: '${rep1}, ${rep2} ${rep3}', expectedAriaLabel: ['Réponse 1', 'Réponse 2', 'Réponse 3'] },
      ].forEach((data) => {
        module(`Component aria-label accessibility when proposal is ${data.proposals}`, function (hooks) {
          let allInputElements;

          hooks.beforeEach(async function () {
            // given
            this.set('proposals', data.proposals);
            this.set('answerValue', '');
            this.set('format', 'phrase');

            // when
            await render(
              hbs`<QrocmProposal @proposals={{this.proposals}} @format={{this.format}} @answerValue={{this.answerValue}} />`
            );

            //then
            allInputElements = findAll('.challenge-response__proposal');
          });

          test('should have an aria-label', async function (assert) {
            // then
            assert.equal(allInputElements.length, data.expectedAriaLabel.length);
            allInputElements.forEach((element, index) => {
              assert.ok(element.getAttribute('aria-label').includes(data.expectedAriaLabel[index]));
            });
          });

          test('should not have a label', async function (assert) {
            // then
            assert.dom('label').doesNotExist();
          });
        });
      });

      [{ proposals: 'texte : ${rep1}\nautre texte : ${rep2}', expectedLabel: ['texte :', 'autre texte :'] }].forEach(
        (data) => {
          module(`Component label accessibility when proposal is ${data.proposals}`, function (hooks) {
            let allLabelElements, allInputElements;

            hooks.beforeEach(async function () {
              // given
              this.set('proposals', data.proposals);
              this.set('answerValue', '');
              this.set('format', 'phrase');

              // when
              await render(
                hbs`<QrocmProposal @proposals={{this.proposals}} @format={{this.format}} @answerValue={{this.answerValue}} />`
              );

              //then
              allLabelElements = findAll('label');
              allInputElements = findAll('.challenge-response__proposal');
            });

            test('should have a label', async function (assert) {
              // then
              assert.equal(allLabelElements.length, allInputElements.length);
              assert.equal(allLabelElements.length, data.expectedLabel.length);
              allLabelElements.forEach((element, index) => {
                assert.equal(element.textContent.trim(), data.expectedLabel[index]);
              });
            });

            test('should not have an aria-label', async function (assert) {
              // then
              assert.notOk(find('.challenge-response__proposal').getAttribute('aria-label'));
            });

            test('should connect the label with the input', async function (assert) {
              // then
              assert.equal(allInputElements.length, allLabelElements.length);
              const allInputElementsId = allInputElements.map((inputElement) => inputElement.getAttribute('id'));
              const allLabelElementsFor = allLabelElements.map((labelElement) => labelElement.getAttribute('for'));
              assert.deepEqual(allInputElementsId, allLabelElementsFor);
            });
          });
        }
      );
    });
  });
});
