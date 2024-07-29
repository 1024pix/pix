import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Challenge item QROC', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('assessment', {
      hasTimeoutChallenge: false,
    });
  });

  test('should render the form', async function (assert) {
    this.set('challenge', {
      timer: false,
    });
    this.set('answer', null);

    await render(
      hbs`<ChallengeItem::ChallengeItemQroc @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}}/>`,
    );

    assert.dom('.qroc-proposal').exists();
  });

  module('When format is a paragraph', function () {
    test('should display a textarea', async function (assert) {
      // given
      this.set('challenge', {
        timer: false,
        format: 'paragraphe',
        proposals: 'mon label: ${myInput}',
      });
      this.set('answer', {});

      // when
      const screen = await render(
        hbs`<ChallengeItem::ChallengeItemQroc @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}} />`,
      );

      // then
      assert.dom(screen.getByRole('textbox', { name: 'mon label:' })).exists();
    });
  });

  module('When format is a sentence', function () {
    test('should display an input', async function (assert) {
      // given
      this.set('challenge', {
        timer: false,
        format: 'phrase',
        proposals: 'mon label: ${myInput}',
      });
      this.set('answer', {});

      // when
      const screen = await render(
        hbs`<ChallengeItem::ChallengeItemQroc @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}} />`,
      );

      // then
      assert.dom(screen.getByRole('textbox', { name: 'mon label:' })).exists();
      assert.dom(screen.getByRole('textbox', { name: 'mon label:' })).hasAttribute('type', 'text');
    });
  });

  module('When format is a number', function () {
    test('should display an input with number type', async function (assert) {
      // given
      this.set('challenge', {
        timer: false,
        format: 'nombre',
        proposals: 'mon label: ${myInput}',
      });
      this.set('answer', {});

      // when
      const screen = await render(
        hbs`<ChallengeItem::ChallengeItemQroc  @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}} />`,
      );

      // then
      assert.dom(screen.getByRole('spinbutton', { name: 'mon label:' })).exists();
      assert.dom(screen.getByRole('spinbutton', { name: 'mon label:' })).hasAttribute('type', 'number');
    });
  });

  module('When format is neither a paragraph nor a phrase', function () {
    [
      { format: 'petit', expectedSize: '11' },
      { format: 'mots', expectedSize: '20' },
      { format: 'unreferenced_format', expectedSize: '20' },
    ].forEach((data) => {
      test(`should display an input with expected size (${data.expectedSize}) when format is ${data.format}`, async function (assert) {
        // given
        this.set('challenge', {
          timer: false,
          format: data.format,
          proposals: 'mon label: ${myInput}',
        });
        this.set('answer', {});

        // when
        const screen = await render(
          hbs`<ChallengeItem::ChallengeItemQroc @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}} />`,
        );

        // then
        assert.dom(screen.getByRole('textbox', { name: 'mon label:' })).exists();
        assert.dom(screen.getByRole('textbox', { name: 'mon label:' })).hasAttribute('size', data.expectedSize);
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
      module(`Component behavior when the user clicks on the ${data.inputType}:`, function () {
        test('should not display autocompletion answers', async function (assert) {
          // given
          this.set('challenge', {
            timer: false,
            format: data.format,
            proposals: 'mon label: ${myInput}',
          });
          this.set('answer', { value: '' });

          // when
          const screen = await render(
            hbs`<ChallengeItem::ChallengeItemQroc  @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}}/>`,
          );

          // then
          assert.dom(screen.getByRole('textbox', { name: 'mon label:' })).hasAttribute('autocomplete', 'nope');
        });
      });

      module('Component behavior when user fill input of challenge:', function () {
        test('should display a value when a non-empty value is providing by user', async function (assert) {
          // given
          this.set('challenge', {
            timer: false,
            format: data.format,
            proposals: 'mon label: ${myInput}',
          });
          this.set('answer', { value: 'myValue' });

          // when
          const screen = await render(
            hbs`<ChallengeItem::ChallengeItemQroc @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}}/>`,
          );

          // then
          assert.strictEqual(screen.getByRole('textbox', { name: 'mon label:' }).value, 'myValue');
        });
      });

      module('Component behavior when user skip challenge:', function () {
        [
          { input: 'aband', output: 'aband' },
          { input: '#aband#', output: '#aband#' },
          { input: 'aband#', output: 'aband#' },
          { input: 'ABAND', output: 'ABAND' },
          { input: '#ABAND', output: '#ABAND' },
          { input: 'ABAND#', output: 'ABAND#' },
          { input: '#ABAND#', output: '' },
          { input: '', output: '' },
        ].forEach(({ input, output }) => {
          test(`should display '' value ${input} is providing to component`, async function (assert) {
            // given
            this.set('challenge', {
              timer: false,
              format: data.format,
              proposals: 'mon label: ${myInput}',
            });
            this.set('answer', { value: input });

            // when
            const screen = await render(
              hbs`<ChallengeItem::ChallengeItemQroc @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}} />`,
            );

            // then
            assert.strictEqual(screen.getByRole('textbox', { name: 'mon label:' }).value, output);
          });
        });
      });
    });
  });

  module('when default value is defined in proposals', function () {
    test('should prefill input with default value', async function (assert) {
      // given
      this.set('challenge', {
        timer: false,
        format: 'mots',
        proposals: 'mon label: ${myInput value="c\'est prérempli !!!"}',
      });
      this.set('answer', {});

      // when
      const screen = await render(
        hbs`<ChallengeItem::ChallengeItemQroc @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}} />`,
      );

      // then
      assert.strictEqual(screen.getByRole('textbox', { name: 'mon label:' }).value, "c'est prérempli !!!");
    });

    test('should prefill number input with default value', async function (assert) {
      // given
      this.set('challenge', {
        timer: false,
        format: 'nombre',
        proposals: 'mon label: ${myInput value=42}',
      });
      this.set('answer', {});

      // when
      const screen = await render(
        hbs`<ChallengeItem::ChallengeItemQroc @challenge={{this.challenge}} @answer={{this.answer}} @assessment={{this.assessment}} />`,
      );

      // then
      assert.strictEqual(screen.getByRole('spinbutton', { name: 'mon label:' }).value, '42');
    });
  });
});
