import { RefreshToken } from '../../../../../src/identity-access-management/domain/models/RefreshToken.js';
import { UserAccessToken } from '../../../../../src/identity-access-management/domain/models/UserAccessToken.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { refreshTokenRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/refresh-token.repository.js';
import { UnauthorizedError } from '../../../../../src/shared/application/errors/http-errors.js';
import { temporaryStorage } from '../../../../../src/shared/infrastructure/key-value-storages/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Identity Access Management | Domain | UseCases | create-access-token-from-refresh-token', function () {
  let userId;
  const locale = 'fr-FR';

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser({ locale }).id;
    databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId });
    await databaseBuilder.commit();
    await temporaryStorage.flushAll();
  });

  context('when refresh token is valid', function () {
    it('creates a new access token', async function () {
      // given
      const source = 'pix';
      const audience = 'https://app.pix.fr';
      const sessionId = 'session-id';

      const refreshToken = RefreshToken.generate({ userId, source, audience, sessionId });
      await refreshTokenRepository.save({ refreshToken });

      // when
      const { accessToken, expirationDelaySeconds } = await usecases.createAccessTokenFromRefreshToken({
        refreshToken: refreshToken.value,
        audience,
        locale,
      });

      // then
      expect(accessToken).to.be.a('string');
      expect(expirationDelaySeconds).to.be.a('number');
      const decodedAccessToken = UserAccessToken.decode(accessToken);
      expect(decodedAccessToken.sessionId).to.equal(sessionId);
    });
  });

  context('when refresh token is not valid', function () {
    it('throws an unauthorized error ', async function () {
      // given
      const audience = 'https://app.pix.fr';
      const unknownRefreshToken = 'unknown-refresh-token';

      // when
      const error = await catchErr(usecases.createAccessTokenFromRefreshToken)({
        refreshToken: unknownRefreshToken,
        audience,
        locale,
      });

      // then
      expect(error).to.instanceOf(UnauthorizedError);
      expect(error.message).to.equal('Refresh token is invalid');
      expect(error.code).to.equal('INVALID_REFRESH_TOKEN');
    });
  });

  context('when the refresh token audience is not the same', function () {
    it('throws an unauthorized error', async function () {
      // given
      const source = 'pix';
      const audience = 'https://app.pix.fr';
      const badAudience = 'https://orga.pix.fr';

      const refreshToken = RefreshToken.generate({ userId, source, audience, sessionId: 'session-id' });
      await refreshTokenRepository.save({ refreshToken });

      // when
      const error = await catchErr(usecases.createAccessTokenFromRefreshToken)({
        refreshToken: refreshToken.value,
        audience: badAudience,
        locale,
      });

      // then
      expect(error).to.instanceOf(UnauthorizedError);
      expect(error.message).to.equal('Refresh token is invalid');
      expect(error.code).to.equal('INVALID_REFRESH_TOKEN');
    });
  });

  context('when the user locale is different from the given locale', function () {
    it('updates the user locale with the formatted value', async function () {
      // given
      const source = 'pix';
      const audience = 'https://app.pix.fr';
      const newLocale = 'fr-BE';

      const refreshToken = RefreshToken.generate({ userId, source, audience, sessionId: 'session-id' });
      await refreshTokenRepository.save({ refreshToken });

      // when
      await usecases.createAccessTokenFromRefreshToken({
        refreshToken: refreshToken.value,
        audience,
        locale: newLocale,
      });

      // then
      const user = await knex('users').where({ id: userId }).first();
      expect(user.locale).to.equal(newLocale);
    });
  });

  context('when the user locale is the same as the given locale', function () {
    it("doesn't update the user locale", async function () {
      // given
      const source = 'pix';
      const audience = 'https://app.pix.fr';
      const initialLocale = 'fr-FR';

      const refreshToken = RefreshToken.generate({ userId, source, audience, sessionId: 'session-id' });
      await refreshTokenRepository.save({ refreshToken });

      // when
      await usecases.createAccessTokenFromRefreshToken({
        refreshToken: refreshToken.value,
        audience,
        locale: initialLocale,
      });

      // then
      const user = await knex('users').where({ id: userId }).first();
      expect(user.locale).to.equal(initialLocale);
    });
  });
});
