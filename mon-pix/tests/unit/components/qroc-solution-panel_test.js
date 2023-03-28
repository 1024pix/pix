import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupIntl from '../../helpers/setup-intl';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | qroc-solution-panel', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);
  const rightAnswer = { result: 'ok' };
  const wrongAnswer = { result: 'ko' };

  module('#isNotCorrectlyAnswered', function () {
    test('should return false when result is ok', function (assert) {
      // given
      const component = createGlimmerComponent('component:qroc-solution-panel', { answer: rightAnswer });
      // when
      const isNotCorrectlyAnswered = component.isNotCorrectlyAnswered;
      // then
      assert.false(isNotCorrectlyAnswered);
    });

    test('should return true when result is not ok', function (assert) {
      // given
      const component = createGlimmerComponent('component:qroc-solution-panel', { answer: wrongAnswer });
      // when
      const isNotCorrectlyAnswered = component.isNotCorrectlyAnswered;
      // then
      assert.true(isNotCorrectlyAnswered);
    });
  });

  module('#answerToDisplay', function () {
    test('should return PAS DE REPONSE if the answer is #ABAND#', function (assert) {
      // given
      const answer = {
        value: '#ABAND#',
      };
      const component = createGlimmerComponent('component:qroc-solution-panel', { answer });
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
      const component = createGlimmerComponent('component:qroc-solution-panel', { answer });
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
      const component = createGlimmerComponent('component:qroc-solution-panel', { solution });
      // when
      const solutionToDisplay = component.understandableSolution;

      // then
      assert.strictEqual(solutionToDisplay, 'Reponse');
    });

    test('should return the solution', function (assert) {
      // given
      const solution = 'Reponse';
      const component = createGlimmerComponent('component:qroc-solution-panel', { solution });
      // when
      const solutionToDisplay = component.understandableSolution;

      // then
      assert.strictEqual(solutionToDisplay, 'Reponse');
    });

    test('should return an empty string if the solution is null', function (assert) {
      // given
      const emptySolution = '';
      const component = createGlimmerComponent('component:qroc-solution-panel', { solution: emptySolution });
      // when
      const solutionToDisplay = component.understandableSolution;

      // then
      assert.strictEqual(solutionToDisplay, '');
    });

    test('should return an empty string if the solution is an empty String', function (assert) {
      // given
      const solutionNull = null;
      const component = createGlimmerComponent('component:qroc-solution-panel', { solution: solutionNull });
      // when
      const solutionToDisplay = component.understandableSolution;

      // then
      assert.strictEqual(solutionToDisplay, '');
    });
  });
});
