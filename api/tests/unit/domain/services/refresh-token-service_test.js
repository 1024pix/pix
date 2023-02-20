import { expect, sinon, catchErr } from '../../../test-helper';
import settings from '../../../../lib/config';
import tokenService from '../../../../lib/domain/services/token-service';
import refreshTokenService from '../../../../lib/domain/services/refresh-token-service';
import { UnauthorizedError } from '../../../../lib/application/http-errors';
const refreshTokenTemporaryStorage = refreshTokenService.refreshTokenTemporaryStorageForTests;
const userRefreshTokensTemporaryStorage = refreshTokenService.userRefreshTokensTemporaryStorageForTests;

describe('Unit | Domain | Service | Refresh Token Service', function () {
  describe('#createRefreshTokenFromUserId', function () {
    it('should create refresh access token with user id and source', async function () {
      // given
      const userId = 123;
      const source = 'pix';
      const value = {
        type: 'refresh_token',
        userId,
        source,
      };
      const expirationDelaySeconds = settings.authentication.refreshTokenLifespanMs / 1000;
      const uuid = 'aaaabbbb-1111-ffff-8888-7777dddd0000';
      const uuidGenerator = sinon.stub().returns(uuid);
      sinon
        .stub(refreshTokenTemporaryStorage, 'save')
        .withArgs(sinon.match({ key: `${userId}:${uuid}`, value, expirationDelaySeconds }))
        .resolves(`${userId}:${uuid}`);
      sinon.stub(userRefreshTokensTemporaryStorage, 'lpush').resolves();
      sinon.stub(userRefreshTokensTemporaryStorage, 'expire').resolves();

      // when
      const result = await refreshTokenService.createRefreshTokenFromUserId({ userId, source, uuidGenerator });

      // then
      expect(userRefreshTokensTemporaryStorage.lpush).to.have.been.calledWith({
        key: 123,
        value: '123:aaaabbbb-1111-ffff-8888-7777dddd0000',
      });
      expect(userRefreshTokensTemporaryStorage.expire).to.have.been.calledWith({
        key: 123,
        expirationDelaySeconds: settings.authentication.refreshTokenLifespanMs / 1000 + 60 * 60,
      });
      expect(result).to.equal('123:aaaabbbb-1111-ffff-8888-7777dddd0000');
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
        sinon.stub(refreshTokenTemporaryStorage, 'get').withArgs(refreshToken).resolves({ userId, source });
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
        sinon.stub(refreshTokenTemporaryStorage, 'get').withArgs(revokedRefreshToken).resolves();

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
      const refreshTokenContent = {
        type: 'refresh_token',
        userId: 123,
      };
      sinon.stub(refreshTokenTemporaryStorage, 'get').resolves(refreshTokenContent);
      sinon.stub(refreshTokenTemporaryStorage, 'delete');
      sinon.stub(userRefreshTokensTemporaryStorage, 'lrem');

      // when
      await refreshTokenService.revokeRefreshToken({ refreshToken });

      // then
      expect(userRefreshTokensTemporaryStorage.lrem).to.have.been.calledWith({ key: 123, valueToRemove: refreshToken });
      expect(refreshTokenTemporaryStorage.delete).to.have.been.calledWith(refreshToken);
    });

    it('should do nothing if the refresh token does not exist', async function () {
      // given
      const refreshToken = 'valid-refresh-token';
      sinon.stub(refreshTokenTemporaryStorage, 'get').resolves();
      sinon.stub(refreshTokenTemporaryStorage, 'delete');
      sinon.stub(userRefreshTokensTemporaryStorage, 'lrem');

      // when
      await refreshTokenService.revokeRefreshToken({ refreshToken });

      // then
      expect(userRefreshTokensTemporaryStorage.lrem).to.not.have.been.called;
      expect(refreshTokenTemporaryStorage.delete).to.not.have.been.called;
    });
  });

  describe('#revokeRefreshTokensForUserId', function () {
    it('should remove refresh tokens for given userId from temporary storage', async function () {
      // given
      sinon.stub(userRefreshTokensTemporaryStorage, 'lrange').resolves(['123:uuid1', '123:uuid2']);
      sinon.stub(userRefreshTokensTemporaryStorage, 'delete');
      sinon.stub(refreshTokenTemporaryStorage, 'delete');

      // when
      await refreshTokenService.revokeRefreshTokensForUserId({ userId: '123' });

      // then
      expect(userRefreshTokensTemporaryStorage.lrange).to.have.been.calledWith('123');
      expect(userRefreshTokensTemporaryStorage.delete).to.have.been.calledWith('123');
      expect(refreshTokenTemporaryStorage.delete).to.have.been.calledWith('123:uuid1');
      expect(refreshTokenTemporaryStorage.delete).to.have.been.calledWith('123:uuid2');
    });
  });
});
