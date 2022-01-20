const { expect } = require('../../../test-helper');
const tokenService = require('../../../../lib/domain/services/token-service');
const settings = require('../../../../lib/config');

describe('Integration | Domain | Services | TokenService', function () {
  describe('#createAccessTokenFromExternalUser', function () {
    it('should return a valid json web token', function () {
      // given
      const userId = 123;

      // when
      const result = tokenService.createAccessTokenFromExternalUser(userId);

      // then
      const token = tokenService.getDecodedToken(result);
      expect(token).to.include({ source: 'external', user_id: userId });

      const expirationDelaySeconds = token.exp - token.iat;
      const expectedExpirationDelaySeconds = settings.saml.accessTokenLifespanMs / 1000;
      expect(expirationDelaySeconds).to.equal(expectedExpirationDelaySeconds);
    });
  });
});
