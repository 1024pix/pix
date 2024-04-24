import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import setupIntl from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';

module('Unit | Component | solution-panel/qrocm-dep-solution-panel', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#blocks', function () {
    test('should return expected array when the challenge is successful', function (assert) {
      //Given
      const challenge = EmberObject.create({
        proposals: 'content : ${challengeInput1}\n\ntriste : ${challengeInput2}',
      });
      const answer = {
        value: "challengeInput1: 'good answer value 1' challengeInput2: 'good answer value 2'",
        result: 'ko',
      };
      const answersEvaluation = [true, true];
      const component = createGlimmerComponent('solution-panel/qrocm-dep-solution-panel', {
        challenge,
        answer,
        answersEvaluation,
      });
      const expectedBlocksData = [
        {
          input: 'challengeInput1',
          text: 'content : ',
          ariaLabel: 'La réponse donnée est valide',
          autoAriaLabel: false,
          inputClass: 'correction-qroc-box-answer--correct',
          answer: 'good answer value 1',
          placeholder: null,
          type: 'input',
          defaultValue: null,
        },
        {
          input: 'challengeInput2',
          text: '<br/><br/>triste : ',
          answer: 'good answer value 2',
          ariaLabel: 'La réponse donnée est valide',
          autoAriaLabel: false,
          inputClass: 'correction-qroc-box-answer--correct',
          placeholder: null,
          type: 'input',
          defaultValue: null,
        },
      ];

      //When
      const blocks = component.blocks;

      //Then
      assert.deepEqual(blocks, expectedBlocksData);
    });

    test('should return expected array when the challenge is skipped', function (assert) {
      //Given
      const challenge = EmberObject.create({
        proposals: 'content : ${skippedChallengeInput1}\n\ntriste : ${skippedChallengeInput2}',
      });
      const answer = {
        value: '#ABAND#',
        result: 'ko',
      };
      const answersEvaluation = [];
      const solutionsWithoutGoodAnswers = [];
      const component = createGlimmerComponent('solution-panel/qrocm-dep-solution-panel', {
        challenge,
        answer,
        answersEvaluation,
        solutionsWithoutGoodAnswers,
      });

      const expectedBlocksData = [
        {
          answer: 'Pas de réponse',
          ariaLabel: 'Question passée',
          autoAriaLabel: false,
          defaultValue: null,
          input: 'skippedChallengeInput1',
          inputClass: 'correction-qroc-box-answer--aband',
          placeholder: null,
          text: 'content : ',
          type: 'input',
        },
        {
          answer: 'Pas de réponse',
          ariaLabel: 'Question passée',
          autoAriaLabel: false,
          defaultValue: null,
          input: 'skippedChallengeInput2',
          inputClass: 'correction-qroc-box-answer--aband',
          placeholder: null,
          text: '<br/><br/>triste : ',
          type: 'input',
        },
      ];

      //When
      const blocks = component.blocks;

      //Then
      assert.deepEqual(blocks, expectedBlocksData);
    });

    test('should return expected array when the challenge is failed', function (assert) {
      //Given
      const challenge = EmberObject.create({
        proposals: 'content : ${challengeInput1}\n\ntriste : ${challengeInput2}',
      });
      const answer = {
        value: "challengeInput1: 'good answer' challengeInput2: 'wrong answer'",
        result: 'ko',
      };
      const answersEvaluation = [true, false];
      const component = createGlimmerComponent('solution-panel/qrocm-dep-solution-panel', {
        challenge,
        answer,
        answersEvaluation,
      });
      const expectedBlocksData = [
        {
          input: 'challengeInput1',
          text: 'content : ',
          ariaLabel: 'La réponse donnée est valide',
          autoAriaLabel: false,
          inputClass: 'correction-qroc-box-answer--correct',
          answer: 'good answer',
          placeholder: null,
          type: 'input',
          defaultValue: null,
        },
        {
          input: 'challengeInput2',
          text: '<br/><br/>triste : ',
          answer: 'wrong answer',
          ariaLabel: 'La réponse donnée est fausse',
          autoAriaLabel: false,
          inputClass: 'correction-qroc-box-answer--wrong',
          placeholder: null,
          type: 'input',
          defaultValue: null,
        },
      ];

      //When
      const blocks = component.blocks;

      //Then
      assert.deepEqual(blocks, expectedBlocksData);
    });
  });

  module('#getInputClass', function () {
    test('should return "aband" css class when isAnswerEmpty param is true', function (assert) {
      //Given
      const component = createGlimmerComponent('solution-panel/qrocm-dep-solution-panel');

      //When
      const inputClass = component.getInputClass(true);

      //Then
      assert.deepEqual(inputClass, 'correction-qroc-box-answer--aband');
    });

    test('should return "correct" css class when isAnswerEmpty param is false and isCorrectAnswer is true', function (assert) {
      //Given
      const component = createGlimmerComponent('solution-panel/qrocm-dep-solution-panel');

      //When
      const inputClass = component.getInputClass(false, true);

      //Then
      assert.deepEqual(inputClass, 'correction-qroc-box-answer--correct');
    });

    test('should return "wrong" css class when isAnswerEmpty param is false and isCorrectAnswer is false', function (assert) {
      //Given
      const component = createGlimmerComponent('solution-panel/qrocm-dep-solution-panel');

      //When
      const inputClass = component.getInputClass(false, false);

      //Then
      assert.deepEqual(inputClass, 'correction-qroc-box-answer--wrong');
    });
  });

  module('#getAriaLabel', function () {
    test('should return specific aria-label when question is skipped', function (assert) {
      //Given
      const component = createGlimmerComponent('solution-panel/qrocm-dep-solution-panel');

      //When
      const ariaLabel = component.getAriaLabel(true);

      //Then
      assert.deepEqual(ariaLabel, 'Question passée');
    });

    test('should return specific aria-label when question answer is ok', function (assert) {
      //Given
      const component = createGlimmerComponent('solution-panel/qrocm-dep-solution-panel');

      //When
      const inputClass = component.getAriaLabel(false, true);

      //Then
      assert.deepEqual(inputClass, 'La réponse donnée est valide');
    });

    test('should return specific aria-label when question answer is ko', function (assert) {
      //Given
      const component = createGlimmerComponent('solution-panel/qrocm-dep-solution-panel');

      //When
      const inputClass = component.getAriaLabel(false, false);

      //Then
      assert.deepEqual(inputClass, 'La réponse donnée est fausse');
    });
  });

  module('#isCorrectAnswer', function () {
    test('should return true', function (assert) {
      //Given
      const component = createGlimmerComponent('solution-panel/qrocm-dep-solution-panel', { answer: { result: 'ok' } });

      //When
      const isCorrectAnswer = component.isCorrectAnswer;

      //Then
      assert.true(isCorrectAnswer);
    });

    test('should return false', function (assert) {
      //Given
      const component = createGlimmerComponent('solution-panel/qrocm-dep-solution-panel', { answer: { result: 'ko' } });

      //When
      const isCorrectAnswer = component.isCorrectAnswer;

      //Then
      assert.false(isCorrectAnswer);
    });
  });

  module('#formattedSolution', function () {
    module('when there are more solutions than inputs', function () {
      test('should return examples of good answers', function (assert) {
        //Given
        const challenge = EmberObject.create({
          proposals: 'content : ${smiley1}\n\ntriste : ${smiley2}',
        });
        const component = createGlimmerComponent('solution-panel/qrocm-dep-solution-panel', {
          challenge,
          answer: { result: 'ko', value: "key1: 'rightAnswer1' key2: 'rightAnswer2'" },
          solutionsWithoutGoodAnswers: ['tag', 'marche', 'masque'],
          solution: 'p1:\n- solution1\np2:\n- solution2\np3:\n- solution3',
        });

        //When
        const formattedSolution = component.formattedSolution;

        //Then
        assert.strictEqual(formattedSolution, 'tag ou marche ou...');
      });
    });

    module('when there are as many text fields as there are solutions', function () {
      test('should return null', function (assert) {
        //Given
        const challenge = EmberObject.create({
          proposals: 'content : ${smiley1}\n\ntriste : ${smiley2}',
        });
        const component = createGlimmerComponent('solution-panel/qrocm-dep-solution-panel', {
          challenge,
          answer: { result: 'ko', value: "key1: 'wrongAnswer1' key2: 'wrongAnswer2'" },
          solutionsWithoutGoodAnswers: ['tag', 'marche'],
          solution: 'p1:\n- solution1\np2:\n- solution2',
        });

        //When
        const formattedSolution = component.formattedSolution;

        //Then
        assert.strictEqual(formattedSolution, null);
      });
    });
  });
});
