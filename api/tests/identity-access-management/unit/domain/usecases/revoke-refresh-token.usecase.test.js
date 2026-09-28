import { expect } from 'chai';
import sinon from 'sinon';

import { revokeRefreshToken } from '../../../../../src/identity-access-management/domain/usecases/revoke-refresh-token.usecase.js';

describe('Unit | Identity Access Management | Domain | UseCase | revoke-refresh-token', function () {
  describe('when refresh token is legacy format', function () {
    it('revokes refresh token', async function () {
      // given
      const refreshToken = '12345:f09047b9-d336-4c5e-9c9c-96b1e4a21616';
      const refreshTokenRepository = { revokeByToken: sinon.stub() };

      // when
      await revokeRefreshToken({ refreshToken, refreshTokenRepository });

      // then
      expect(refreshTokenRepository.revokeByToken).to.have.been.calledWithExactly({ token: refreshToken });
    });
  });

  describe('when refresh token isn’t legacy format', function () {
    it('does nothing', async function () {
      // given
      const refreshToken = 'I.am.JWT';
      const refreshTokenRepository = { revokeByToken: sinon.stub() };

      // when
      await revokeRefreshToken({ refreshToken, refreshTokenRepository });

      // then
      expect(refreshTokenRepository.revokeByToken).not.to.have.been.called;
    });
  });
});
