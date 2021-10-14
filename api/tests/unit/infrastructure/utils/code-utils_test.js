const { expect } = require('../../../test-helper');
const {
  generateNumericalString,
  generateStringCodeForOrganizationInvitation,
} = require('../../../../lib/infrastructure/utils/code-utils');

describe('Unit | Utils | code-utils', function () {
  describe('#generateNumericalString', function () {
    it('should return random numerical string with six digits', function () {
      // given & when
      const result = generateNumericalString(6);

      // then
      expect(result).to.have.length(6);
    });
  });

  describe('#generateStringCodeForOrganizationInvitation', function () {
    it('should return string with ten characters in uppercase', function () {
      // given & when
      const result = generateStringCodeForOrganizationInvitation();

      // then
      expect(result).to.have.length(10);
      expect(result).to.equal(result.toUpperCase());
    });
  });
});
