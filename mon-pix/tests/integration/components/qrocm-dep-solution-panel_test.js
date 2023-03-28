import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const ANSWER = '.correction-qrocm__answer';
const INPUT = 'input.correction-qrocm__answer--input';
const PARAGRAPH = 'textarea.correction-qrocm__answer--paragraph';
const SENTENCE = 'input.correction-qrocm__answer--sentence';
const SOLUTION_BLOCK = '.comparison-window-solution';
const SOLUTION_TEXT = '.correction-qrocm__solution-text';

const classByResultKey = {
  ok: 'ok',
  ko: 'ko',
  partially: 'partially',
  aband: 'aband',
};

module('Integration | Component | QROCm dep solution panel', function (hooks) {
  setupIntlRenderingTest(hooks);

  const assessment = EmberObject.create({ id: 'assessment_id' });
  const challenge = EmberObject.create({
    id: 'challenge_id',
    proposals: '${key1}\n${key2}',
    format: 'petit',
  });
  const solution = 'rightAnswer:\n' + '- rightAnswer1\n' + '- rightAnswer2';

  [{ format: 'petit' }, { format: 'phrase' }, { format: 'paragraphe' }, { format: 'unreferenced_format' }].forEach(
    (data) => {
      module(`Whatever the format (testing ${data.format} format)`, function (hooks) {
        hooks.beforeEach(function () {
          this.set('solution', solution);
          this.set('challenge', challenge);
          this.challenge.set('format', data.format);
        });

        module('When the answer is correct', function (hooks) {
          hooks.beforeEach(async function () {
            // given
            const answer = EmberObject.create({
              id: 'answer_id',
              value: "key1: 'rightAnswer1' key2: 'rightAnswer2'",
              result: classByResultKey.ok,
              assessment,
              challenge,
            });
            this.set('answer', answer);

            // when
            await render(
              hbs`<QrocmDepSolutionPanel @challenge={{this.challenge}} @solution={{this.solution}} @answer={{this.answer}} />`
            );
          });

          test('should display the correct answer in green bold', function (assert) {
            // then
            const firstAnswerInput = findAll(ANSWER)[0];
            assert.true(firstAnswerInput.classList.contains('correction-qroc-box-answer--correct'));
          });

          test('should not have solution block', function (assert) {
            // then
            const solutionBlockList = findAll(SOLUTION_BLOCK);

            assert.strictEqual(solutionBlockList.length, 0);
          });
        });

        module('When there is no answer', function (hooks) {
          const EMPTY_DEFAULT_MESSAGE = 'Pas de réponse';

          hooks.beforeEach(async function () {
            // given
            const answer = EmberObject.create({
              id: 'answer_id',
              value: "key1: '' key2: ''",
              result: classByResultKey.aband,
              assessment,
              challenge,
            });
            this.set('answer', answer);

            // when
            await render(
              hbs`<QrocmDepSolutionPanel @challenge={{this.challenge}} @solution={{this.solution}} @answer={{this.answer}} />`
            );
          });

          test('should display one solution in bold green', async function (assert) {
            // then
            const noAnswerSolutionBlockList = findAll(SOLUTION_BLOCK);

            assert.strictEqual(noAnswerSolutionBlockList.length, 1);
          });

          test('should display the empty answer with the default message "Pas de réponse" in italic', async function (assert) {
            // then
            const firstAnswerInput = findAll(ANSWER)[0];
            assert.ok(firstAnswerInput);
            assert.strictEqual(firstAnswerInput.value, EMPTY_DEFAULT_MESSAGE);
            assert.true(firstAnswerInput.classList.contains('correction-qroc-box-answer--aband'));
          });
        });

        module('When the answer is wrong', function (hooks) {
          hooks.beforeEach(async function () {
            // given
            const answer = EmberObject.create({
              id: 'answer_id',
              value: "key1: 'wrongAnswer1' key2: 'wrongAnswer2'",
              result: classByResultKey.ko,
              assessment,
              challenge,
            });
            this.set('answer', answer);
          });

          test('should display one solution in bold green', async function (assert) {
            // when
            await render(
              hbs`<QrocmDepSolutionPanel @challenge={{this.challenge}} @solution={{this.solution}} @answer={{this.answer}} />`
            );

            // then
            const wrongSolutionBlock = find(SOLUTION_BLOCK);
            const wrongSolutionText = find(SOLUTION_TEXT);

            assert.ok(wrongSolutionBlock);
            assert.ok(wrongSolutionText);
          });

          test('should display the solutionToDisplay if exist', async function (assert) {
            // when
            const solutionToDisplay = 'Ceci est la solution !';
            this.set('solutionToDisplay', solutionToDisplay);
            await render(
              hbs`<QrocmDepSolutionPanel @challenge={{this.challenge}} @solution={{this.solution}} @answer={{this.answer}} @solutionToDisplay={{this.solutionToDisplay}}/>`
            );

            // then
            assert.dom(SOLUTION_BLOCK).exists();
            assert.ok(find(SOLUTION_TEXT).textContent.includes(solutionToDisplay));
          });

          test('should display the wrong answer in standard style since we do not handle single wrong answer yet', async function (assert) {
            // when
            await render(
              hbs`<QrocmDepSolutionPanel @challenge={{this.challenge}} @solution={{this.solution}} @answer={{this.answer}} />`
            );

            // then
            const firstAnswerInput = findAll(ANSWER)[0];

            assert.ok(firstAnswerInput);
            assert.false(firstAnswerInput.classList.contains('correction-qroc-box-answer--wrong'));
          });
        });
      });
    }
  );

  module('When format is neither a paragraph nor a sentence', function (hooks) {
    hooks.beforeEach(function () {
      const answer = EmberObject.create({
        id: 'answer_id',
        value: "key1: 'rightAnswer1' key2: 'rightAnswer2'",
        result: classByResultKey.ok,
        assessment,
        challenge,
      });
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('challenge', challenge);
    });

    test(`should display a disabled input with expected size`, async function (assert) {
      //given
      const answerSize = 'rightAnswer1'.length;
      //when
      await render(
        hbs`<QrocmDepSolutionPanel @challenge={{this.challenge}} @solution={{this.solution}} @answer={{this.answer}} />`
      );

      //then
      assert.dom(PARAGRAPH).doesNotExist();
      assert.dom(SENTENCE).doesNotExist();
      assert.strictEqual(find(INPUT).tagName, 'INPUT');
      assert.strictEqual(find(INPUT).getAttribute('size'), answerSize.toString());
      assert.true(find(INPUT).hasAttribute('disabled'));
    });
  });

  module('When format is a paragraph', function (hooks) {
    hooks.beforeEach(function () {
      const answer = EmberObject.create({
        id: 'answer_id',
        value: "key1: 'rightAnswer1' key2: 'rightAnswer2'",
        result: classByResultKey.ok,
        assessment,
        challenge,
      });
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('challenge', challenge);
      this.challenge.set('format', 'paragraphe');
    });

    test('should display a disabled textarea', async function (assert) {
      // when
      await render(
        hbs`{{qrocm-dep-solution-panel answer=this.answer solution=this.solution challenge=this.challenge}}`
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
      const answer = EmberObject.create({
        id: 'answer_id',
        value: "key1: 'rightAnswer1' key2: 'rightAnswer2'",
        result: classByResultKey.ok,
        assessment,
        challenge,
      });
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('challenge', challenge);
      this.challenge.set('format', 'phrase');
    });

    test('should display a disabled input', async function (assert) {
      // when
      await render(
        hbs`{{qrocm-dep-solution-panel answer=this.answer solution=this.solution challenge=this.challenge}}`
      );

      // then
      assert.dom(INPUT).doesNotExist();
      assert.dom(PARAGRAPH).doesNotExist();
      assert.strictEqual(find(SENTENCE).tagName, 'INPUT');
      assert.true(find(SENTENCE).hasAttribute('disabled'));
    });
  });
});
