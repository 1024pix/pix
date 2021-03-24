import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntl from '../../helpers/setup-intl';
import { setupTest } from 'ember-mocha';
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

describe('Unit | Component | result-item-component', function() {

  setupTest();
  setupIntl();

  let component;

  describe('#resultItem Computed property - undefined case', function() {
    [
      undefinedAnswer,
      answerWithEmptyResult,
      answerWithUndefinedResult,
      answerWithNullResult,
    ].forEach((answer) => {
      it(`should returns undefined when answer provided is: ${answer.name}`, function() {
        // when
        component = createGlimmerComponent('component:result-item', { answer });

        // then
        expect(component.resultItem).to.be.undefined;
      });
    });

  });

  describe('#resultItem Computed property - defined case', function() {
    [
      { result: 'ok', expectedColor: 'green', expectedIcon: 'check-circle' },
      { result: 'ko', expectedColor: 'red', expectedIcon: 'times-circle' },
      { result: 'timedout', expectedColor: 'red', expectedIcon: 'times-circle' },
      { result: 'partially', expectedColor: 'orange', expectedIcon: 'check-circle' },
      { result: 'aband', expectedColor: 'grey', expectedIcon: 'times-circle' },
    ].forEach((data) => {
      it(`should return a ${data.expectedColor} ${data.expectedIcon} icon when answer provided has a ${data.result} result`, function() {
        // given
        const answerWithOkResult = { result: `${data.result}` };

        // when
        component = createGlimmerComponent('component:result-item', { answer: answerWithOkResult });

        // then
        expect(component.resultItem.color).to.equal(`${data.expectedColor}`);
        expect(component.resultItem.icon).to.equal(`${data.expectedIcon}`);
      });
    });
  });

  describe('#resultTooltip', function() {
    [
      { result: 'ok', expectedTooltip: 'Réponse correcte' },
      { result: 'ko', expectedTooltip: 'Réponse incorrecte' },
      { result: 'timedout', expectedTooltip: 'Temps dépassé' },
      { result: 'partially', expectedTooltip: 'Réponse partielle' },
      { result: 'aband', expectedTooltip: 'Sans réponse' },
    ].forEach((data) => {
      it(`should return a tooltip text equal to ${data.expectedTooltip}`, function() {
        // given
        const answerWithOkResult = { result: `${data.result}` };
        component = createGlimmerComponent('component:result-item', { answer: answerWithOkResult });

        // when
        const tooltipText = component.resultTooltip;

        // then
        expect(tooltipText).to.equal(`${data.expectedTooltip}`);
      });
    });
  });

  describe('#textLength', function() {

    it('should be 60 when it is a mobile', function() {
      //when
      window.innerWidth = 600;

      //then
      expect(component.textLength).to.equal(60);
    });

    it('should be 110 when it a tablet/desktop', function() {
      //when
      window.innerWidth = 1200;

      //then
      expect(component.textLength).to.equal(110);
    });
  });

  describe('#validationImplementedForChallengeType', function() {

    [
      { challengeType: 'QCM', expected: true },
      { challengeType: 'QROC', expected: true },
      { challengeType: 'QROCM-ind', expected: true },
      { challengeType: 'QROCM-dep', expected: true },
      { challengeType: 'QCU', expected: true },
      { challengeType: 'OtherType', expected: false },
    ].forEach((data) => {

      it(`should return ${data.expected} when challenge type is ${data.challengeType}`, function() {
        // given
        const challenge = EmberObject.create({ type: data.challengeType });
        const answer = EmberObject.create({ challenge });

        // when
        component = createGlimmerComponent('component:result-item', { answer });

        // then
        expect(component.validationImplementedForChallengeType).to.equal(data.expected);
      });
    });
  });
});
