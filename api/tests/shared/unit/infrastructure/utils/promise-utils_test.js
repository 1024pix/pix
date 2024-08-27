import { PromiseUtils } from '../../../../../src/shared/infrastructure/utils/promise-utils.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Promise utils', function () {
  describe('#map', function () {
    it('maps', async function () {
      const arr = [1, 2, 3];
      const callback = sinon.spy((v) => Promise.resolve(v + 1));

      const result = await PromiseUtils.map(arr, callback);

      expect(callback).to.have.been.calledThrice;
      expect(result).to.deep.equal([2, 3, 4]);
    });

    it('rejects if an error occurred', async function () {
      const arr = [1, 2, 3];
      const callback = sinon.spy(() => Promise.reject('boo'));

      const error = await catchErr(PromiseUtils.map)(arr, callback);

      expect(error).to.be.equal('boo');
    });

    describe('concurrency limit', function () {
      let currentConcurrentExecutions;
      let maxConcurrentExecutions;
      let concurrentCallback;

      beforeEach(function () {
        currentConcurrentExecutions = 0;
        maxConcurrentExecutions = 0;

        concurrentCallback = async (item) => {
          currentConcurrentExecutions++;
          maxConcurrentExecutions = Math.max(maxConcurrentExecutions, currentConcurrentExecutions);
          const result = await Promise.resolve(item);
          currentConcurrentExecutions--;
          return result;
        };
      });

      it('respects concurrency limit', async function () {
        const arr = [1, 2, 3, 4, 5, 6];
        const concurrency = 2;

        const result = await PromiseUtils.map(arr, concurrentCallback, { concurrency });

        expect(result).to.deep.equal(arr);
        expect(maxConcurrentExecutions).to.be.equal(concurrency);
      });

      it('handles concurrency of 1 correctly', async function () {
        const arr = [1, 2, 3, 4, 5, 6];
        const concurrency = 1;

        const result = await PromiseUtils.map(arr, concurrentCallback, { concurrency });

        expect(result).to.deep.equal(arr);
        expect(maxConcurrentExecutions).to.be.equal(concurrency);
      });

      it('handles no concurrency limit', async function () {
        const arr = [1, 2, 3, 4, 5, 6];
        const concurrency = Infinity;

        const result = await PromiseUtils.map(arr, concurrentCallback, { concurrency });

        expect(result).to.deep.equal(arr);
        expect(maxConcurrentExecutions).to.be.equal(arr.length);
      });
    });
  });

  describe('#mapSeries', function () {
    it('maps array values sequentially using an async mapper', async function () {
      const array = [1, 2, 3];
      const asyncMapper = async (item, index) => item * index;

      const result = await PromiseUtils.mapSeries(array, asyncMapper);

      expect(result).to.deep.equal([0, 2, 6]);
    });

    it('returns an empty array when the input array is empty', async function () {
      const array = [];
      const asyncMapper = async (x) => x * 2;

      const result = await PromiseUtils.mapSeries(array, asyncMapper);

      expect(result).to.deep.equal([]);
    });

    it('throws an error if the mapper function throws', async function () {
      const array = [1, 2, 3];
      const asyncMapper = async (x) => {
        if (x === 2) throw new Error('Test error');
        return x * 2;
      };

      const error = await catchErr(PromiseUtils.mapSeries)(array, asyncMapper);

      expect(error).to.be.instanceof(Error);
    });

    it('executes the mapper function sequentially', async function () {
      const array = [1, 2, 3];
      const executionOrder = [];

      const asyncMapper = async (x, index) => {
        if (index === 1) {
          await new Promise((resolve) => setTimeout(resolve, 1));
        }
        executionOrder.push(x);
        return x * 2;
      };

      await PromiseUtils.mapSeries(array, asyncMapper);

      expect(executionOrder).to.deep.equal([1, 2, 3]);
    });
  });
});
