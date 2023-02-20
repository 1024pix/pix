import { expect } from '../../../test-helper';
import tokenService from '../../../../lib/domain/services/token-service';
import settings from '../../../../lib/config';

describe('Integration | Domain | Services | TokenService', function () {
  describe('#createAccessTokenForSaml', function () {
    it('should return a valid json web token', function () {
      // given
      const userId = 123;

      // when
      const result = tokenService.createAccessTokenForSaml(userId);

      // then
      const token = tokenService.getDecodedToken(result);
      expect(token).to.include({ source: 'external', user_id: userId });

      const expirationDelaySeconds = token.exp - token.iat;
      const expectedExpirationDelaySeconds = settings.saml.accessTokenLifespanMs / 1000;
      expect(expirationDelaySeconds).to.equal(expectedExpirationDelaySeconds);
    });
  });
});
