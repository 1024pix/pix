import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | timeout-jauge-component ', function() {

  setupTest();

  let component;

  beforeEach(function() {
    component = createGlimmerComponent('component:timeout-jauge');
  });

  describe('#Test rendering Property', function() {

    describe('#formattedRemainingTime', function() {
      [
        { allottedTime: new Date(), _elapsedTime: 0, expected: '0:00' },
        { allottedTime: '  ', _elapsedTime: 0, expected: '0:00' },
        { allottedTime: undefined, _elapsedTime: 0, expected: '0:00' },
        { allottedTime: null, _elapsedTime: 0, expected: '0:00' },
        { allottedTime: '0', _elapsedTime: 0, expected: '0:00' },
        { allottedTime: '40', _elapsedTime: 0, expected: '0:40' },
        { allottedTime: '70', _elapsedTime: 0, expected: '1:10' },
        { allottedTime: '120', _elapsedTime: 0, expected: '2:00' },
        { allottedTime: 150, _elapsedTime: 0, expected: '2:30' },
        { allottedTime: '120', _elapsedTime: 60000, expected: '1:00' },
        { allottedTime: '120', _elapsedTime: 90000, expected: '0:30' },
        { allottedTime: '120', _elapsedTime: 120000, expected: '0:00' },
        { allottedTime: '120', _elapsedTime: 150000, expected: '0:00' },
      ].forEach((data) => {

        it(`should return "${data.expected}" when allotting ${data.allottedTime} and _elapsedTime is ${data._elapsedTime}ms`, function() {
          // given
          component.args.allottedTime = data.allottedTime;
          component._elapsedTime = data._elapsedTime;
          // when
          const formattedRemainingTime = component.formattedRemainingTime;
          // then
          expect(formattedRemainingTime).to.equal(data.expected);
        });
      });
    });

    describe('#percentageOfTimeout', function() {
      [
        { allottedTime: new Date(), _elapsedTime: 4000, expected: 0 },
        { allottedTime: '  ', _elapsedTime: 4000, expected: 0 },
        { allottedTime: undefined, _elapsedTime: 4000, expected: 0 },
        { allottedTime: null, _elapsedTime: 4000, expected: 0 },
        { allottedTime: '0', _elapsedTime: 4000, expected: 0 },
        { allottedTime: '40', _elapsedTime: 4000, expected: 10 },
        { allottedTime: '70', _elapsedTime: 35000, expected: 50 },
        { allottedTime: '120', _elapsedTime: 120000, expected: 100 },
        { allottedTime: 150, _elapsedTime: 225000, expected: 150 },
      ].forEach((data) => {

        it(`should return "${data.expected}" when allotting ${data.allottedTime} and _elapsedTime is ${data._elapsedTime}ms`, function() {
          // given
          component.args.allottedTime = data.allottedTime;
          component._elapsedTime = data._elapsedTime;
          // when
          const percentageOfTimeout = component.percentageOfTimeout;
          // then
          expect(percentageOfTimeout).to.equal(data.expected);
        });
      });
    });

  });

});
