const { expect, catchErr } = require('./test-helper');

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

    it('returns a string if no error was thrown', async function () {
      // given
      const functionToTest = function () {
        return 'All went well';
      };

      // when
      const result = await catchErr(functionToTest)();

      // then
      expect(result).to.deepEqualInstance('should have thrown an error');
    });
  });
});
