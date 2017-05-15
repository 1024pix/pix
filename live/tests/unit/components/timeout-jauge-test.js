import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | timeout-jauge-component ', function() {

  setupTest('component:timeout-jauge', {});

  let component;

  beforeEach(function() {
    component = this.subject();
  });

  describe('#Test rendering Property', function() {

    describe('#remainingSeconds', function() {
      [
        { allotedTime: new Date(),  _elapsedTime:0,     expected: 0   },
        { allotedTime: '  ',        _elapsedTime:0,     expected: 0   },
        { allotedTime: undefined,   _elapsedTime:0,     expected: 0   },
        { allotedTime: null,        _elapsedTime:0,     expected: 0   },
        { allotedTime: '0',         _elapsedTime:0,     expected: 0   },
        { allotedTime: '40',        _elapsedTime:0,     expected: 40  },
        { allotedTime: '70',        _elapsedTime:0,     expected: 70  },
        { allotedTime: '120',       _elapsedTime:0,     expected: 120 },
        { allotedTime: 150,         _elapsedTime:0,     expected: 150 },
        { allotedTime: '120',      _elapsedTime:60000,  expected: 60  },
        { allotedTime: '120',      _elapsedTime:90000,  expected: 30  },
        { allotedTime: '120',      _elapsedTime:120000, expected: 0   },
        { allotedTime: '120',      _elapsedTime:150000, expected: -30 },
      ].forEach((data) => {

        it(`should return "${data.expected}" when alloting ${data.allotedTime} and _elapsedTime is ${data._elapsedTime}ms`, function() {
          // given
          component.set('allotedTime', data.allotedTime);
          component.set('_elapsedTime', data._elapsedTime);
          // when
          const remainingSeconds = component.get('remainingSeconds');
          // then
          expect(remainingSeconds).to.equal(data.expected);
        });
      });
    });

    describe('#remainingTime', function() {
      [
        { allotedTime: new Date(), _elapsedTime:0, expected: '0:00' },
        { allotedTime: '  ',       _elapsedTime:0, expected: '0:00' },
        { allotedTime: undefined,  _elapsedTime:0, expected: '0:00' },
        { allotedTime: null,       _elapsedTime:0, expected: '0:00' },
        { allotedTime: '0',        _elapsedTime:0, expected: '0:00' },
        { allotedTime: '40',       _elapsedTime:0, expected: '0:40' },
        { allotedTime: '70',       _elapsedTime:0, expected: '1:10' },
        { allotedTime: '120',      _elapsedTime:0, expected: '2:00' },
        { allotedTime: 150,        _elapsedTime:0, expected: '2:30' },
        { allotedTime: '120',      _elapsedTime:60000, expected: '1:00' },
        { allotedTime: '120',      _elapsedTime:90000, expected: '0:30' },
        { allotedTime: '120',      _elapsedTime:120000, expected: '0:00' },
        { allotedTime: '120',      _elapsedTime:150000, expected: '0:00' },
      ].forEach((data) => {

        it(`should return "${data.expected}" when alloting ${data.allotedTime} and _elapsedTime is ${data._elapsedTime}ms`, function() {
          // given
          component.set('allotedTime', data.allotedTime);
          component.set('_elapsedTime', data._elapsedTime);
          // when
          const remainingTime = component.get('remainingTime');
          // then
          expect(remainingTime).to.equal(data.expected);
        });
      });
    });

    describe('#percentageOfTimeout', function() {
      [
        { allotedTime: new Date(), _elapsedTime:4000,    expected: 0 },
        { allotedTime: '  ',       _elapsedTime:4000,    expected: 0 },
        { allotedTime: undefined,  _elapsedTime:4000,    expected: 0 },
        { allotedTime: null,       _elapsedTime:4000,    expected: 0 },
        { allotedTime: '0',        _elapsedTime:4000,    expected: 0 },
        { allotedTime: '40',       _elapsedTime:4000,    expected: 10 },
        { allotedTime: '70',       _elapsedTime:35000,   expected: 50 },
        { allotedTime: '120',      _elapsedTime:120000,  expected: 100 },
        { allotedTime: 150,        _elapsedTime:225000,  expected: 150 }
      ].forEach((data) => {

        it(`should return "${data.expected}" when alloting ${data.allotedTime} and _elapsedTime is ${data._elapsedTime}ms`, function() {
          // given
          component.set('allotedTime', data.allotedTime);
          component.set('_elapsedTime', data._elapsedTime);
          // when
          const percentageOfTimeout = component.get('percentageOfTimeout');
          // then
          expect(percentageOfTimeout).to.equal(data.expected);
        });
      });
    });

  });

});
