import { refreshTokenService } from '../../../../../src/identity-access-management/domain/services/refresh-token-service.js';
import { UnauthorizedError } from '../../../../../src/shared/application/http-errors.js';
import { temporaryStorage } from '../../../../../src/shared/infrastructure/temporary-storage/index.js';
import { catchErr, expect } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Domain | Service | refresh-token-service', function () {
  afterEach(async function () {
    await temporaryStorage.flushAll();
  });

  describe('#createRefreshTokenFromUserId', function () {
    context('when an application scope is given', function () {
      it('generates a refresh token <user-id>:<scope>:<uuid>', async function () {
        // given
        const userId = '123';
        const source = 'APP';
        const scope = 'pix-orga';
        const uuidGenerator = () => 'XXX-123-456';

        // when
        const refreshToken = await refreshTokenService.createRefreshTokenFromUserId({
          userId,
          source,
          scope,
          uuidGenerator,
        });

        // then
        expect(refreshToken).to.equal('123:pix-orga:XXX-123-456');

        const refreshTokenInDb = await refreshTokenService.findByRefreshToken(refreshToken);
        expect(refreshTokenInDb).to.deep.equal({ type: 'refresh_token', source, scope, userId });

        const refreshTokensInDb = await refreshTokenService.findByUserId(userId);
        expect(refreshTokensInDb).to.deep.equal(['123:pix-orga:XXX-123-456']);
      });
    });

    context('when no application scope is given (legacy)', function () {
      it('generates a refresh token <user-id>:<uuid>', async function () {
        // given
        const userId = '123';
        const source = 'APP';
        const uuidGenerator = () => 'XXX-123-456';

        // when
        const refreshToken = await refreshTokenService.createRefreshTokenFromUserId({ userId, source, uuidGenerator });

        // then
        expect(refreshToken).to.equal('123:XXX-123-456');

        const refreshTokenInDb = await refreshTokenService.findByRefreshToken(refreshToken);
        expect(refreshTokenInDb).to.deep.equal({ type: 'refresh_token', source, userId });

        const refreshTokensInDb = await refreshTokenService.findByUserId(userId);
        expect(refreshTokensInDb).to.deep.equal(['123:XXX-123-456']);
      });
    });
  });

  describe('#createAccessTokenFromRefreshToken', function () {
    context('with refresh token containing a scope', function () {
      it('generates an access token from a valid legacy refresh token', async function () {
        // given
        const userId = '123';
        const source = 'APP';
        const scope = 'pix-orga';
        const uuidGenerator = () => 'XXX-123-456';
        const refreshToken = await refreshTokenService.createRefreshTokenFromUserId({
          userId,
          source,
          scope,
          uuidGenerator,
        });

        // when
        const { accessToken } = await refreshTokenService.createAccessTokenFromRefreshToken({ refreshToken, scope });

        // then
        expect(accessToken).to.be.a.string;
      });

      context('when the scope is different from the refresh token scope', function () {
        it('throws an error', async function () {
          // given
          const userId = '123';
          const source = 'APP';
          const scope = 'pix-orga';
          const differentScope = 'pix-admin';
          const uuidGenerator = () => 'XXX-123-456';
          const refreshToken = await refreshTokenService.createRefreshTokenFromUserId({
            userId,
            source,
            scope,
            uuidGenerator,
          });

          // when
          const error = await catchErr(refreshTokenService.createAccessTokenFromRefreshToken)({
            refreshToken,
            scope: differentScope,
          });

          // then
          expect(error).to.be.instanceOf(UnauthorizedError);
          expect(error.message).to.be.equal('Refresh token is invalid');
          expect(error.code).to.be.equal('INVALID_REFRESH_TOKEN');
        });
      });

      context('when refresh token is invalid', function () {
        it('throws an error', async function () {
          // when
          const error = await catchErr(refreshTokenService.createAccessTokenFromRefreshToken)({
            refreshToken: 'BLABLA',
          });

          // then
          expect(error).to.be.instanceOf(UnauthorizedError);
          expect(error.message).to.be.equal('Refresh token is invalid');
          expect(error.code).to.be.equal('INVALID_REFRESH_TOKEN');
        });
      });
    });
    context('with legacy refresh token (without scope)', function () {
      it('generates an access token from a valid legacy refresh token', async function () {
        // given
        const userId = '123';
        const source = 'APP';
        const scope = 'pix-orga';
        const uuidGenerator = () => 'XXX-123-456';
        const refreshToken = await refreshTokenService.createRefreshTokenFromUserId({ userId, source, uuidGenerator });

        // when
        const { accessToken } = await refreshTokenService.createAccessTokenFromRefreshToken({ refreshToken, scope });

        // then
        expect(accessToken).to.be.a.string;
      });

      context('when refresh token is invalid', function () {
        it('throws an error', async function () {
          // when
          const error = await catchErr(refreshTokenService.createAccessTokenFromRefreshToken)({
            refreshToken: 'BLABLA',
          });

          // then
          expect(error).to.be.instanceOf(UnauthorizedError);
          expect(error.message).to.be.equal('Refresh token is invalid');
          expect(error.code).to.be.equal('INVALID_REFRESH_TOKEN');
        });
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
