import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | Challenge item Generic', function() {

  setupTest();

  let component;

  describe('#displayChallenge', function() {

    [
      { timer: undefined, answer: undefined, hasUserConfirmedWarning: false, expectedResult: true },
      { timer: undefined, answer: 'banana', hasUserConfirmedWarning: false, expectedResult: true },
      { timer: 55, answer: undefined, hasUserConfirmedWarning: true, expectedResult: true },
      { timer: 55, answer: 'banana', hasUserConfirmedWarning: false, expectedResult: true },
      { timer: 55, answer: undefined, hasUserConfirmedWarning: false, expectedResult: false },
    ].forEach((data) => {

      const _hasTimer = data.timer ? 'challenge has timer' : 'challenge has no timer';
      const _hasUserConfirmedWarning = data.hasUserConfirmedWarning ? 'user has confirmed warning' : 'user has not confirmed warning';
      const _hasAnswer = data.answer ? 'user has already answered' : 'user has not answered the question';

      it(`should be ${data.expectedResult} when ${_hasTimer}, ${_hasUserConfirmedWarning}, ${_hasAnswer}`, function() {
        // given
        const challenge = EmberObject.create({
          autoReply: true,
          id: 'rec_123',
          timer: data.timer,
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
});
