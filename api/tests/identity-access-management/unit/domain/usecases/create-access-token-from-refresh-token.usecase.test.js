import { RefreshToken } from '../../../../../src/identity-access-management/domain/models/RefreshToken.js';
import { createAccessTokenFromRefreshToken } from '../../../../../src/identity-access-management/domain/usecases/create-access-token-from-refresh-token.usecase.js';
import { UnauthorizedError } from '../../../../../src/shared/application/http-errors.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCases | create-access-token-from-refresh-token', function () {
  context('when refresh token is valid', function () {
    it('creates a new access token', async function () {
      // given
      const userId = '123';
      const accessToken = 'valid access token';
      const expirationDelaySeconds = 1;
      const scope = 'mon-pix';
      const source = 'pix';

      const refreshToken = RefreshToken.generate({ userId, scope, source });

      const refreshTokenRepository = { findByToken: sinon.stub() };
      refreshTokenRepository.findByToken.withArgs({ token: refreshToken.value }).resolves(refreshToken);

      const tokenService = { createAccessTokenFromUser: sinon.stub() };
      tokenService.createAccessTokenFromUser.withArgs(userId, source).resolves({ accessToken, expirationDelaySeconds });

      // when
      const createdAccessToken = await createAccessTokenFromRefreshToken({
        refreshToken: refreshToken.value,
        scope,
        refreshTokenRepository,
        tokenService,
      });

      // then
      expect(createdAccessToken).to.deep.equal({ accessToken, expirationDelaySeconds });
    });
  });

  context('when refresh token is not valid', function () {
    it('throws an unauthorized error ', async function () {
      // given
      const userId = '123';
      const accessToken = 'valid access token';
      const expirationDelaySeconds = 1;
      const scope = 'mon-pix';
      const source = 'pix';

      const refreshToken = RefreshToken.generate({ userId, scope, source });

      const refreshTokenRepository = { findByToken: sinon.stub() };
      refreshTokenRepository.findByToken.withArgs({ token: refreshToken.value }).resolves(null);

      const tokenService = { createAccessTokenFromUser: sinon.stub() };
      tokenService.createAccessTokenFromUser.withArgs(userId, source).resolves({ accessToken, expirationDelaySeconds });

      // when
      const error = await catchErr(createAccessTokenFromRefreshToken)({
        refreshToken: refreshToken.value,
        scope,
        refreshTokenRepository,
        tokenService,
      });

      // then
      expect(error).to.instanceOf(UnauthorizedError);
      expect(error.message).to.equal('Refresh token is invalid');
      expect(error.code).to.equal('INVALID_REFRESH_TOKEN');
    });
  });

  context('when the refresh token scope is not the same', function () {
    it('throws an unauthorized error', async function () {
      // given
      const userId = '123';
      const accessToken = 'valid access token';
      const expirationDelaySeconds = 1;
      const scope = 'mon-pix';
      const source = 'pix';

      const refreshToken = RefreshToken.generate({ userId, scope, source });

      const refreshTokenRepository = { findByToken: sinon.stub() };
      refreshTokenRepository.findByToken.withArgs({ token: refreshToken.value }).resolves(refreshToken);

      const tokenService = { createAccessTokenFromUser: sinon.stub() };
      tokenService.createAccessTokenFromUser.withArgs(userId, source).resolves({ accessToken, expirationDelaySeconds });

      // when
      const error = await catchErr(createAccessTokenFromRefreshToken)({
        refreshToken: refreshToken.value,
        scope: 'pix-orga',
        refreshTokenRepository,
        tokenService,
      });

      // then
      expect(error).to.instanceOf(UnauthorizedError);
      expect(error.message).to.equal('Refresh token is invalid');
      expect(error.code).to.equal('INVALID_REFRESH_TOKEN');
    });
  });
});
