import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
// eslint-disable-next-line no-restricted-imports
import { find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | QROC solution panel', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When format is paragraph', function () {
    test('should display disabled textarea', async function (assert) {
      // given
      const challenge = EmberObject.create({ format: 'paragraphe' });
      const answer = EmberObject.create({ challenge });
      const solution = '4';
      this.set('answer', answer);
      this.set('solution', solution);

      //when
      await render(hbs`<SolutionPanel::QrocSolutionPanel @answer={{this.answer}} @solution={{this.solution}} />`);

      // then
      assert.dom('input').doesNotExist();
      assert.dom('textarea.correction-qroc-box-answer--paragraph').hasAttribute('disabled');
      assert.strictEqual(find('textarea.correction-qroc-box-answer--paragraph').getAttribute('rows'), '5');
      assert.strictEqual(
        find('textarea.correction-qroc-box-answer--paragraph').getAttribute('aria-label'),
        'Question passée',
      );
    });
  });

  module('When format is sentence', function () {
    test('should display disabled input', async function (assert) {
      // given
      const challenge = EmberObject.create({ format: 'phrase' });
      const answer = EmberObject.create({ challenge });
      const solution = '4';
      this.set('answer', answer);
      this.set('solution', solution);

      //when
      await render(hbs`<SolutionPanel::QrocSolutionPanel @answer={{this.answer}} @solution={{this.solution}} />`);

      // then
      assert.dom('input.correction-qroc-box-answer--sentence').hasAttribute('disabled');
    });
  });

  module('When format is neither a paragraph nor a sentence', function () {
    test(`should display a disabled input with expected size`, async function (assert) {
      // given
      const challenge = EmberObject.create({ format: '' });
      const answer = EmberObject.create({ id: 'answer_id', result: 'ok', value: 'test', challenge });
      const solution = '4';
      this.set('answer', answer);
      this.set('solution', solution);

      //when
      await render(hbs`<SolutionPanel::QrocSolutionPanel @answer={{this.answer}} @solution={{this.solution}} />`);

      // then
      assert.dom('textarea.correction-qroc-box-answer--paragraph').doesNotExist();
      assert.dom('textarea.correction-qroc-box-answer--sentence').doesNotExist();
      assert.dom('input.correction-qroc-box-answer--input').hasAttribute('disabled');
      assert.strictEqual(
        find('input.correction-qroc-box-answer--input').getAttribute('size'),
        String(answer.value.length + 1),
      );
    });
  });

  [
    { format: 'petit', input: '.correction-qroc-box-answer--input' },
    { format: 'phrase', input: '.correction-qroc-box-answer--sentence' },
    { format: 'paragraphe', input: '.correction-qroc-box-answer--paragraph' },
    { format: 'unreferenced_format', input: '.correction-qroc-box-answer--input' },
  ].forEach((data) => {
    module(`Whatever the format (testing "${data.format}" format)`, function () {
      module('When the answer is correct', function (hooks) {
        hooks.beforeEach(async function () {
          // given
          const assessment = EmberObject.create({ id: 'assessment_id' });
          const challenge = EmberObject.create({ id: 'challenge_id', format: data.format });
          const answer = EmberObject.create({ id: 'answer_id', result: 'ok', value: 'test', assessment, challenge });
          const solution = '4';
          this.set('answer', answer);
          this.set('solution', solution);

          //when
          await render(hbs`<SolutionPanel::QrocSolutionPanel @answer={{this.answer}} @solution={{this.solution}} />`);
        });

        test('should display the answer in bold green', async function (assert) {
          // then
          assert.dom('.correction-qroc-box-answer').exists();
          assert.dom('.correction-qroc-box__answer').exists();
          assert.dom('.correction-qroc-box-answer--correct').exists();
        });

        test('should display the given answer value with a valid aria label', async function (assert) {
          // then
          const answerBlock = find(data.input);

          assert.ok(answerBlock);
          assert.strictEqual(answerBlock.value, 'test');
        });

        test('should not display the solution', async function (assert) {
          // then
          assert.dom('.comparison-window-solution').doesNotExist();
        });
      });

      module('When the answer is wrong', function (hooks) {
        hooks.beforeEach(async function () {
          // given
          const assessment = EmberObject.create({ id: 'assessment_id' });
          const challenge = EmberObject.create({ id: 'challenge_id', format: data.format });
          const answer = EmberObject.create({ id: 'answer_id', result: 'ko', assessment, challenge });
          const solution = '4';
          this.set('answer', answer);
          this.set('solution', solution);

          // when
          await render(hbs`<SolutionPanel::QrocSolutionPanel @answer={{this.answer}} @solution={{this.solution}} />`);
        });

        test('should display the false answer with line-through', function (assert) {
          // then
          assert.dom('.correction-qroc-box-answer').exists();
          assert.dom('.correction-qroc-box__answer').exists();
          assert.dom('.correction-qroc-box-answer--wrong').exists();
        });

        test('should display the solution with an arrow and the solution in bold green', function (assert) {
          const blockSolution = find('.comparison-window-solution');
          const solutionText = find('.comparison-window-solution__text');

          // then
          assert.ok(blockSolution);
          assert.ok(solutionText);
        });
      });

      module('When the answer was not given', function (hooks) {
        const EMPTY_DEFAULT_MESSAGE = 'Pas de réponse';

        hooks.beforeEach(async function () {
          // given
          const assessment = EmberObject.create({ id: 'assessment_id' });
          const challenge = EmberObject.create({ id: 'challenge_id', format: data.format });
          const answer = EmberObject.create({
            id: 'answer_id',
            value: '#ABAND#',
            result: 'aband',
            assessment,
            challenge,
          });
          const solution = '4';
          this.set('answer', answer);
          this.set('solution', solution);
          this.set('isResultWithoutAnswer', true);

          // when
          await render(hbs`<SolutionPanel::QrocSolutionPanel @answer={{this.answer}} @solution={{this.solution}} />`);
        });

        test('should display "Pas de réponse" in italic', function (assert) {
          // then
          const answerBlock = find(data.input);

          assert.ok(answerBlock);
          assert.strictEqual(answerBlock.value, EMPTY_DEFAULT_MESSAGE);
          assert.dom('.correction-qroc-box-answer--aband').exists();
        });
      });

      module('When the answer is timed out', function (hooks) {
        hooks.beforeEach(async function () {
          // given
          const assessment = EmberObject.create({ id: 'assessment_id' });
          const challenge = EmberObject.create({ id: 'challenge_id', format: data.format });
          const answer = EmberObject.create({
            id: 'answer_id',
            value: '',
            result: 'aband',
            timeout: -1,
            assessment,
            challenge,
          });
          const solution = '4';
          this.set('answer', answer);
          this.set('solution', solution);
          this.set('isResultWithoutAnswer', true);

          // when
          await render(hbs`<SolutionPanel::QrocSolutionPanel @answer={{this.answer}} @solution={{this.solution}} />`);
        });

        test('should display "Temps écoulé" in italic', function (assert) {
          // then
          const answerBlock = find(data.input);

          assert.ok(answerBlock);
          assert.strictEqual(answerBlock.value, 'Temps dépassé');
          assert.dom('.correction-qroc-box-answer--timeout').exists();
        });
      });
    });
  });

  module('when user has not answerd correctly', function () {
    module('when solutionToDisplay is indicated', function () {
      test('should show the solution from solutionToDisplay', async function (assert) {
        //Given
        const answer = EmberObject.create({ result: 'ko' });
        const solutionToDisplay = 'MEILLEURE EXPLICATION !';
        const solution = 'SOLUTION !';
        const challenge = EmberObject.create();
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('solutionToDisplay', solutionToDisplay);
        this.set('challenge', challenge);

        // When
        await render(
          hbs`<SolutionPanel::QrocSolutionPanel
  @answer={{this.answer}}
  @challenge={{this.challenge}}
  @solution={{this.solution}}
  @solutionToDisplay={{this.solutionToDisplay}}
/>`,
        );

        // Then
        assert.dom('.comparison-window-solution').exists();
        assert.ok(find('.comparison-window-solution__text').textContent.includes(solutionToDisplay));
      });
    });

    module('when solutionToDisplay is not indicated', function () {
      test('should show the solution', async function (assert) {
        // Given
        const answer = EmberObject.create({ result: 'ko' });
        const solutionToDisplay = null;
        const solution = 'SOLUTION !';
        const challenge = EmberObject.create();
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('solutionToDisplay', solutionToDisplay);
        this.set('challenge', challenge);

        // When
        await render(
          hbs`<SolutionPanel::QrocSolutionPanel
  @answer={{this.answer}}
  @challenge={{this.challenge}}
  @solution={{this.solution}}
  @solutionToDisplay={{this.solutionToDisplay}}
/>`,
        );

        // Then
        assert.dom('.comparison-window-solution').exists();
        assert.ok(find('.comparison-window-solution__text').textContent.includes(solution));
      });
    });
  });

  module('when user has answered correctly', function () {
    module('when solutionToDisplay is indicated', function () {
      test('should not show the solution text', async function (assert) {
        //Given
        const answer = EmberObject.create({ result: 'ok' });
        const solutionToDisplay = 'MEILLEURE EXPLICATION !';
        const solution = 'SOLUTION !';
        const challenge = EmberObject.create();
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('solutionToDisplay', solutionToDisplay);
        this.set('challenge', challenge);

        // When
        await render(
          hbs`<SolutionPanel::QrocSolutionPanel
  @answer={{this.answer}}
  @challenge={{this.challenge}}
  @solution={{this.solution}}
  @solutionToDisplay={{this.solutionToDisplay}}
/>`,
        );

        // Then
        assert.dom('.comparison-window-solution').doesNotExist();
      });
    });
  });

  // The aria-label is only forwarded to the DOM by PixTextarea (paragraphe format); PixInput
  // ignores the @ariaLabel argument. So the inputAriaLabel branches are asserted through the
  // paragraphe textarea, which renders the attribute.
  module('aria label of the answer input', function () {
    test('should display a good aria label when the answer is correct', async function (assert) {
      // given
      const challenge = EmberObject.create({ format: 'paragraphe' });
      const answer = EmberObject.create({ result: 'ok', value: 'test', challenge });
      this.set('answer', answer);
      this.set('solution', '4');

      // when
      await render(hbs`<SolutionPanel::QrocSolutionPanel @answer={{this.answer}} @solution={{this.solution}} />`);

      // then
      assert.strictEqual(
        find('.correction-qroc-box-answer--paragraph').getAttribute('aria-label'),
        t('pages.comparison-window.results.a11y.good-answer'),
      );
    });

    test('should display a wrong aria label when the answer is wrong', async function (assert) {
      // given
      const challenge = EmberObject.create({ format: 'paragraphe' });
      const answer = EmberObject.create({ result: 'ko', value: 'test', challenge });
      this.set('answer', answer);
      this.set('solution', '4');

      // when
      await render(hbs`<SolutionPanel::QrocSolutionPanel @answer={{this.answer}} @solution={{this.solution}} />`);

      // then
      assert.strictEqual(
        find('.correction-qroc-box-answer--paragraph').getAttribute('aria-label'),
        t('pages.comparison-window.results.a11y.wrong-answer'),
      );
    });

    test('should display a timedout aria label when the answer timed out', async function (assert) {
      // given
      const challenge = EmberObject.create({ format: 'paragraphe' });
      const answer = EmberObject.create({ result: 'aband', value: '', timeout: -1, challenge });
      this.set('answer', answer);
      this.set('solution', '4');

      // when
      await render(hbs`<SolutionPanel::QrocSolutionPanel @answer={{this.answer}} @solution={{this.solution}} />`);

      // then
      assert.strictEqual(
        find('.correction-qroc-box-answer--paragraph').getAttribute('aria-label'),
        t('pages.comparison-window.results.a11y.timedout'),
      );
    });
  });

  module('when the solution has several variants', function () {
    test('should display only the first variant', async function (assert) {
      // given
      const answer = EmberObject.create({ result: 'ko', challenge: EmberObject.create() });
      const solution = 'Reponse\nreponse\nréponse';
      this.set('answer', answer);
      this.set('solution', solution);

      // when
      await render(hbs`<SolutionPanel::QrocSolutionPanel @answer={{this.answer}} @solution={{this.solution}} />`);

      // then
      const solutionText = find('.comparison-window-solution__text').textContent;
      assert.ok(solutionText.includes('Reponse'));
      assert.notOk(solutionText.includes('réponse'));
    });
  });

  module('when challenge is autoReply without solution', function (hooks) {
    let challenge, solution;
    hooks.beforeEach(function () {
      challenge = EmberObject.create({ autoReply: true });
      solution = null;
    });

    test('should not show the block answers and solution if solutionToDisplay not exists', async function (assert) {
      //Given
      const answer = EmberObject.create({ result: 'ko' });
      const solutionToDisplay = null;
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('solutionToDisplay', solutionToDisplay);
      this.set('challenge', challenge);

      // When
      await render(
        hbs`<SolutionPanel::QrocSolutionPanel
  @answer={{this.answer}}
  @challenge={{this.challenge}}
  @solution={{this.solution}}
  @solutionToDisplay={{this.solutionToDisplay}}
/>`,
      );

      // Then
      assert.dom('.correction-qroc-box').doesNotExist();
    });

    test('should show the solution if solutionToDisplay exists', async function (assert) {
      //Given
      const answer = EmberObject.create({ result: 'ko' });
      const solutionToDisplay = 'TADA !';
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('solutionToDisplay', solutionToDisplay);
      this.set('challenge', challenge);

      // When
      await render(
        hbs`<SolutionPanel::QrocSolutionPanel
  @answer={{this.answer}}
  @challenge={{this.challenge}}
  @solution={{this.solution}}
  @solutionToDisplay={{this.solutionToDisplay}}
/>`,
      );

      // Then
      assert.dom('.correction-qroc-box').exists();
      assert.dom('.comparison-window-solution').exists();
      assert.ok(find('.comparison-window-solution__text').textContent.includes(solutionToDisplay));
    });
  });
});
