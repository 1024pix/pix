import { PromiseUtils } from '../../../../../src/shared/infrastructure/utils/promise-utils.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

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
