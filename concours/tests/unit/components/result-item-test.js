import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';

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

  let component;

  beforeEach(function() {
    component = this.owner.lookup('component:result-item');
  });

  describe('#resultItem Computed property - undefined case', function() {
    [
      undefinedAnswer,
      answerWithEmptyResult,
      answerWithUndefinedResult,
      answerWithNullResult
    ].forEach(function(answer) {
      it(`should returns undefined when answer provided is: ${answer.name}`, function() {
        // when
        component.set('answer', answer);

        // then
        expect(component.get('resultItem')).to.be.undefined;
      });
    });

  });

  describe('#resultItem Computed property - defined case', function() {
    it('should return the green check-circle icon with "Réponse correcte" when answer provided has a valid result', function() {
      // given
      const answerWithOkResult = { result: 'ok' };

      // when
      component.set('answer', answerWithOkResult);

      // then
      expect(component.get('resultItem.title')).to.equal('Réponse correcte');
      expect(component.get('resultItem.color')).to.equal('green');
      expect(component.get('resultItem.icon')).to.equal('check-circle');
    });

    it('should return the red times-circle icon with "Réponse incorrecte" when answer provided has an invalid result', function() {
      // given
      const answerWithKoResult = { result: 'ko' };

      // when
      component.set('answer', answerWithKoResult);

      // then
      expect(component.get('resultItem.title')).to.equal('Réponse incorrecte');
      expect(component.get('resultItem.color')).to.equal('red');
      expect(component.get('resultItem.icon')).to.equal('times-circle');
    });

    it('should return the red times-circle icon with "Temps dépassé" when answer provided has a timed out result', function() {
      // given
      const answerWithTimedoutResult = { result: 'timedout' };

      // when
      component.set('answer', answerWithTimedoutResult);

      // then
      expect(component.get('resultItem.title')).to.equal('Temps dépassé');
      expect(component.get('resultItem.color')).to.equal('red');
      expect(component.get('resultItem.icon')).to.equal('times-circle');
    });

    it('should return the orange check-circle icon with "Réponse partielle" when answer provided has partially valid result', function() {
      // given
      const answerWithPartiallyResult = { result: 'partially' };

      // when
      component.set('answer', answerWithPartiallyResult);

      // then
      expect(component.get('resultItem.title')).to.equal('Réponse partielle');
      expect(component.get('resultItem.color')).to.equal('orange');
      expect(component.get('resultItem.icon')).to.equal('check-circle');
    });

    it('should return the grey times-circle icon with "Sans réponse" when answer provided has skipped result', function() {
      // given
      const answerWithAbandResult = { result: 'aband' };

      // when
      component.set('answer', answerWithAbandResult);

      // then
      expect(component.get('resultItem.title')).to.equal('Sans réponse');
      expect(component.get('resultItem.color')).to.equal('grey');
      expect(component.get('resultItem.icon')).to.equal('times-circle');
    });
  });

  describe('#textLength', function() {

    it('should be 60 when it is a mobile', function() {
      //when
      window.innerWidth = 600;

      //then
      expect(component.get('textLength')).to.equal(60);
    });

    it('should be 110 when it a tablet/desktop', function() {
      //when
      window.innerWidth = 1200;

      //then
      expect(component.get('textLength')).to.equal(110);
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
    ].forEach(function(data) {

      it(`should return ${data.expected} when challenge type is ${data.challengeType}`, function() {
        // given
        const challenge = EmberObject.create({ type: data.challengeType });
        const answer = EmberObject.create({ challenge });

        // when
        component.set('answer', answer);

        // then
        expect(component.get('validationImplementedForChallengeType')).to.equal(data.expected);
      });
    });
  });
});
