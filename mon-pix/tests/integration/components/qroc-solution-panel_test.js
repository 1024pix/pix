import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

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
      await render(hbs`<QrocSolutionPanel @answer={{this.answer}} @solution={{this.solution}}/>`);

      // then
      assert.dom('input').doesNotExist();
      assert.dom('textarea.correction-qroc-box-answer--paragraph').hasAttribute('disabled');
      assert.strictEqual(find('.correction-qroc-box-answer').getAttribute('rows'), '5');
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
      await render(hbs`<QrocSolutionPanel @answer={{this.answer}} @solution={{this.solution}}/>`);

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
      await render(hbs`<QrocSolutionPanel @answer={{this.answer}} @solution={{this.solution}}/>`);

      // then
      assert.dom('textarea.correction-qroc-box-answer--paragraph').doesNotExist();
      assert.dom('textarea.correction-qroc-box-answer--sentence').doesNotExist();
      assert.dom('input.correction-qroc-box-answer').hasAttribute('disabled');
      assert.strictEqual(find('input.correction-qroc-box-answer').getAttribute('size'), answer.value.length.toString());
    });
  });

  [{ format: 'petit' }, { format: 'phrase' }, { format: 'paragraphe' }, { format: 'unreferenced_format' }].forEach(
    (data) => {
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
            await render(hbs`<QrocSolutionPanel @answer={{this.answer}} @solution={{this.solution}}/>`);
          });

          test('should display the answer in bold green', async function (assert) {
            // then
            assert.dom('.correction-qroc-box-answer').exists();
            assert.dom('.correction-qroc-box__answer').exists();
            assert.dom('.correction-qroc-box-answer--correct').exists();
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
            await render(hbs`<QrocSolutionPanel @answer={{this.answer}} @solution={{this.solution}}/>`);
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
            await render(hbs`<QrocSolutionPanel @answer={{this.answer}} @solution={{this.solution}}/>`);
          });

          test('should display "Pas de réponse" in italic', function (assert) {
            // then
            const answerBlock = find('.correction-qroc-box-answer');

            assert.ok(answerBlock);
            assert.strictEqual(answerBlock.value, EMPTY_DEFAULT_MESSAGE);
            assert.dom('.correction-qroc-box-answer--aband').exists();
          });
        });
      });
    }
  );

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
          hbs`<QrocSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
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
          hbs`<QrocSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
        );

        // Then
        assert.dom('.comparison-window-solution').exists();
        assert.ok(find('.comparison-window-solution__text').textContent.includes(solution));
      });
    });
  });

  module('when user has answerd correctly', function () {
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
          hbs`<QrocSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
        );

        // Then
        assert.dom('.comparison-window-solution').doesNotExist();
      });
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
        hbs`<QrocSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
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
        hbs`<QrocSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
      );

      // Then
      assert.dom('.correction-qroc-box').exists();
      assert.dom('.comparison-window-solution').exists();
      assert.ok(find('.comparison-window-solution__text').textContent.includes(solutionToDisplay));
    });
  });
});
