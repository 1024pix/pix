import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import setupIntl from '../../helpers/setup-intl';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

const undefinedAnswer = 'undefined';
const answerWithEmptyResult = {
  value: '',
  result: '',
  name: 'answerWithEmptyResult',
};
const answerWithUndefinedResult = {
  value: '',
  result: undefined,
  name: 'answerWithUndefinedResult',
};
const answerWithNullResult = {
  value: '',
  result: null,
  name: 'answerWithNullResult',
};

module('Unit | Component | result-item-component', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let component;

  module('#resultItem Computed property - undefined case', function () {
    [undefinedAnswer, answerWithEmptyResult, answerWithUndefinedResult, answerWithNullResult].forEach(function (
      answer
    ) {
      test(`should returns undefined when answer provided is: ${answer.name}`, function (assert) {
        // when
        component = createGlimmerComponent('component:result-item', { answer });

        // then
        assert.notOk(component.resultItem);
      });
    });
  });

  module('#resultItem Computed property - defined case', function () {
    [
      { result: 'ok', expectedColor: 'green', expectedIcon: 'circle-check' },
      { result: 'ko', expectedColor: 'red', expectedIcon: 'circle-xmark' },
      { result: 'timedout', expectedColor: 'red', expectedIcon: 'circle-xmark' },
      { result: 'partially', expectedColor: 'orange', expectedIcon: 'circle-check' },
      { result: 'aband', expectedColor: 'grey', expectedIcon: 'circle-xmark' },
    ].forEach((data) => {
      test(`should return a ${data.expectedColor} ${data.expectedIcon} icon when answer provided has a ${data.result} result`, function (assert) {
        // given
        const answerWithOkResult = { result: `${data.result}` };

        // when
        component = createGlimmerComponent('component:result-item', { answer: answerWithOkResult });

        // then
        assert.strictEqual(component.resultItem.color, `${data.expectedColor}`);
        assert.strictEqual(component.resultItem.icon, `${data.expectedIcon}`);
      });
    });
  });

  module('#resultTooltip', function () {
    [
      { result: 'ok', expectedTooltip: 'Réponse correcte' },
      { result: 'ko', expectedTooltip: 'Réponse incorrecte' },
      { result: 'timedout', expectedTooltip: 'Temps dépassé' },
      { result: 'partially', expectedTooltip: 'Réponse partielle' },
      { result: 'aband', expectedTooltip: 'Sans réponse' },
    ].forEach((data) => {
      test(`should return a tooltip text equal to ${data.expectedTooltip}`, function (assert) {
        // given
        const answerWithOkResult = { result: `${data.result}` };
        component = createGlimmerComponent('component:result-item', { answer: answerWithOkResult });

        // when
        const tooltipText = component.resultTooltip;

        // then
        assert.strictEqual(tooltipText, `${data.expectedTooltip}`);
      });
    });
  });

  module('#textLength', function () {
    test('should be 60 when it is a mobile', function (assert) {
      //when
      window.innerWidth = 600;

      //then
      assert.strictEqual(component.textLength, 60);
    });

    test('should be 110 when it a tablet/desktop', function (assert) {
      //when
      window.innerWidth = 1200;

      //then
      assert.strictEqual(component.textLength, 110);
    });
  });

  module('#validationImplementedForChallengeType', function () {
    [
      { challengeType: 'QCM', expected: true },
      { challengeType: 'QROC', expected: true },
      { challengeType: 'QROCM-ind', expected: true },
      { challengeType: 'QROCM-dep', expected: true },
      { challengeType: 'QCU', expected: true },
      { challengeType: 'OtherType', expected: false },
    ].forEach(function (data) {
      test(`should return ${data.expected} when challenge type is ${data.challengeType}`, function (assert) {
        // given
        const challenge = EmberObject.create({ type: data.challengeType });
        const answer = EmberObject.create({ challenge });

        // when
        component = createGlimmerComponent('component:result-item', { answer });

        // then
        assert.strictEqual(component.validationImplementedForChallengeType, data.expected);
      });
    });
  });
});
