const { expect, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const { escapeFileName, extractUserIdFromRequest } = require('../../../../lib/infrastructure/utils/request-response-utils');

describe('Unit | Utils | Request Utils', function() {

  describe('#extractUserIdFromRequest', function() {

    it('should extract the ID of user from request', function() {
      // given
      const userId = 4;
      const request = {
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) }
      };
      // when
      const result = extractUserIdFromRequest(request);

      // then
      expect(result).to.equal(userId);
    });

    it('should return null when request does not have headers', function() {
      // given
      const request = {};
      // when
      const result = extractUserIdFromRequest(request);

      // then
      expect(result).to.equal(null);
    });

  });

  describe('#escapeFileName', function() {

    it('should allow only a restricted set of characters', function() {
      // given
      const fileName = 'file-name with invalid_chars •’<>:"/\\|?*"\n.csv';

      // when
      const escapedFileName = escapeFileName(fileName);

      // then
      expect(escapedFileName).to.equal('file-name with invalid_chars _____________.csv');
    });

  });
});
