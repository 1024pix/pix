import { expect } from 'chai';

import { AnonymizeUserEventHandler } from '../../../../src/identity-access-management/application/jobs/anonymize-user.event-handler.js';
import { RefreshToken } from '../../../../src/identity-access-management/domain/models/RefreshToken.js';
import { refreshTokenRepository } from '../../../../src/identity-access-management/infrastructure/repositories/refresh-token.repository.js';
import { temporaryStorage } from '../../../../src/shared/infrastructure/key-value-storages/index.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

const refreshTokenTemporaryStorage = temporaryStorage.withPrefix('refresh-tokens:');
const userRefreshTokensTemporaryStorage = temporaryStorage.withPrefix('user-refresh-tokens:');

describe('Integration | Identity Access Management | Application | anonymize-user-event-handler', function () {
  beforeEach(async function () {
    await refreshTokenTemporaryStorage.flushAll();
    await userRefreshTokensTemporaryStorage.flushAll();
  });

  describe('#handle', function () {
    it('should anonymize the user information', async function () {
      // given
      const user = databaseBuilder.factory.buildUser({
        email: 'user@example.net',
      });
      const refreshTokenToBeSaved = RefreshToken.generate({
        userId: user.id,
        scope: 'scope!',
        source: 'source!',
        audience: 'https://app.pix.fr',
        sessionId: 'sessionId!',
      });
      await refreshTokenRepository.save({ refreshToken: refreshTokenToBeSaved });

      databaseBuilder.factory.buildUserLogin({
        userId: user.id,
        temporaryBlockedUntil: new Date(2024, 10, 5),
        blockedAt: new Date(2024, 10, 5),
        lastLoggedAt: new Date(2024, 10, 5),
      });

      const pixAgentWithAdminRole = databaseBuilder.factory.buildUser.withRole({
        role: 'SUPER_ADMIN',
      });
      databaseBuilder.factory.buildResetPasswordDemand({
        email: 'user@example.net',
      });

      databaseBuilder.factory.buildLastUserApplicationConnection({
        userId: user.id,
        application: 'PIX_APP',
        lastLoggedAt: new Date(2024, 10, 5),
      });

      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId: user.id,
      });
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });

      await databaseBuilder.commit();

      // when
      const handler = new AnonymizeUserEventHandler();
      const data = {
        userId: user.id,
        updatedByUserId: pixAgentWithAdminRole.id,
      };
      await handler.handle({ data });

      // then
      const anonymizedUser = await knex('users').where({ id: user.id }).first();

      expect(anonymizedUser.firstName).to.equal('(anonymised)');
      expect(anonymizedUser.lastName).to.equal('(anonymised)');
      expect(anonymizedUser.email).to.be.null;
      expect(anonymizedUser.username).to.be.null;
      expect(anonymizedUser.hasBeenAnonymised).to.be.true;
      expect(anonymizedUser.hasBeenAnonymisedBy).to.equal(pixAgentWithAdminRole.id);

      const resetPasswordDemands = await knex('reset-password-demands').where({
        email: 'user@example.net',
      });
      expect(resetPasswordDemands).to.have.lengthOf(0);

      const refreshToken = await refreshTokenRepository.findAllByUserId({
        userId: 111111,
      });
      expect(refreshToken).to.be.empty;

      const userLogin = await knex('user-logins').where({ userId: user.id }).first();
      expect(userLogin.temporaryBlockedUntil).to.be.null;
      expect(userLogin.blockedAt).to.be.null;
      expect(userLogin.lastLoggedAt).to.deep.equal(new Date('2024-11-01T00:00:00Z'));

      const lastUserApplicationConnection = await knex('last-user-application-connections')
        .where({ userId: user.id })
        .first();

      expect(lastUserApplicationConnection.lastLoggedAt).to.deep.equal(new Date('2024-11-01T00:00:00Z'));

      const authenticationMethods = await knex('authentication-methods').where({
        userId: user.id,
      });
      expect(authenticationMethods).to.have.lengthOf(0);
    });
  });
});
