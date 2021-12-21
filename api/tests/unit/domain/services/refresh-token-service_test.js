const { expect, sinon } = require('../../../test-helper');
const settings = require('../../../../lib/config');
const ms = require('ms');
const refreshTokenService = require('../../../../lib/domain/services/refresh-token-service');
const temporaryStorage = require('../../../../lib/infrastructure/temporary-storage');

describe('Unit | Domain | Service | Refresh Token Service', function () {
  describe('#createRefreshTokenFromUserId', function () {
    it('should create refresh access token with user id and source', async function () {
      // given
      const userId = 123;
      const source = 'pix';
      const validRefreshToken = 'valid-refresh-token';
      const value = {
        type: 'refresh_token',
        userId,
        source,
      };
      const expirationDelaySeconds = ms(settings.authentication.refreshTokenLifespan) / 1000;

      sinon.stub(temporaryStorage, 'save').withArgs({ value, expirationDelaySeconds }).resolves(validRefreshToken);

      // when
      const result = await refreshTokenService.createRefreshTokenFromUserId({ userId, source });

      // then
      expect(result).to.equal(validRefreshToken);
    });
  });
});
