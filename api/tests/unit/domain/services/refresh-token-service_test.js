const { expect, sinon, catchErr } = require('../../../test-helper');
const settings = require('../../../../lib/config');
const tokenService = require('../../../../lib/domain/services/token-service');
const refreshTokenService = require('../../../../lib/domain/services/refresh-token-service');
const { UnauthorizedError } = require('../../../../lib/application/http-errors');
const temporaryStorage = refreshTokenService.temporaryStorageForTests;

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
      const expirationDelaySeconds = settings.authentication.refreshTokenLifespanMs / 1000;

      sinon.stub(temporaryStorage, 'save').withArgs({ value, expirationDelaySeconds }).resolves(validRefreshToken);

      // when
      const result = await refreshTokenService.createRefreshTokenFromUserId({ userId, source });

      // then
      expect(result).to.equal(validRefreshToken);
    });
  });

  describe('#createAccessTokenFromRefreshToken', function () {
    context('when refresh token is valid', function () {
      it('should create access token with user id and source and return it with expiration delay in seconds', async function () {
        // given
        const userId = 123;
        const source = 'pix';
        const refreshToken = 'valid-refresh-token';
        const accessToken = 'valid-access-token';
        const expirationDelaySeconds = 1;
        sinon.stub(temporaryStorage, 'get').withArgs(refreshToken).resolves({ userId, source });
        sinon
          .stub(tokenService, 'createAccessTokenFromUser')
          .withArgs(userId, source)
          .resolves({ accessToken, expirationDelaySeconds });

        // when
        const result = await refreshTokenService.createAccessTokenFromRefreshToken({ refreshToken });

        // then
        expect(result).to.be.deep.equal({ accessToken, expirationDelaySeconds });
      });
    });

    context('when refresh token has expired or has been revoked', function () {
      it('should throw an UnauthorizedError with specific code and message', async function () {
        // given
        const revokedRefreshToken = 'revoked-refresh-token';
        sinon.stub(temporaryStorage, 'get').withArgs(revokedRefreshToken).resolves();

        // when
        const error = await catchErr(refreshTokenService.createAccessTokenFromRefreshToken)({
          refreshToken: revokedRefreshToken,
        });

        // then
        expect(error).to.be.instanceOf(UnauthorizedError);
        expect(error.code).to.be.equal('INVALID_REFRESH_TOKEN');
        expect(error.message).to.be.equal('Refresh token is invalid');
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
