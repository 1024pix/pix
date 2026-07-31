import { RefreshToken } from '../../../../../src/identity-access-management/domain/models/RefreshToken.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { refreshTokenRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/refresh-token.repository.js';
import { revokedUserAccessRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/revoked-user-access.repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Domain | UseCase | revoke-access-for-users', function () {
  it('revokes access token, refresh token and password', async function () {
    // given
    const initialHashedPassword = 'example-of-an-hashed-password';
    const userId = databaseBuilder.factory.buildUser().id;
    const authenticationMethod =
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId,
        hashedPassword: initialHashedPassword,
      });
    const refreshToken = RefreshToken.generate({
      userId,
      audience: 'https://app.dev.pix.fr',
      source: 'pix',
      sessionId: 'random-session-id',
    });
    await refreshTokenRepository.save({ refreshToken });
    await databaseBuilder.commit();

    // when
    await usecases.revokeAccessForUsers({ userIds: [userId] });

    // then
    const revokedUserAccess = await revokedUserAccessRepository.findByUserId(userId);
    expect(revokedUserAccess.revokeTimeStamp).to.be.a('number');

    const refreshTokens = await refreshTokenRepository.findAllByUserId(userId);
    expect(refreshTokens).to.have.lengthOf(0);

    const updatedAuthenticationMethod = await knex('authentication-methods')
      .where({ id: authenticationMethod.id })
      .first();
    expect(updatedAuthenticationMethod.authenticationComplement.password).to.equal('[revoked]');
    expect(updatedAuthenticationMethod.authenticationComplement.revokedHashedPassword).to.equal(initialHashedPassword);
  });

  context('when a user does not have a Pix Authentication method and refresh token', function () {
    it('revokes access token only', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const refreshToken = RefreshToken.generate({
        userId,
        source: 'pix',
        audience: 'https://app.dev.pix.fr',
        sessionId: 'random-session-id',
      });
      await refreshTokenRepository.save({ refreshToken });
      await databaseBuilder.commit();

      // when
      await usecases.revokeAccessForUsers({ userIds: [userId] });

      // then
      const revokedUserAccess = await revokedUserAccessRepository.findByUserId(userId);
      expect(revokedUserAccess.revokeTimeStamp).to.be.a('number');
    });
  });
});
