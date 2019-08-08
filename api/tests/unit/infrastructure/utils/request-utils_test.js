const { expect, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const { extractUserIdFromRequest } = require('../../../../lib/infrastructure/utils/request-utils');

describe('Unit | Utils | Request Utils', function() {

  describe('#extractUserIdFromRequest', function() {

    it('should extract the ID of user from request', function() {
      // given
      const userId = 4;
      const request = {
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) }
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
});
