import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | timed-challenge-instructions', function () {
  setupTest();

  let component;

  beforeEach(function () {
    component = createGlimmerComponent('component:timed-challenge-instructions');
  });

  describe('Component rendering', function () {
    describe('#allocatedTime', function () {
      [
        { input: '', expected: '' },
        { input: ' ', expected: '' },
        { input: 'undefined', expected: '' },
        { input: null, expected: '' },
        { input: 0, expected: '' },
        { input: 1, expected: '1 seconde' },
        { input: 10, expected: '10 secondes' },
        { input: 60, expected: '1 minute' },
        { input: 61, expected: '1 minute et 1 seconde' },
        { input: 70, expected: '1 minute et 10 secondes' },
        { input: 120, expected: '2 minutes' },
        { input: 121, expected: '2 minutes et 1 seconde' },
        { input: 122, expected: '2 minutes et 2 secondes' },
        { input: 130, expected: '2 minutes et 10 secondes' },
      ].forEach((data) => {
        it(`should return "${data.expected}" when passing ${data.input}`, function () {
          // given
          component.args.time = data.input;

          // when
          const allocatedTime = component.allocatedTime;

          // then
          expect(allocatedTime).to.equal(data.expected);
        });
      });
    });
  });
});
