import { expect } from 'chai';

import { RevokeAllAnonymizedUserTokenEventHandler } from '../../../../src/identity-access-management/application/jobs/revoke-all-anonymized-user-token.event-handler.js';
import { RefreshToken } from '../../../../src/identity-access-management/domain/models/RefreshToken.js';
import { refreshTokenRepository } from '../../../../src/identity-access-management/infrastructure/repositories/refresh-token.repository.js';
import { temporaryStorage } from '../../../../src/shared/infrastructure/key-value-storages/index.js';

const refreshTokenTemporaryStorage = temporaryStorage.withPrefix('refresh-tokens:');
const userRefreshTokensTemporaryStorage = temporaryStorage.withPrefix('user-refresh-tokens:');

describe('Integration | Identity Access Management | Application | revoke-all-anonymized-user-token-event-handler', function () {
  beforeEach(async function () {
    await refreshTokenTemporaryStorage.flushAll();
    await userRefreshTokensTemporaryStorage.flushAll();
  });

  describe('#handle', function () {
    it('should revoke all the refresh tokens of the user', async function () {
      // given
      const refreshToken = RefreshToken.generate({
        userId: 111111,
        scope: 'scope!',
        source: 'source!',
        audience: 'https://app.pix.fr',
        sessionId: 'sessionId!',
      });
      await refreshTokenRepository.save({ refreshToken });

      // when
      const handler = new RevokeAllAnonymizedUserTokenEventHandler();
      await handler.handle({ data: { userId: 111111 } });

      // then
      const result = await refreshTokenRepository.findAllByUserId({
        userId: 111111,
      });
      expect(result).to.be.empty;
    });
  });
});
