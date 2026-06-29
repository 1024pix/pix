import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
// eslint-disable-next-line no-restricted-imports
import { find, findAll } from '@ember/test-helpers';
import QcuSolutionPanel from 'mon-pix/components/solution-panel/qcu-solution-panel';
import { pshuffle } from 'mon-pix/utils/pshuffle';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

const assessmentId = 64;
const assessment = {
  get(key) {
    if (key === 'id') {
      return assessmentId;
    }
  },
};
let challenge = null;
let answer = null;
let solution = null;
let solutionToDisplay = null;
let solutionAsText = null;

module('Integration | Component | qcu-solution-panel.js', function (hooks) {
  setupIntlRenderingTest(hooks);

  const correctAnswer = {
    id: 'answer_id',
    assessment,
    challenge,
    value: '2',
  };

  const unCorrectAnswer = {
    id: 'answer_id',
    assessment,
    challenge,
    value: '3',
  };

  module('Radio state', function (hooks) {
    hooks.before(function () {
      challenge = EmberObject.create({
        id: 'challenge_id',
        proposals: '-foo\n- bar\n- qix\n- yon',
        type: 'QCU',
      });

      solution = '2';

      solutionToDisplay = 'La réponse est 2';

      answer = {
        id: 'answer_id',
        assessment,
        challenge,
        value: '2',
      };
    });

    test('Should display only user answer', async function (assert) {
      // Given
      const answerArg = answer;
      const solutionArg = solution;
      const solutionToDisplayArg = null;
      const challengeArg = challenge;

      // When
      await render(
        <template>
          <QcuSolutionPanel
            @answer={{answerArg}}
            @challenge={{challengeArg}}
            @solution={{solutionArg}}
            @solutionToDisplay={{solutionToDisplayArg}}
          />
        </template>,
      );

      // Then
      assert.strictEqual(findAll('[data-goodness=good]').length, 1);
    });
  });

  module('When answer is correct', function (hooks) {
    hooks.before(function () {
      challenge = EmberObject.create({
        id: 'challenge_id',
        proposals: '-foo\n- bar\n- qix\n- yon',
        type: 'QCU',
      });

      solution = '2';
    });

    test('should inform that the answer is correct', async function (assert) {
      //Given
      const answerArg = correctAnswer;
      const solutionArg = solution;
      const solutionToDisplayArg = null;
      const challengeArg = challenge;

      // When
      await render(
        <template>
          <QcuSolutionPanel
            @answer={{answerArg}}
            @challenge={{challengeArg}}
            @solution={{solutionArg}}
            @solutionToDisplay={{solutionToDisplayArg}}
          />
        </template>,
      );

      // Then
      assert.dom('div[data-test-correct-answer]').exists();
    });
  });

  module('When answer is wrong', function (hooks) {
    hooks.before(function () {
      challenge = EmberObject.create({
        id: 'challenge_id',
        proposals: '-foo\n- bar\n- qix\n- yon',
        type: 'QCU',
      });

      solution = '2';
      solutionAsText = 'bar';
    });

    test('should inform that the answer is wrong', async function (assert) {
      //Given
      const answerArg = unCorrectAnswer;
      const solutionArg = solution;
      const solutionToDisplayArg = null;
      const challengeArg = challenge;

      // When
      await render(
        <template>
          <QcuSolutionPanel
            @answer={{answerArg}}
            @challenge={{challengeArg}}
            @solution={{solutionArg}}
            @solutionToDisplay={{solutionToDisplayArg}}
          />
        </template>,
      );

      // Then
      assert.dom('.qcu-solution-answer-feedback__expected-answer').exists();
    });

    test('should inform the user of the correct answer', async function (assert) {
      // Given
      const answerArg = unCorrectAnswer;
      const solutionArg = solution;
      const solutionToDisplayArg = null;
      const challengeArg = challenge;

      // When
      await render(
        <template>
          <QcuSolutionPanel
            @answer={{answerArg}}
            @challenge={{challengeArg}}
            @solution={{solutionArg}}
            @solutionToDisplay={{solutionToDisplayArg}}
          />
        </template>,
      );

      // Then
      const correctAnswer = find('.qcu-solution-answer-feedback__expected-answer');
      assert.ok(correctAnswer);
      assert.strictEqual(correctAnswer.innerText, 'Réponse incorrecte.\nLa bonne réponse est : ' + solutionAsText);
    });

    test('should inform the user of the correct answer with solution to display when it is not null', async function (assert) {
      // Given
      const answerArg = unCorrectAnswer;
      const solutionArg = solution;
      const solutionToDisplayArg = solutionToDisplay;
      const challengeArg = challenge;

      // When
      await render(
        <template>
          <QcuSolutionPanel
            @answer={{answerArg}}
            @challenge={{challengeArg}}
            @solution={{solutionArg}}
            @solutionToDisplay={{solutionToDisplayArg}}
          />
        </template>,
      );

      // Then
      const correctAnswer = find('.qcu-solution-answer-feedback__expected-answer');
      assert.ok(correctAnswer);
      assert.strictEqual(correctAnswer.innerText, 'Réponse incorrecte.\nLa bonne réponse est : ' + solutionToDisplay);
    });
  });

  module('All Radio states', function (hooks) {
    hooks.before(function () {
      challenge = EmberObject.create({
        id: 'challenge_id',
        proposals: '-foo\n- bar\n- qix\n- yon',
        type: 'QCM',
      });

      solution = '2';

      answer = EmberObject.create(correctAnswer);
    });

    test('QCU, correct answer is checked', async function (assert) {
      //Given
      const answerArg = answer;
      const solutionArg = solution;
      const solutionToDisplayArg = null;
      const challengeArg = challenge;
      // When
      await render(
        <template>
          <QcuSolutionPanel
            @answer={{answerArg}}
            @challenge={{challengeArg}}
            @solution={{solutionArg}}
            @solutionToDisplay={{solutionToDisplayArg}}
          />
        </template>,
      );

      // Then
      assert.strictEqual(findAll('.qcu-solution-panel__proposition')[1].getAttribute('data-checked'), 'yes');
      assert.strictEqual(findAll('.qcu-solution-panel__proposition')[1].getAttribute('data-goodness'), 'good');
      assert.ok(findAll('.qcu-solution-panel__radio-button')[1].innerHTML.includes('Votre réponse'));
    });

    test('QCU, correct answer is not checked', async function (assert) {
      //Given
      answer = EmberObject.create(unCorrectAnswer);

      const answerArg = answer;
      const solutionArg = solution;
      const solutionToDisplayArg = null;
      const challengeArg = challenge;

      // When
      await render(
        <template>
          <QcuSolutionPanel
            @answer={{answerArg}}
            @challenge={{challengeArg}}
            @solution={{solutionArg}}
            @solutionToDisplay={{solutionToDisplayArg}}
          />
        </template>,
      );

      // Then
      assert.strictEqual(findAll('.qcu-solution-panel__proposition')[1].getAttribute('data-checked'), 'no');
      assert.strictEqual(findAll('.qcu-solution-panel__proposition')[1].getAttribute('data-goodness'), 'good');
      assert.ok(findAll('.qcu-solution-panel__radio-button')[1].innerHTML.includes('Autre proposition'));
    });

    test('QCU, incorrect answer is not checked', async function (assert) {
      //Given
      const answerArg = answer;
      const solutionArg = solution;
      const solutionToDisplayArg = null;
      const challengeArg = challenge;

      // When
      await render(
        <template>
          <QcuSolutionPanel
            @answer={{answerArg}}
            @challenge={{challengeArg}}
            @solution={{solutionArg}}
            @solutionToDisplay={{solutionToDisplayArg}}
          />
        </template>,
      );

      // Then
      assert.strictEqual(findAll('.qcu-solution-panel__proposition')[0].getAttribute('data-checked'), 'no');
      assert.strictEqual(findAll('.qcu-solution-panel__proposition')[0].getAttribute('data-goodness'), 'bad');
      assert.ok(findAll('.qcu-solution-panel__radio-button')[0].innerHTML.includes('Autre proposition'));
    });

    test('QCU, incorrect answer is checked', async function (assert) {
      //Given
      answer = EmberObject.create(unCorrectAnswer);

      const answerArg = answer;
      const solutionArg = solution;
      const solutionToDisplayArg = null;
      const challengeArg = challenge;

      // When
      await render(
        <template>
          <QcuSolutionPanel
            @answer={{answerArg}}
            @challenge={{challengeArg}}
            @solution={{solutionArg}}
            @solutionToDisplay={{solutionToDisplayArg}}
          />
        </template>,
      );

      // Then
      assert.strictEqual(findAll('.qcu-solution-panel__proposition')[2].getAttribute('data-checked'), 'yes');
      assert.strictEqual(findAll('.qcu-solution-panel__proposition')[2].getAttribute('data-goodness'), 'bad');
      assert.ok(findAll('.qcu-solution-panel__radio-button')[2].innerHTML.includes('Votre réponse'));
    });

    module('when proposals are shuffled', function () {
      test('should shuffle the answers', async function (assert) {
        // Given
        answer = EmberObject.create(correctAnswer);
        challenge.shuffled = true;
        const answerArg = answer;
        const solutionArg = solution;
        const solutionToDisplayArg = null;
        const challengeArg = challenge;

        const expectedAnswers = ['foo', 'bar', 'qix', 'yon'];

        pshuffle(expectedAnswers, assessmentId);

        // When
        await render(
          <template>
            <QcuSolutionPanel
              @answer={{answerArg}}
              @challenge={{challengeArg}}
              @solution={{solutionArg}}
              @solutionToDisplay={{solutionToDisplayArg}}
            />
          </template>,
        );

        // Then
        const actualAnswers = findAll('.qcu-solution-panel__proposition');
        assert.strictEqual(actualAnswers[0].textContent.trim(), expectedAnswers[0]);
        assert.strictEqual(actualAnswers[1].textContent.trim(), expectedAnswers[1]);
        assert.strictEqual(actualAnswers[2].textContent.trim(), expectedAnswers[2]);
        assert.strictEqual(actualAnswers[3].textContent.trim(), expectedAnswers[3]);
      });
    });
  });
});
