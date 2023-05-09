import { revokeRefreshToken } from '../../../../lib/domain/usecases/revoke-refresh-token.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | revoke-refresh-token', function () {
  it('should revoke refresh token', async function () {
    // given
    const refreshToken = 'valid refresh token';
    const refreshTokenService = { revokeRefreshToken: sinon.stub() };
    refreshTokenService.revokeRefreshToken.withArgs({ refreshToken }).returns();

    // when
    await revokeRefreshToken({ refreshToken, refreshTokenService });

    // then
    expect(refreshTokenService.revokeRefreshToken).to.have.been.calledWith({ refreshToken });
  });
});
