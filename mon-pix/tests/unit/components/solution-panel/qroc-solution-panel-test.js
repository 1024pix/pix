import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import setupIntl from '../../../helpers/setup-intl';

module('Unit | Component | solution-panel/qroc-solution-panel', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);
  const rightAnswer = { result: 'ok' };
  const wrongAnswer = { result: 'ko' };
  const skippedAnswer = { result: 'aband' };
  const timedOutAnswer = { result: 'ko', timeout: -1 };

  module('#isNotCorrectlyAnswered', function () {
    test('should return false when result is ok', function (assert) {
      // given
      const component = createGlimmerComponent('solution-panel/qroc-solution-panel', { answer: rightAnswer });
      // when
      const isNotCorrectlyAnswered = component.isNotCorrectlyAnswered;
      // then
      assert.false(isNotCorrectlyAnswered);
    });

    test('should return true when result is not ok', function (assert) {
      // given
      const component = createGlimmerComponent('solution-panel/qroc-solution-panel', { answer: wrongAnswer });
      // when
      const isNotCorrectlyAnswered = component.isNotCorrectlyAnswered;
      // then
      assert.true(isNotCorrectlyAnswered);
    });
  });

  module('#answerToDisplay', function () {
    test('should return "Temps dépassé" if the answer is timed out', function (assert) {
      // given
      const answer = {
        value: '',
        timeout: -1,
      };
      const component = createGlimmerComponent('solution-panel/qroc-solution-panel', { answer });
      // when
      const answerToDisplay = component.answerToDisplay;

      // then
      assert.strictEqual(answerToDisplay, 'Temps dépassé');
    });

    test('should return PAS DE REPONSE if the answer is #ABAND#', function (assert) {
      // given
      const answer = {
        value: '#ABAND#',
      };
      const component = createGlimmerComponent('solution-panel/qroc-solution-panel', { answer });
      // when
      const answerToDisplay = component.answerToDisplay;

      // then
      assert.strictEqual(answerToDisplay, 'Pas de réponse');
    });

    test('should return the answer if the answer is not #ABAND#', function (assert) {
      // given
      const answer = {
        value: 'La Reponse B',
      };
      const component = createGlimmerComponent('solution-panel/qroc-solution-panel', { answer });
      // when
      const answerToDisplay = component.answerToDisplay;

      // then
      assert.strictEqual(answerToDisplay, 'La Reponse B');
    });
  });

  module('#solutionToDisplay', function () {
    test('should return the first solution if the solution has some variants', function (assert) {
      // given
      const solution = 'Reponse\nreponse\nréponse';
      const component = createGlimmerComponent('solution-panel/qroc-solution-panel', { solution });
      // when
      const solutionToDisplay = component.understandableSolution;

      // then
      assert.strictEqual(solutionToDisplay, 'Reponse');
    });

    test('should return the solution', function (assert) {
      // given
      const solution = 'Reponse';
      const component = createGlimmerComponent('solution-panel/qroc-solution-panel', { solution });
      // when
      const solutionToDisplay = component.understandableSolution;

      // then
      assert.strictEqual(solutionToDisplay, 'Reponse');
    });

    test('should return an empty string if the solution is null', function (assert) {
      // given
      const emptySolution = '';
      const component = createGlimmerComponent('solution-panel/qroc-solution-panel', { solution: emptySolution });
      // when
      const solutionToDisplay = component.understandableSolution;

      // then
      assert.strictEqual(solutionToDisplay, '');
    });

    test('should return an empty string if the solution is an empty String', function (assert) {
      // given
      const solutionNull = null;
      const component = createGlimmerComponent('solution-panel/qroc-solution-panel', { solution: solutionNull });
      // when
      const solutionToDisplay = component.understandableSolution;

      // then
      assert.strictEqual(solutionToDisplay, '');
    });
  });

  module('#inputAriaLabel', function () {
    test('should return specific aria label if answer is  ok', function (assert) {
      // given
      const component = createGlimmerComponent('solution-panel/qroc-solution-panel', { answer: rightAnswer });
      // when
      const inputAriaLabel = component.inputAriaLabel;
      // then
      assert.strictEqual(inputAriaLabel, 'La réponse donnée est valide');
    });

    test('should return specific aria label if answer is ko', function (assert) {
      // given
      const component = createGlimmerComponent('solution-panel/qroc-solution-panel', { answer: wrongAnswer });
      // when
      const inputAriaLabel = component.inputAriaLabel;
      // then
      assert.strictEqual(inputAriaLabel, 'La réponse donnée est fausse');
    });

    test('should return specific aria label if answer is skipped', function (assert) {
      // given
      const component = createGlimmerComponent('solution-panel/qroc-solution-panel', { answer: skippedAnswer });
      // when
      const inputAriaLabel = component.inputAriaLabel;
      // then
      assert.strictEqual(inputAriaLabel, 'Question passée');
    });

    test('should return specific aria label if answer is timed out', function (assert) {
      // given
      const component = createGlimmerComponent('solution-panel/qroc-solution-panel', { answer: timedOutAnswer });
      // when
      const inputAriaLabel = component.inputAriaLabel;
      // then
      assert.strictEqual(inputAriaLabel, 'Vous avez dépassé le temps imparti');
    });
  });
});
