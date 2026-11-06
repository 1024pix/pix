import { expect } from 'chai';
import sinon from 'sinon';

import { memoizeByReference } from '../../../../../src/shared/infrastructure/utils/memoize.ts';

describe('Unit | Shared | Infrastructure | Utils | memoize', function () {
  describe('#memoizeByReference', function () {
    it('should compute once per input and give the same result back', function () {
      // given
      const compute = sinon.spy((numbers: number[]) => numbers.map((n) => n * 2));
      const double = memoizeByReference(compute);
      const numbers = [1, 2];

      // when
      const first = double(numbers);
      const second = double(numbers);

      // then
      expect(first).to.deep.equal([2, 4]);
      expect(second).to.equal(first);
      expect(compute).to.have.been.calledOnceWithExactly(numbers);
    });

    it('should compute again for another input, even an equal one', function () {
      // given
      const compute = sinon.spy((numbers: number[]) => numbers.length);
      const count = memoizeByReference(compute);

      // when
      count([1]);
      count([1]);

      // then
      expect(compute.callCount).to.equal(2);
    });
  });
});
