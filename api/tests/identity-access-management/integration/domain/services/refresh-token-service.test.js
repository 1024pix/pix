import { refreshTokenService } from '../../../../../src/identity-access-management/domain/services/refresh-token-service.js';
import { UnauthorizedError } from '../../../../../src/shared/application/http-errors.js';
import { temporaryStorage } from '../../../../../src/shared/infrastructure/temporary-storage/index.js';
import { catchErr, expect } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Domain | Service | refresh-token-service', function () {
  afterEach(async function () {
    await temporaryStorage.flushAll();
  });

  describe('#createRefreshTokenFromUserId', function () {
    it('generates a refresh token', async function () {
      // given
      const userId = '123';
      const source = 'APP';
      const uuidGenerator = () => 'XXX-123-456';

      // when
      const refreshToken = await refreshTokenService.createRefreshTokenFromUserId({ userId, source, uuidGenerator });

      // then
      expect(refreshToken).to.equal('123:XXX-123-456');

      const refreshTokenInDb = await refreshTokenService.findByRefreshToken(refreshToken);
      expect(refreshTokenInDb).to.deep.equal({ type: 'refresh_token', source: 'APP', userId: '123' });

      const refreshTokensInDb = await refreshTokenService.findByUserId(userId);
      expect(refreshTokensInDb).to.deep.equal(['123:XXX-123-456']);
    });
  });

  describe('#createAccessTokenFromRefreshToken', function () {
    it('generates an access token from a valid refresh token', async function () {
      // given
      const userId = '123';
      const source = 'APP';
      const uuidGenerator = () => 'XXX-123-456';
      const refreshToken = await refreshTokenService.createRefreshTokenFromUserId({ userId, source, uuidGenerator });

      // when
      const { accessToken } = await refreshTokenService.createAccessTokenFromRefreshToken({ refreshToken });

      // then
      expect(accessToken).to.be.a.string;
    });

    context('when refresh token is invalid', function () {
      it('throws an error', async function () {
        // when
        const error = await catchErr(refreshTokenService.createAccessTokenFromRefreshToken)({ refreshToken: 'BLABLA' });

        // then
        expect(error).to.be.instanceOf(UnauthorizedError);
        expect(error.message).to.be.equal('Refresh token is invalid');
        expect(error.code).to.be.equal('INVALID_REFRESH_TOKEN');
      });
    });
  });

  describe('#findByRefreshToken', function () {
    it('finds refresh token infos from the refresh token', async function () {
      // given
      const userId = '123';
      const source = 'APP';
      const uuidGenerator = () => 'XXX-123-456';
      const refreshToken = await refreshTokenService.createRefreshTokenFromUserId({ userId, source, uuidGenerator });

      // when
      const refreshTokenInDb = await refreshTokenService.findByRefreshToken(refreshToken);

      // then
      expect(refreshTokenInDb).to.deep.equal({ type: 'refresh_token', source: 'APP', userId: '123' });
    });
  });

  describe('#findByUserId', function () {
    it('finds all refresh tokens from the user id', async function () {
      // given
      const userId = '123';
      const source = 'APP';
      const source2 = 'ADMIN';
      const uuidGenerator = () => 'XXX-123-456';
      const uuidGenerator2 = () => 'AAA-123-456';
      await refreshTokenService.createRefreshTokenFromUserId({ userId, source, uuidGenerator });
      await refreshTokenService.createRefreshTokenFromUserId({
        userId,
        source: source2,
        uuidGenerator: uuidGenerator2,
      });

      // when
      const refreshTokensInDb = await refreshTokenService.findByUserId(userId);

      // then
      expect(refreshTokensInDb.sort()).to.deep.equal(['123:AAA-123-456', '123:XXX-123-456']);
    });
  });

  describe('#revokeRefreshToken', function () {
    it('revokes the given refresh token', async function () {
      // given
      const userId = '123';
      const source = 'APP';
      const source2 = 'ADMIN';
      const uuidGenerator = () => 'XXX-123-456';
      const uuidGenerator2 = () => 'AAA-123-456';
      const refreshToken = await refreshTokenService.createRefreshTokenFromUserId({ userId, source, uuidGenerator });
      await refreshTokenService.createRefreshTokenFromUserId({
        userId,
        source: source2,
        uuidGenerator: uuidGenerator2,
      });

      // when
      await refreshTokenService.revokeRefreshToken({ refreshToken });

      // then
      const refreshTokenInDb = await refreshTokenService.findByRefreshToken(refreshToken);
      expect(refreshTokenInDb).to.be.null;

      const refreshTokensInDb = await refreshTokenService.findByUserId(userId);
      expect(refreshTokensInDb).to.deep.equal(['123:AAA-123-456']);
    });
  });

  describe('#revokeRefreshTokensForUserId', function () {
    it('revokes all refresh tokens for the given user id', async function () {
      // given
      const userId = '123';
      const source = 'APP';
      const uuidGenerator = () => 'XXX-123-456';
      const refreshToken = await refreshTokenService.createRefreshTokenFromUserId({ userId, source, uuidGenerator });

      // when
      await refreshTokenService.revokeRefreshTokensForUserId({ userId });

      // then
      const refreshTokensInDb = await refreshTokenService.findByUserId(userId);
      expect(refreshTokensInDb).to.deep.equal([]);

      const refreshTokenInDb = await refreshTokenService.findByRefreshToken(refreshToken);
      expect(refreshTokenInDb).to.be.null;
    });
  });
});
