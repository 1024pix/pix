import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const ANSWER = '.correction-qrocm__answer';
const INPUT = 'input.correction-qrocm__answer--input';
const PARAGRAPH = 'textarea.correction-qrocm__answer--paragraph';
const SENTENCE = 'input.correction-qrocm__answer--sentence';
const SOLUTION_BLOCK = '.correction-qrocm__solution';
const SOLUTION_TEXT = '.correction-qrocm__solution-text';

const NO_ANSWER_POSITION = 0;
const WRONG_ANSWER_POSITION = 1;
const CORRECT_ANSWER_POSITION = 2;

module('Integration | Component | QROCm ind solution panel', function (hooks) {
  setupIntlRenderingTest(hooks);

  const assessment = EmberObject.create({ id: 'assessment_id' });
  const challenge = EmberObject.create({
    id: 'challenge_id',
    proposals: '**blabla** : ${key1}\nCarte mémoire (SD) : ${key2}\nanswer : ${key3}',
    format: 'petit',
  });
  const answer = EmberObject.create({
    id: 'answer_id',
    value: "key1: '' key2: 'wrongAnswer2' key3: 'rightAnswer3'",
    resultDetails: 'key1: false\nkey2: false\nkey3: true',
    assessment,
    challenge,
  });
  const solution = 'key1:\n- rightAnswer1\n' + 'key2:\n- rightAnswer20\n- rightAnswer21\n' + 'key3 :\n- rightAnswer3';

  [{ format: 'petit' }, { format: 'phrase' }, { format: 'paragraphe' }, { format: 'unreferenced_format' }].forEach(
    (data) => {
      module(`Whatever the format (testing "${data.format}" format)`, function (hooks) {
        hooks.beforeEach(async function () {
          // given
          this.set('answer', answer);
          this.set('solution', solution);
          this.set('challenge', challenge);
          this.challenge.set('format', data.format);

          // when
          await render(hbs`<QrocmIndSolutionPanel
          @answer={{this.answer}}
          @solution={{this.solution}}
          @challenge={{this.challenge}} />`);
        });

        test('should dqrocm-ind-solution-panel-test.jsisplay the labels', function (assert) {
          const labels = findAll('.correction-qrocm-text__label');

          assert.strictEqual(labels.length, 3);
        });

        module('When the answer is correct', function () {
          test('should display the correct answer in green bold', async function (assert) {
            // then
            const correctAnswerText = findAll(ANSWER)[CORRECT_ANSWER_POSITION];
            assert.true(correctAnswerText.classList.contains('correction-qroc-box-answer--correct'));
          });

          test('should not display the solution block', async function (assert) {
            // then
            const solutionBlockList = findAll(SOLUTION_BLOCK);
            const correctSolutionBlock = solutionBlockList[CORRECT_ANSWER_POSITION];

            assert.notOk(correctSolutionBlock);
            assert.strictEqual(solutionBlockList.length, 2);
          });
        });

        module('When there is no answer', function () {
          const EMPTY_DEFAULT_MESSAGE = 'Pas de réponse';

          test('should display one solution in bold green', async function (assert) {
            // then
            const noAnswerSolutionBlock = findAll(SOLUTION_BLOCK)[NO_ANSWER_POSITION];
            const noAnswerSolutionText = findAll(SOLUTION_TEXT)[NO_ANSWER_POSITION];

            assert.ok(noAnswerSolutionBlock);
            assert.ok(noAnswerSolutionText);
          });

          test('should display the empty answer with the default message "Pas de réponse" in italic', async function (assert) {
            // then
            const answerInput = findAll(ANSWER)[NO_ANSWER_POSITION];

            assert.ok(answerInput);
            assert.strictEqual(answerInput.value, EMPTY_DEFAULT_MESSAGE);
            assert.true(answerInput.classList.contains('correction-qroc-box-answer--aband'));
          });
        });

        module('When the answer is wrong', function () {
          test('should display one solution in bold green', async function (assert) {
            // then
            const wrongSolutionBlock = findAll(SOLUTION_BLOCK)[WRONG_ANSWER_POSITION];
            const wrongSolutionText = findAll(SOLUTION_TEXT)[WRONG_ANSWER_POSITION];

            assert.ok(wrongSolutionBlock);
            assert.ok(wrongSolutionText);
          });

          test('should display the solutionToDisplay if exist', async function (assert) {
            // when
            const solutionToDisplay = 'Ceci est la solution !';
            this.set('solutionToDisplay', solutionToDisplay);
            await render(
              hbs`<QrocmIndSolutionPanel @challenge={{this.challenge}} @solution={{this.solution}} @answer={{this.answer}} @solutionToDisplay={{this.solutionToDisplay}}/>`
            );

            // then
            assert.dom('.comparison-window-solution').exists();
            assert.ok(find('.comparison-window-solution__text').textContent.includes(solutionToDisplay));
          });

          test('should display the wrong answer in line-throughed bold', async function (assert) {
            // then
            const answerInput = findAll(ANSWER)[WRONG_ANSWER_POSITION];

            assert.ok(answerInput);
            assert.true(answerInput.classList.contains('correction-qroc-box-answer--wrong'));
          });
        });
      });
    }
  );

  module('When format is neither a paragraph nor a phrase', function (hooks) {
    hooks.beforeEach(function () {
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('challenge', challenge);
    });

    test(`should display a disabled input with size based on the length of the value`, async function (assert) {
      //given
      const EMPTY_DEFAULT_MESSAGE = 'Pas de réponse';
      //when
      await render(
        hbs`{{qrocm-ind-solution-panel challenge=this.challenge answer=this.answer solution=this.solution}}`
      );
      //then

      assert.dom(PARAGRAPH).doesNotExist();
      assert.strictEqual(find(INPUT).tagName, 'INPUT');
      assert.strictEqual(find(INPUT).value, EMPTY_DEFAULT_MESSAGE);
      assert.strictEqual(find(INPUT).getAttribute('size'), EMPTY_DEFAULT_MESSAGE.length.toString());
      assert.true(find(INPUT).hasAttribute('disabled'));
    });
  });

  module('When format is a paragraph', function (hooks) {
    hooks.beforeEach(function () {
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('challenge', challenge);
      this.challenge.set('format', 'paragraphe');
    });

    test('should display a disabled textarea', async function (assert) {
      // when
      await render(
        hbs`{{qrocm-ind-solution-panel answer=this.answer solution=this.solution challenge=this.challenge}}`
      );

      // then
      assert.dom(INPUT).doesNotExist();
      assert.dom(SENTENCE).doesNotExist();
      assert.strictEqual(find(PARAGRAPH).tagName, 'TEXTAREA');
      assert.true(find(PARAGRAPH).hasAttribute('disabled'));
    });
  });

  module('When format is a sentence', function (hooks) {
    hooks.beforeEach(function () {
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('challenge', challenge);
      this.challenge.set('format', 'phrase');
    });

    test('should display a disabled input', async function (assert) {
      // when
      await render(
        hbs`{{qrocm-ind-solution-panel answer=this.answer solution=this.solution challenge=this.challenge}}`
      );

      // then
      assert.dom(INPUT).doesNotExist();
      assert.dom(PARAGRAPH).doesNotExist();
      assert.strictEqual(find(SENTENCE).tagName, 'INPUT');
      assert.true(find(SENTENCE).hasAttribute('disabled'));
    });
  });
});
