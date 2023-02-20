import { expect } from '../../../test-helper';
import { generateNumericalString } from '../../../../lib/infrastructure/utils/code-utils';

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
