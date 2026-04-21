import { UserAccessToken } from '../../../../../src/identity-access-management/domain/models/UserAccessToken.js';
import { tokenService } from '../../../../../src/shared/domain/services/token-service.js';

describe('Unit | Shared | Domain | Services | Token Service', function () {
  describe('#extractUserId', function () {
    it('should return userId if the accessToken is valid', function () {
      // given
      const userId = 123;
      const audience = 'https://admin.pix.fr';
      const accessToken = UserAccessToken.generateUserToken({ userId, source: 'pix', audience }).accessToken;

      // when
      const result = tokenService.extractUserId(accessToken);

      // then
      expect(result).to.equal(123);
    });

    it('should return null if the accessToken is invalid', function () {
      // given
      const accessToken = 'WRONG_DATA';

      // when
      const result = tokenService.extractUserId(accessToken);

      // then
      expect(result).to.equal(null);
    });
  });
});
