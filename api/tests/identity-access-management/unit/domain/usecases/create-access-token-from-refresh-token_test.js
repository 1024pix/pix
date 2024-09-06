import { createAccessTokenFromRefreshToken } from '../../../../../src/identity-access-management/domain/usecases/create-access-token-from-refresh-token.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCases | create-access-token-from-refresh-token', function () {
  context('when refresh token is provided', function () {
    it('should create a new access token', async function () {
      // given
      const accessToken = 'valid access token';
      const expirationDelaySeconds = 1;

      const refreshToken = 'valid refresh token';
      const scope = 'mon-pix';
      const refreshTokenService = { createAccessTokenFromRefreshToken: sinon.stub() };
      refreshTokenService.createAccessTokenFromRefreshToken
        .withArgs({ refreshToken, scope })
        .returns({ accessToken, expirationDelaySeconds });

      // when
      const createdAccessToken = await createAccessTokenFromRefreshToken({ refreshToken, scope, refreshTokenService });

      // then
      expect(createdAccessToken).to.deep.equal({ accessToken, expirationDelaySeconds });
    });
  });
});
