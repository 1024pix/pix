const createAccessTokenFromRefreshToken = require('../../../../lib/domain/usecases/create-access-token-from-refresh-token');
const { expect, sinon } = require('../../../test-helper');

describe('Unit | UseCase | create-access-token-from-refresh-token', function () {
  context('when refresh token is provided', function () {
    it('should create a new access token', async function () {
      // given
      const validAccessToken = 'valid access token';
      const refreshToken = 'valid refresh token';
      const refreshTokenService = { createAccessTokenFromRefreshToken: sinon.stub() };
      refreshTokenService.createAccessTokenFromRefreshToken.withArgs({ refreshToken }).returns(validAccessToken);

      // when
      const createdAccessToken = await createAccessTokenFromRefreshToken({ refreshToken, refreshTokenService });

      // then
      expect(createdAccessToken).to.be.equal(validAccessToken);
    });
  });
});
