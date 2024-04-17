import { generateNumericalString } from '../../../../src/shared/infrastructure/utils/code-utils.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Utils | code-utils', function () {
  describe('#generateNumericalString', function () {
    it('should return random numerical string with six digits', function () {
      // given & when
      const result = generateNumericalString(6);

      // then
      expect(result).to.have.length(6);
    });
  });
});
