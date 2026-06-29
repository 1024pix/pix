import { expect } from '../../../test-helper.js';
import { catchErr } from '../../../tooling/test-utils/error.js';

describe('Unit | Tooling | Test utils | Error', function () {
  describe('#catchErr', function () {
    it('returns the error thrown in the tested function', async function () {
      // given
      const errorToThrow = new Error('An error occurred');
      const functionToTest = function () {
        throw errorToThrow;
      };

      // when
      const result = await catchErr(functionToTest)();

      // then
      expect(result).to.deepEqualInstance(errorToThrow);
    });

    it('throws a specific error if no error was thrown', async function () {
      // given
      const functionToTest = function () {
        return 'All went well';
      };

      // when
      const promise = catchErr(functionToTest)();

      // then
      await expect(promise).to.be.rejectedWith('Expected an error, but none was thrown.');
    });
  });
});
