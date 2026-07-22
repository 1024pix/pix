import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
// eslint-disable-next-line no-restricted-imports
import { find, findAll } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import QrocmDepSolutionPanel from 'mon-pix/components/solution-panel/qrocm-dep-solution-panel';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

const ANSWER = '.correction-qrocm__answer';
const INPUT = 'input.correction-qrocm-answer__input';
const PARAGRAPH = 'textarea.correction-qrocm-answer__input-paragraph';
const SENTENCE = 'input.correction-qrocm-answer__input-sentence';
const SOLUTION_BLOCK = '.comparison-window-solution';
const SOLUTION_TEXT = '.correction-qrocm__solution-text';
const CORRECTION_UNDER_INPUT_BLOCK = '.correction-qrocm__solution';

const EMPTY_DEFAULT_MESSAGE = 'Pas de réponse';
const SOLUTION_TO_DISPLAY = 'La solution à afficher';

const FORMATS = [
  { format: 'petit', input: INPUT },
  { format: 'phrase', input: SENTENCE },
  { format: 'paragraphe', input: PARAGRAPH },
  { format: 'unreferenced_format', input: INPUT },
];

const SKIPPED_VALUE = '#ABAND#';
const CHALLENGE_OK_FLAG = 'ok';
const CHALLENGE_KO_FLAG = 'ko';
const CHALLENGE_SKIPPED_FLAG = 'aband';

const buildComponentArguments = (
  format = FORMATS[0].format,
  challengeStatus = CHALLENGE_OK_FLAG,
  moreSolutionsThanProposals = true,
  hasSolutionToDisplay = false,
) => {
  return {
    solution: moreSolutionsThanProposals
      ? 'p1:\n- solution1\np2:\n- solution2\np3:\n- solution3\np4:\n- solution1\np5:\n- solution2\np6:\n- solution3'
      : 'p1:\n- solution1\np2:\n- solution2',
    answer: EmberObject.create({
      id: 'answer_id',
      value: challengeStatus === CHALLENGE_SKIPPED_FLAG ? SKIPPED_VALUE : "key1: 'rightAnswer1'\nkey2: 'rightAnswer2'",
      result: challengeStatus,
      assessment: EmberObject.create({ id: 'assessment_id' }),
    }),
    answersEvaluation: challengeStatus === CHALLENGE_OK_FLAG ? [true, true] : [true, false],
    solutionsWithoutGoodAnswers: challengeStatus === CHALLENGE_OK_FLAG ? [] : ['solution1', 'solution2'],
    solutionToDisplay: hasSolutionToDisplay ? SOLUTION_TO_DISPLAY : null,
    challenge: EmberObject.create({
      id: 'challenge_id',
      proposals: '${key1}\n${key2}',
      format,
    }),
  };
};

module('Integration | Component | QROCm dep solution panel', function (hooks) {
  setupIntlRenderingTest(hooks);

  const state = {};

  const renderComponent = () =>
    render(
      <template>
        <QrocmDepSolutionPanel
          @challenge={{state.challenge}}
          @solution={{state.solution}}
          @answer={{state.answer}}
          @answersEvaluation={{state.answersEvaluation}}
          @solutionsWithoutGoodAnswers={{state.solutionsWithoutGoodAnswers}}
          @solutionToDisplay={{state.solutionToDisplay}}
        />
      </template>,
    );

  FORMATS.forEach(({ format, input }) => {
    module(`When challenge is "${format}" format`, function () {
      module('When challenge is successful', function (hooks) {
        hooks.beforeEach(async function () {
          // Given
          Object.assign(state, buildComponentArguments(format, CHALLENGE_OK_FLAG));
          // When
          await renderComponent();
        });
        test('should display the correct answer in green bold', async function (assert) {
          // Then
          const firstAnswerInput = findAll(ANSWER)[0];
          assert.true(firstAnswerInput.classList.contains('correction-qroc-box-answer--correct'));

          const secondAnswerInput = findAll(ANSWER)[1];
          assert.true(secondAnswerInput.classList.contains('correction-qroc-box-answer--correct'));
        });
        test('should not have solution block', function (assert) {
          // Then
          const solutionBlockList = findAll(SOLUTION_BLOCK);
          assert.strictEqual(solutionBlockList.length, 0);
        });
      });
      module('When challenge is skipped', function () {
        test('should display the solutionToDisplay if exist', async function (assert) {
          // Given
          Object.assign(state, buildComponentArguments(format, CHALLENGE_SKIPPED_FLAG, true, true));
          // When
          await renderComponent();
          // Then
          assert.dom(SOLUTION_BLOCK).exists();
          assert.ok(find(SOLUTION_TEXT).textContent.includes(SOLUTION_TO_DISPLAY));
        });
        module('When there are more solution than proposals', function (hooks) {
          hooks.beforeEach(async function () {
            // Given
            Object.assign(state, buildComponentArguments(format, CHALLENGE_SKIPPED_FLAG, true));
            // When
            await renderComponent();
          });
          test('should display message at the bottom', async function (assert) {
            // Then
            const noAnswerSolutionBlockList = findAll(SOLUTION_BLOCK);
            assert.strictEqual(noAnswerSolutionBlockList.length, 1);
          });
          test('should display the formatted examples of good answers at the bottom', async function (assert) {
            // Then
            assert.ok(find(SOLUTION_TEXT).textContent.includes('solution1 ou solution2 ou...'));
          });
          test('should display the empty answer with the default message "Pas de réponse" in italic', async function (assert) {
            // Then
            const firstAnswerInputContainer = findAll(ANSWER)[0];
            const firstAnswerInput = findAll(input)[0];
            assert.ok(firstAnswerInput);
            assert.strictEqual(firstAnswerInput.value, EMPTY_DEFAULT_MESSAGE);
            assert.true(firstAnswerInputContainer.classList.contains('correction-qroc-box-answer--aband'));
          });
          test('should set the "skipped" aria-label on the empty answer input', async function (assert) {
            // Then
            const firstAnswerInput = findAll(input)[0];
            assert.strictEqual(
              firstAnswerInput.getAttribute('aria-label'),
              t('pages.comparison-window.results.a11y.skipped-answer'),
            );
          });
        });
        module('When there are as many solutions as proposals', function (hooks) {
          hooks.beforeEach(async function () {
            // Given
            Object.assign(state, buildComponentArguments(format, CHALLENGE_SKIPPED_FLAG, false));
            // When
            await renderComponent();
          });
          test('should display corrections under inputs', async function (assert) {
            // Then
            const correctionUnderInputBlock = findAll(CORRECTION_UNDER_INPUT_BLOCK);
            assert.strictEqual(correctionUnderInputBlock.length, 1);
          });
          test('should not display correction at the bottom', async function (assert) {
            // Then
            const solutionBlocks = findAll(SOLUTION_BLOCK);
            assert.strictEqual(solutionBlocks.length, 0);
          });
        });
      });
      module('When challenge is failed', function () {
        test('should display the solutionToDisplay if exist', async function (assert) {
          // Given
          Object.assign(state, buildComponentArguments(format, CHALLENGE_KO_FLAG, true, true));
          // When
          await renderComponent();
          // Then
          assert.dom(SOLUTION_BLOCK).exists();
          assert.ok(find(SOLUTION_TEXT).textContent.includes(SOLUTION_TO_DISPLAY));
        });
        module('When there are more solution than proposals', function (hooks) {
          hooks.beforeEach(async function () {
            // Given
            Object.assign(state, buildComponentArguments(format, CHALLENGE_KO_FLAG, true));
            // When
            await renderComponent();
          });
          test('should display the good answer input in bold green', async function (assert) {
            // Then
            const firstAnswerInput = findAll(ANSWER)[0];
            assert.ok(firstAnswerInput);
            assert.true(firstAnswerInput.classList.contains('correction-qroc-box-answer--correct'));
          });
          test('should strike the second answer input', async function (assert) {
            // Then
            const secondAnswerInput = findAll(ANSWER)[1];
            assert.ok(secondAnswerInput);
            assert.true(secondAnswerInput.classList.contains('correction-qroc-box-answer--wrong'));
          });
          test('should set the "good-answer" and "wrong-answer" aria-labels on the inputs', async function (assert) {
            // Then
            const inputs = findAll(input);
            assert.strictEqual(
              inputs[0].getAttribute('aria-label'),
              t('pages.comparison-window.results.a11y.good-answer'),
            );
            assert.strictEqual(
              inputs[1].getAttribute('aria-label'),
              t('pages.comparison-window.results.a11y.wrong-answer'),
            );
          });
          test('should display correction at the bottom', async function (assert) {
            // Then
            const secondAnswerInput = findAll(ANSWER)[1];
            assert.ok(secondAnswerInput);
            assert.true(secondAnswerInput.classList.contains('correction-qroc-box-answer--wrong'));
          });
        });
        module('When there are as many solutions as proposals', function (hooks) {
          hooks.beforeEach(async function () {
            // Given
            Object.assign(state, buildComponentArguments(format, CHALLENGE_KO_FLAG, false));
            // When
            await renderComponent();
          });
          test('should display corrections under inputs', async function (assert) {
            // Then
            const correctionUnderInputBlock = findAll(CORRECTION_UNDER_INPUT_BLOCK);
            assert.strictEqual(correctionUnderInputBlock.length, 1);
          });
          test('should not display correction at the bottom', async function (assert) {
            // Then
            const solutionBlocks = findAll(SOLUTION_BLOCK);
            assert.strictEqual(solutionBlocks.length, 0);
          });
        });
      });
    });
  });
  module('When format is a paragraph', function () {
    test('should display a disabled textarea', async function (assert) {
      // Given
      Object.assign(state, buildComponentArguments(FORMATS[2].format));
      // When
      await renderComponent();
      // Then
      assert.dom(INPUT).doesNotExist();
      assert.dom(SENTENCE).doesNotExist();
      assert.strictEqual(find(PARAGRAPH).tagName, 'TEXTAREA');
      assert.strictEqual(find(PARAGRAPH).getAttribute('aria-label'), 'La réponse donnée est valide');
      assert.true(find(PARAGRAPH).hasAttribute('disabled'));
    });
  });

  module('When format is a sentence', function () {
    test('should display a disabled input', async function (assert) {
      // Given
      Object.assign(state, buildComponentArguments(FORMATS[1].format));
      // When
      await renderComponent();
      // Then
      assert.dom(INPUT).doesNotExist();
      assert.dom(PARAGRAPH).doesNotExist();
      assert.strictEqual(find(SENTENCE).tagName, 'INPUT');
      assert.strictEqual(find(SENTENCE).getAttribute('aria-label'), 'La réponse donnée est valide');
      assert.true(find(SENTENCE).hasAttribute('disabled'));
    });
  });

  module('When format is neither a paragraph nor a sentence', function () {
    test(`should display a disabled input with expected size`, async function (assert) {
      // Given
      Object.assign(state, buildComponentArguments(FORMATS[3].format));
      // When
      await renderComponent();
      // Then
      assert.dom(PARAGRAPH).doesNotExist();
      assert.dom(SENTENCE).doesNotExist();
      assert.strictEqual(find(INPUT).tagName, 'INPUT');
      assert.strictEqual(find(INPUT).getAttribute('size'), '13');
      assert.strictEqual(find(INPUT).getAttribute('aria-label'), 'La réponse donnée est valide');
      assert.true(find(INPUT).hasAttribute('disabled'));
    });
  });

  module('When solutions are numbers and challenge skipped', function (hooks) {
    hooks.beforeEach(function () {
      state.solution = 'el1:\n- 2\nel2:\n- 3';
      state.solutionsWithoutGoodAnswers = [];
      state.answer = EmberObject.create({
        id: 'answer_id',
        value: SKIPPED_VALUE,
        result: CHALLENGE_SKIPPED_FLAG,
        assessment: EmberObject.create({ id: 'assessment_id' }),
      });
      state.challenge = EmberObject.create({
        id: 'challengeId',
        proposals: 'Numéros des éléments : ${el1 options=["1", "2", "3"]} ${el2 options=["1", "2", "3"]}',
        format: FORMATS[0].format,
      });
      state.answersEvaluation = [false, false];
      state.solutionToDisplay = null;
    });

    test('it should display solution panel', async function (assert) {
      // when
      const screen = await renderComponent();
      // then
      assert.dom(screen.getByText('Numéros des éléments :')).exists();
    });
  });
});
