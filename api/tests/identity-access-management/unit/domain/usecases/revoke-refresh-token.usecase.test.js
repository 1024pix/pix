import { revokeRefreshToken } from '../../../../../src/identity-access-management/domain/usecases/revoke-refresh-token.usecase.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | revoke-refresh-token', function () {
  it('revokes refresh token', async function () {
    // given
    const refreshToken = 'valid refresh token';
    const refreshTokenService = { revokeRefreshToken: sinon.stub() };
    refreshTokenService.revokeRefreshToken.withArgs({ refreshToken }).returns();

    // when
    await revokeRefreshToken({ refreshToken, refreshTokenService });

    // then
    expect(refreshTokenService.revokeRefreshToken).to.have.been.calledWithExactly({ refreshToken });
  });
});
