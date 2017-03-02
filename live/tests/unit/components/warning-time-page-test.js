import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | warning-page-component ', function () {

  setupTest('component:warning-page', {});

  let component;

  beforeEach(function () {
    component = this.subject();
  });

  describe('#Test rendering Property', function () {

    describe('#allocatedTime', function () {
      [
        { input: '', expected: 0 },
        { input: ' ', expected: 0 },
        { input: 'undefined', expected: 0 },
        { input: null, expected: 0 },
        { input: 0, expected: 0 },
        { input: 1, expected: '0:01' },
        { input: 10, expected: '0:10' },
        { input: 60, expected: '1:00' },
        { input: 61, expected: '1:01' },
        { input: 70, expected: '1:10' },
        { input: 120, expected: '2:00' },
        { input: 121, expected: '2:01' },
        { input: 122, expected: '2:02' },
        { input: 130, expected: '2:10' }
      ].forEach((data) => {
        it(`should return "${data.expected}" when passing ${data.input}`, function () {
          // given
          component.set('time', data.input);

          // when
          const allocatedTime = component.get('allocatedTime');

          // then
          expect(allocatedTime).to.equal(data.expected);
        });
      });
    });

    describe('#allocatedHumanTime', function () {
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
        { input: 130, expected: '2 minutes et 10 secondes' }
      ].forEach((data) => {
        it(`should return "${data.expected}" when passing ${data.input}`, function () {
          // given
          component.set('time', data.input);

          // when
          const allocatedHumanTime = component.get('allocatedHumanTime');

          // then
          expect(allocatedHumanTime).to.equal(data.expected);
        });
      });
    });

  });

});
