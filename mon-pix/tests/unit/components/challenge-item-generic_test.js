import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | Challenge item Generic', function() {

  setupTest();

  let component;

  describe('#displayChallenge', function() {

    context('when challenge is not focused and has no timer', function() {
      [
        { answer: undefined, hasUserConfirmedWarning: false, expectedResult: true },
        { answer: 'banana', hasUserConfirmedWarning: false, expectedResult: true },
      ].forEach((data) => {
        const _hasUserConfirmedWarning = data.hasUserConfirmedWarning ? 'user has confirmed warning' : 'user has not confirmed warning';
        const _hasAnswer = data.answer ? 'user has already answered' : 'user has not answered the question';

        it(`should be ${data.expectedResult} when ${_hasUserConfirmedWarning}, ${_hasAnswer}`, function() {
          // given
          const challenge = EmberObject.create({
            id: 'rec_123',
            timer: undefined,
            focused: false,
          });

          const answer = data.answer;

          component = createGlimmerComponent('component:challenge-item-generic', { challenge, answer });
          component.hasUserConfirmedWarning = data.hasUserConfirmedWarning;

          // when
          const result = component.displayChallenge;

          // then
          expect(result).to.equal(data.expectedResult);
        });
      });
    });

    context('when challenge has timer', function() {
      [
        { answer: undefined, hasUserConfirmedWarning: true, expectedResult: true },
        { answer: 'banana', hasUserConfirmedWarning: false, expectedResult: true },
        { answer: undefined, hasUserConfirmedWarning: false, expectedResult: false },
      ].forEach((data) => {

        const _hasUserConfirmedWarning = data.hasUserConfirmedWarning ? 'user has confirmed warning' : 'user has not confirmed warning';
        const _hasAnswer = data.answer ? 'user has already answered' : 'user has not answered the question';

        it(`should be ${data.expectedResult} when ${_hasUserConfirmedWarning}, ${_hasAnswer}`, function() {
          // given
          const challenge = EmberObject.create({
            id: 'rec_123',
            timer: 55,
          });

          const answer = data.answer;

          component = createGlimmerComponent('component:challenge-item-generic', { challenge, answer });
          component.hasUserConfirmedWarning = data.hasUserConfirmedWarning;

          // when
          const result = component.displayChallenge;

          // then
          expect(result).to.equal(data.expectedResult);
        });
      });
    });

    context('when challenge is focused', function() {
      [
        { answer: undefined, hasUserConfirmedFocusWarning: true, expectedResult: true },
        { answer: 'banana', hasUserConfirmedFocusWarning: false, expectedResult: true },
        { answer: undefined, hasUserConfirmedFocusWarning: false, expectedResult: false },
      ].forEach((data) => {

        const _hasUserConfirmedFocusWarning = data.hasUserConfirmedFocusWarning ? 'user has confirmed warning' : 'user has not confirmed warning';
        const _hasAnswer = data.answer ? 'user has already answered' : 'user has not answered the question';

        it(`should be ${data.expectedResult} when ${_hasUserConfirmedFocusWarning}, ${_hasAnswer}`, function() {
          // given
          const challenge = EmberObject.create({
            id: 'rec_123',
            focused: true,
          });

          const answer = data.answer;

          component = createGlimmerComponent('component:challenge-item-generic', { challenge, answer });
          component.hasUserConfirmedFocusWarning = data.hasUserConfirmedFocusWarning;

          // when
          const result = component.displayChallenge;

          // then
          expect(result).to.equal(data.expectedResult);
        });
      });
    });
  });
});
