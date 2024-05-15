import { Intervals } from '../../../../../../src/certification/scoring/domain/models/Intervals.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | Intervals ', function () {
  describe('length', function () {
    it('returns the length of the given intervals', async function () {
      const intervals = new Intervals({ intervals: [{ hello: 'world' }, { goodbye: 'world' }] });

      expect(intervals.length()).to.equal(2);
    });
  });

  describe('min', function () {
    it('returns the minimum value of the given interval index', async function () {
      const intervals = new Intervals({ intervals: [{ bounds: { min: 1, max: 3 } }, { bounds: { min: 4, max: 6 } }] });

      expect(intervals.min(1)).to.equal(4);
    });
  });

  describe('max', function () {
    it('returns the maximum value of the given interval index', async function () {
      const intervals = new Intervals({ intervals: [{ bounds: { min: 1, max: 3 } }, { bounds: { min: 4, max: 6 } }] });

      expect(intervals.max(0)).to.equal(3);
    });
  });

  describe('intervalWidth', function () {
    it('returns the maximum value of the given interval index', async function () {
      const intervals = new Intervals({ intervals: [{ bounds: { min: 1, max: 3 } }, { bounds: { min: 4, max: 7 } }] });

      expect(intervals.intervalWidth(0)).to.equal(2);
    });
  });

  describe('toIntervalMax', function () {
    it('returns the value from the maximum to the given capacity at a given interval index', async function () {
      const intervals = new Intervals({ intervals: [{ bounds: { min: 1, max: 3 } }, { bounds: { min: 4, max: 7 } }] });

      expect(intervals.toIntervalMax(0, 1)).to.equal(-2);
    });
  });

  describe('findIntervalIndex', function () {
    describe('when the given capacity is inferior to the first interval minimum value', function () {
      it('returns the index of the first interval', async function () {
        const intervals = new Intervals({
          intervals: [{ bounds: { min: 1, max: 3 } }, { bounds: { min: 4, max: 7 } }],
        });

        expect(intervals.findIntervalIndex(0)).to.equal(0);
      });
    });

    describe('when the given capacity is superior to the last interval maximum value', function () {
      it('returns the index of the last interval', async function () {
        const intervals = new Intervals({
          intervals: [{ bounds: { min: 1, max: 3 } }, { bounds: { min: 4, max: 7 } }],
        });

        expect(intervals.findIntervalIndex(10)).to.equal(1);
      });
    });

    describe('when the given capacity is included in one of the intervals', function () {
      it('returns the index of the interval containing this value', async function () {
        const intervals = new Intervals({
          intervals: [{ bounds: { min: 1, max: 3 } }, { bounds: { min: 4, max: 7 } }],
        });

        expect(intervals.findIntervalIndex(2)).to.equal(0);
      });
    });
  });

  describe('isCapacityBelowMinimum', function () {
    it('returns true if the given capacity is inferior to the minimum value of the first interval', async function () {
      const intervals = new Intervals({ intervals: [{ bounds: { min: 1, max: 3 } }, { bounds: { min: 4, max: 7 } }] });

      expect(intervals.isCapacityBelowMinimum(0)).to.equal(true);
    });

    it('returns false if the given capacity is not inferior to the minimum value of the first interval', async function () {
      const intervals = new Intervals({ intervals: [{ bounds: { min: 1, max: 3 } }, { bounds: { min: 4, max: 7 } }] });

      expect(intervals.isCapacityBelowMinimum(7)).to.equal(false);
    });
  });

  describe('isCapacityAboveMaximum', function () {
    it('returns true if the given capacity is superior to the maximum value of the last interval', async function () {
      const intervals = new Intervals({ intervals: [{ bounds: { min: 1, max: 3 } }, { bounds: { min: 4, max: 7 } }] });

      expect(intervals.isCapacityAboveMaximum(10)).to.equal(true);
    });

    it('returns false if the given capacity is not superior to the minimum value of the last interval', async function () {
      const intervals = new Intervals({ intervals: [{ bounds: { min: 1, max: 3 } }, { bounds: { min: 4, max: 7 } }] });

      expect(intervals.isCapacityAboveMaximum(2)).to.equal(false);
    });
  });
});
