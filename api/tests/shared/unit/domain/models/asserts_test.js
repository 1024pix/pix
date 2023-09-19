import { assertNotNullOrUndefined } from '../../../../../src/shared/domain/models/asserts.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Shared | Models | asserts', function () {
  describe('#assertNotNullOrUndefined', function () {
    describe('given invalid values', function () {
      // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
      // eslint-disable-next-line mocha/no-setup-in-describe
      [null, undefined].forEach(function (input) {
        it(`"${input}" should throw`, function () {
          expect(() => assertNotNullOrUndefined(input)).to.throw();
        });
      });
    });

    describe('given valid values', function () {
      // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
      // eslint-disable-next-line mocha/no-setup-in-describe
      [0, '', false, [], {}, NaN].forEach(function (input) {
        it(`"${input}" should not throw`, function () {
          expect(() => assertNotNullOrUndefined(input)).not.to.throw();
        });
      });
    });
  });
});
