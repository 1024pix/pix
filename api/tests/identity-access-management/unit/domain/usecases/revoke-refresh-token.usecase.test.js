import { revokeRefreshToken } from '../../../../../src/identity-access-management/domain/usecases/revoke-refresh-token.usecase.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | revoke-refresh-token', function () {
  it('revokes refresh token', async function () {
    // given
    const refreshToken = 'valid refresh token';
    const refreshTokenRepository = { revokeByToken: sinon.stub() };

    // when
    await revokeRefreshToken({ refreshToken, refreshTokenRepository });

    // then
    expect(refreshTokenRepository.revokeByToken).to.have.been.calledWithExactly({ token: refreshToken });
  });
});
