import createAccessTokenFromRefreshToken from '../../../../lib/domain/usecases/create-access-token-from-refresh-token';
import { expect, sinon } from '../../../test-helper';

describe('Unit | UseCase | create-access-token-from-refresh-token', function () {
  context('when refresh token is provided', function () {
    it('should create a new access token', async function () {
      // given
      const accessToken = 'valid access token';
      const expirationDelaySeconds = 1;

      const refreshToken = 'valid refresh token';
      const refreshTokenService = { createAccessTokenFromRefreshToken: sinon.stub() };
      refreshTokenService.createAccessTokenFromRefreshToken
        .withArgs({ refreshToken })
        .returns({ accessToken, expirationDelaySeconds });

      // when
      const createdAccessToken = await createAccessTokenFromRefreshToken({ refreshToken, refreshTokenService });

      // then
      expect(createdAccessToken).to.deep.equal({ accessToken, expirationDelaySeconds });
    });
  });
});
