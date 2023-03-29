import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupIntl from '../../helpers/setup-intl';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | comparison-window', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let component;
  let answer;
  let resultItem;

  const challengeQroc = EmberObject.create({ type: 'QROC', autoReply: false });
  const challengeQrocWithAutoReply = EmberObject.create({ type: 'QROC', autoReply: true });
  const challengeQcm = EmberObject.create({ type: 'QCM' });
  const challengeQcu = EmberObject.create({ type: 'QCU' });
  const challengeQrocmInd = EmberObject.create({ type: 'QROCM-ind' });
  const challengeQrocmDep = EmberObject.create({ type: 'QROCM-dep' });
  const challengeQrocmDepWithAutoReply = EmberObject.create({ type: 'QROCM-dep', autoReply: true });

  hooks.beforeEach(function () {
    answer = EmberObject.create();
    component = createGlimmerComponent('component:comparison-window', { answer });
  });

  module('#isAssessmentChallengeTypeQroc', function () {
    test('should be true when the challenge is QROC', function (assert) {
      // given
      answer.set('challenge', challengeQroc);
      // when
      const isAssessmentChallengeTypeQroc = component.isAssessmentChallengeTypeQroc;
      // then
      assert.true(isAssessmentChallengeTypeQroc);
    });

    test('should be false when the challenge is not QROCM-ind', function (assert) {
      // given
      answer.set('challenge', challengeQrocmInd);
      // when
      const isAssessmentChallengeTypeQroc = component.isAssessmentChallengeTypeQroc;
      // then
      assert.false(isAssessmentChallengeTypeQroc);
    });
  });

  module('#isAssessmentChallengeTypeQcm', function () {
    test('should be true when the challenge is QCM', function (assert) {
      // given
      answer.set('challenge', challengeQcm);
      // when
      const isAssessmentChallengeTypeQcm = component.isAssessmentChallengeTypeQcm;
      // then
      assert.true(isAssessmentChallengeTypeQcm);
    });

    test('should be false when the challenge is not QCM', function (assert) {
      // given
      answer.set('challenge', challengeQroc);
      // when
      const isAssessmentChallengeTypeQcm = component.isAssessmentChallengeTypeQcm;
      // then
      assert.false(isAssessmentChallengeTypeQcm);
    });
  });

  module('#isAssessmentChallengeTypeQrocmInd', function () {
    test('should be true when the challenge is QROCM-ind', function (assert) {
      // given
      answer.set('challenge', challengeQrocmInd);
      // when
      const isAssessmentChallengeTypeQrocmInd = component.isAssessmentChallengeTypeQrocmInd;
      // then
      assert.true(isAssessmentChallengeTypeQrocmInd);
    });

    test('should be true when the challenge is not QROCM-ind', function (assert) {
      // given
      answer.set('challenge', challengeQroc);
      // when
      const isAssessmentChallengeTypeQrocmInd = component.isAssessmentChallengeTypeQrocmInd;
      // then
      assert.false(isAssessmentChallengeTypeQrocmInd);
    });
  });

  module('#isAssessmentChallengeTypeQrocmDep', function () {
    test('should be true when the challenge is QROCM-dep', function (assert) {
      // given
      answer.set('challenge', challengeQrocmDep);
      // when
      const isAssessmentChallengeTypeQrocmDep = component.isAssessmentChallengeTypeQrocmDep;
      // then
      assert.true(isAssessmentChallengeTypeQrocmDep);
    });

    test('should be true when the challenge is not QROCM-dep', function (assert) {
      // given
      answer.set('challenge', challengeQroc);
      // when
      const isAssessmentChallengeTypeQrocmDep = component.isAssessmentChallengeTypeQrocmDep;
      // then
      assert.false(isAssessmentChallengeTypeQrocmDep);
    });
  });

  module('#resultItem', function (hooks) {
    hooks.beforeEach(function () {
      answer.set('challenge', challengeQcm);
    });

    [
      {
        validationStatus: 'unavailable (i.e. empty)',
        result: '',
        expectedTitle: 'Réponse',
        expectedTooltip: 'Correction automatique en cours de développement ;)',
      },
      {
        validationStatus: 'unknown',
        result: 'xxx',
        expectedTitle: 'Réponse',
        expectedTooltip: 'Correction automatique en cours de développement ;)',
      },
      {
        validationStatus: 'undefined',
        result: undefined,
        expectedTitle: 'Réponse',
        expectedTooltip: 'Correction automatique en cours de développement ;)',
      },
      {
        validationStatus: 'ok',
        result: 'ok',
        expectedTitle: 'Vous avez la bonne réponse !',
        expectedTooltip: 'Réponse correcte',
      },
      {
        validationStatus: 'ko',
        result: 'ko',
        expectedTitle: 'Vous n’avez pas la bonne réponse',
        expectedTooltip: 'Réponse incorrecte',
      },
      {
        validationStatus: 'aband',
        result: 'aband',
        expectedTitle: 'Vous n’avez pas donné de réponse',
        expectedTooltip: 'Sans réponse',
      },
      {
        validationStatus: 'partially',
        result: 'partially',
        expectedTitle: 'Vous avez donné une réponse partielle',
        expectedTooltip: 'Réponse partielle',
      },
      {
        validationStatus: 'timedout',
        result: 'timedout',
        expectedTitle: 'Vous avez dépassé le temps imparti',
        expectedTooltip: 'Temps dépassé',
      },
    ].forEach((data) => {
      test(`should return adapted title and tooltip when validation is ${data.validationStatus}`, function (assert) {
        // given
        answer.set('result', `${data.result}`);

        // when
        resultItem = component.resultItem;

        // then
        assert.strictEqual(this.intl.t(resultItem.title), `${data.expectedTitle}`);
        assert.strictEqual(this.intl.t(resultItem.tooltip), `${data.expectedTooltip}`);
      });
    });

    [
      { result: 'ko', expectedTitle: 'Vous n’avez pas réussi l’épreuve', expectedTooltip: 'Épreuve non réussie' },
      { result: 'ok', expectedTitle: 'Vous avez réussi l’épreuve', expectedTooltip: 'Épreuve réussie' },
      { result: 'aband', expectedTitle: 'Vous avez passé l’épreuve', expectedTooltip: 'Épreuve passée' },
    ].forEach((data) => {
      test(`should return adapted title and tooltip when challenge is auto validated and validation is ${data.result}`, function (assert) {
        // given
        answer.set('result', `${data.result}`);
        answer.set('challenge', challengeQrocWithAutoReply);

        // when
        resultItem = component.resultItem;

        // then
        assert.strictEqual(this.intl.t(resultItem.title), `${data.expectedTitle}`);
        assert.strictEqual(this.intl.t(resultItem.tooltip), `${data.expectedTooltip}`);
      });
    });
  });

  module('#solution', function () {
    test('should return null when challenge has autoReply=true', function (assert) {
      // given
      answer.set('challenge', challengeQrocmDepWithAutoReply);
      answer.set('correction', EmberObject.create());

      // when
      const solution = component.solution;

      // then
      assert.notOk(solution);
    });

    test('should return solution', function (assert) {
      // given
      answer.set('challenge', challengeQcu);
      answer.set('correction', EmberObject.create({ solution: 'solution' }));

      // when
      const solution = component.solution;

      // then
      assert.strictEqual(solution, 'solution');
    });
  });
});
