import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | timeout-gauge-component ', function() {

  setupTest();

  let component;

  beforeEach(function() {
    component = createGlimmerComponent('component:timeout-gauge');
  });

  describe('#Test rendering Property', function() {

    describe('#formattedRemainingTime', function() {
      [
        { remainingSeconds: 0, expected: '0:00' },
        { remainingSeconds: 120, expected: '2:00' },
        { remainingSeconds: 90, expected: '1:30' },
        { remainingSeconds: 60, expected: '1:00' },
      ].forEach((data) => {

        it(`should return "${data.expected}" when allotting ${data.allottedTime}s and remainingSeconds is ${data.remainingSeconds}s`, function() {
          // given
          component.remainingSeconds = data.remainingSeconds;
          // when
          const formattedRemainingTime = component.formattedRemainingTime;
          // then
          expect(formattedRemainingTime).to.equal(data.expected);
        });
      });
    });

    describe('#percentageOfTimeout', function() {
      [
        { allottedTime: new Date(), remainingSeconds: 40, expected: 0 },
        { allottedTime: '  ', remainingSeconds: 40, expected: 0 },
        { allottedTime: undefined, remainingSeconds: 40, expected: 0 },
        { allottedTime: null, remainingSeconds: 40, expected: 0 },
        { allottedTime: '0', remainingSeconds: 40, expected: 0 },
        { allottedTime: '40', remainingSeconds: 40, expected: 0 },
        { allottedTime: '70', remainingSeconds: 35, expected: 50 },
        { allottedTime: '120', remainingSeconds: 0, expected: 100 },
      ].forEach((data) => {

        it(`should return ${data.expected}% when allotting ${data.allottedTime}s and remainingSeconds is ${data.remainingSeconds}s`, function() {
          // given
          component.args.allottedTime = data.allottedTime;
          component.remainingSeconds = data.remainingSeconds;
          // when
          const percentageOfTimeout = component.percentageOfTimeout;
          // then
          expect(percentageOfTimeout).to.equal(data.expected);
        });
      });
    });

  });

});
