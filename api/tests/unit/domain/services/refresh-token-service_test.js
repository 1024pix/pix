const { expect, sinon } = require('../../../test-helper');
const settings = require('../../../../lib/config');
const ms = require('ms');
const temporaryStorage = require('../../../../lib/infrastructure/temporary-storage');
const tokenService = require('../../../../lib/domain/services/token-service');
const refreshTokenService = require('../../../../lib/domain/services/refresh-token-service');

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

  describe('#createAccessTokenFromRefreshToken', function () {
    context('when refresh token is valid', function () {
      it('should create access token with user id and source', async function () {
        // given
        const userId = 123;
        const source = 'pix';
        const refreshToken = 'valid-refresh-token';
        const validAccessToken = 'valid-access-token';
        sinon.stub(temporaryStorage, 'get').withArgs(refreshToken).resolves({ userId, source });
        sinon.stub(tokenService, 'createAccessTokenFromUser').withArgs(userId, source).resolves(validAccessToken);

        // when
        const result = await refreshTokenService.createAccessTokenFromRefreshToken({ refreshToken });

        // then
        expect(result).to.equal(validAccessToken);
      });
    });

    context('when refresh token has expired or has been revoked', function () {
      it('should return null', async function () {
        // given
        const revokedRefreshToken = 'revoked-refresh-token';
        sinon.stub(temporaryStorage, 'get').withArgs(revokedRefreshToken).resolves();

        // when
        const result = await refreshTokenService.createAccessTokenFromRefreshToken({
          refreshToken: revokedRefreshToken,
        });

        // then
        expect(result).to.equal(null);
      });
    });
  });

  describe('#revokeRefreshToken', function () {
    it('should remove refresh token from temporary storage', async function () {
      // given
      const refreshToken = 'valid-refresh-token';
      sinon.stub(temporaryStorage, 'delete');

      // when
      await refreshTokenService.revokeRefreshToken({ refreshToken });

      // then
      expect(temporaryStorage.delete).to.have.been.calledWith(refreshToken);
    });
  });
});
