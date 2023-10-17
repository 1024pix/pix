import { expect, catchErr, parseJsonStream } from './test-helper.js';

describe('Test helpers', function () {
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

  describe('#parseJsonStream', function () {
    it('should parse JSONStream data', function () {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      const data = [JSON.stringify(obj1), JSON.stringify(obj2), ''].join('\n');

      expect(
        parseJsonStream({
          result: data,
        }),
      ).to.deep.equal([obj1, obj2]);
    });
  });
});
