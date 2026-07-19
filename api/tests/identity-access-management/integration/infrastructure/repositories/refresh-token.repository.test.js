import { RefreshToken } from '../../../../../src/identity-access-management/domain/models/RefreshToken.js';
import { refreshTokenRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/refresh-token.repository.js';
import { temporaryStorage } from '../../../../../src/shared/infrastructure/key-value-storages/index.js';
import { expect } from '../../../../test-helper.js';

const refreshTokenTemporaryStorage = temporaryStorage.withPrefix('refresh-tokens:');
const userRefreshTokensTemporaryStorage = temporaryStorage.withPrefix('user-refresh-tokens:');

describe('Integration | Identity Access Management | Infrastructure | Repository | refresh-token-repository', function () {
  beforeEach(async function () {
    await refreshTokenTemporaryStorage.flushAll();
    await userRefreshTokensTemporaryStorage.flushAll();
  });

  describe('#findByToken', function () {
    it('finds refresh token data for token', async function () {
      // given
      const refreshToken = RefreshToken.generate({
        userId: 111111,
        scope: 'scope!',
        source: 'source!',
        audience: 'https://app.pix.fr',
        sessionId: 'sessionId!',
      });
      await refreshTokenRepository.save({ refreshToken });

      const refreshToken2 = RefreshToken.generate({
        userId: 111111,
        scope: 'scope!',
        source: 'source!',
        audience: 'https://certif.pixfr',
        sessionId: 'sessionId!',
      });
      await refreshTokenRepository.save({ refreshToken: refreshToken2 });

      // when
      const result = await refreshTokenRepository.findByToken({ token: refreshToken.value });

      // then
      expect(result).to.deep.equal(refreshToken);
    });
  });

  describe('#findAllByUserId', function () {
    it('finds all refresh token data for an user id', async function () {
      // given
      const refreshToken = RefreshToken.generate({
        userId: 111111,
        scope: 'scope!',
        source: 'source!',
        audience: 'https://orga.pix.fr',
        sessionId: 'sessionId!',
      });
      await refreshTokenRepository.save({ refreshToken });

      const refreshToken2 = RefreshToken.generate({
        userId: 111111,
        scope: 'scope!',
        source: 'source!',
        audience: 'https://app.pix.fr',
        sessionId: 'sessionId!',
      });
      await refreshTokenRepository.save({ refreshToken: refreshToken2 });

      const refreshToken3 = RefreshToken.generate({
        userId: 222222,
        scope: 'scope!',
        source: 'source!',
        audience: 'https://app.pix.fr',
        sessionId: 'sessionId!',
      });
      await refreshTokenRepository.save({ refreshToken: refreshToken3 });

      // when
      const result = await refreshTokenRepository.findAllByUserId({ userId: 111111 });

      // then
      expect(result).to.deep.equal([refreshToken2, refreshToken]);
    });
  });

  describe('#save', function () {
    it('saves a refresh token', async function () {
      // given
      const refreshToken = RefreshToken.generate({
        userId: 111111,
        scope: 'scope!',
        source: 'source!',
        audience: 'https://app.pix.fr',
        sessionId: 'sessionId!',
      });

      // when
      await refreshTokenRepository.save({ refreshToken });

      // then
      const result = await refreshTokenRepository.findAllByUserId({ userId: 111111 });
      expect(result).to.deep.equal([refreshToken]);
    });
  });

  describe('#revokeByToken', function () {
    it('revokes a refresh token', async function () {
      // given
      const refreshToken1 = RefreshToken.generate({
        userId: 111111,
        scope: 'scope!',
        source: 'source!',
        audience: 'https://app.pix.fr',
        sessionId: 'sessionId!',
      });
      await refreshTokenRepository.save({ refreshToken: refreshToken1 });
      const refreshToken2 = RefreshToken.generate({
        userId: 111111,
        scope: 'scope!',
        source: 'source!',
        audience: 'https://orga.pix.fr',
        sessionId: 'sessionId!',
      });
      await refreshTokenRepository.save({ refreshToken: refreshToken2 });

      // when
      await refreshTokenRepository.revokeByToken({ token: refreshToken1.value });

      // then
      const result = await refreshTokenRepository.findAllByUserId({ userId: 111111 });
      expect(result).to.deep.equal([refreshToken2]);
    });
  });

  describe('#revokeAllByUserId', function () {
    it('revokes all refresh tokens for a user ID', async function () {
      // given
      const refreshToken1 = RefreshToken.generate({
        userId: 111111,
        scope: 'scope!',
        source: 'source!',
        audience: 'https://app.pix.fr',
        sessionId: 'sessionId!',
      });
      await refreshTokenRepository.save({ refreshToken: refreshToken1 });
      const refreshToken2 = RefreshToken.generate({
        userId: 111111,
        scope: 'scope!',
        source: 'source!',
        audience: 'https://app.pix.fr',
        sessionId: 'sessionId!',
      });
      await refreshTokenRepository.save({ refreshToken: refreshToken2 });
      const refreshToken3 = RefreshToken.generate({
        userId: 222222,
        scope: 'scope!',
        source: 'source!',
        audience: 'https://certif.pixfr',
        sessionId: 'sessionId!',
      });
      await refreshTokenRepository.save({ refreshToken: refreshToken3 });

      // when
      await refreshTokenRepository.revokeAllByUserId({ userId: refreshToken1.userId });

      // then
      const userTokensDeleted = await refreshTokenRepository.findAllByUserId({ userId: 111111 });
      expect(userTokensDeleted).to.deep.equal([]);

      const otherUserTokens = await refreshTokenRepository.findAllByUserId({ userId: 222222 });
      expect(otherUserTokens).to.deep.equal([refreshToken3]);
    });
  });
});
