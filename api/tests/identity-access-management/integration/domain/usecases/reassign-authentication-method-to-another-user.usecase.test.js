import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { AuthenticationMethodAlreadyExistsError, UserNotFoundError } from '../../../../../src/shared/domain/errors.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Domain | UseCase | reassign-authentication-method-to-another-user', function () {
  it('updates authentication method user id and clears lastLoggedAt if existing', async function () {
    // given
    const authenticationProviderToReassign = 'myGenericOidcProviderCode';
    const otherAuthenticationProvider = 'yourGenericOidcProviderCode';

    const lastLoggedAtFromOriginUser = new Date(2024, 4, 14);
    const lastLoggedAtFromTargetUser = new Date(2025, 11, 1);

    const originUserId = databaseBuilder.factory.buildUser({ id: 1 }).id;
    const targetUserId = databaseBuilder.factory.buildUser({ id: 2 }).id;

    const authenticationMethodFromOriginUser = databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
      identityProvider: authenticationProviderToReassign,
      userId: originUserId,
      lastLoggedAt: lastLoggedAtFromOriginUser,
    });
    const authenticationMethodFromTargetUser = databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
      identityProvider: otherAuthenticationProvider,
      userId: targetUserId,
      lastLoggedAt: lastLoggedAtFromTargetUser,
    });

    await databaseBuilder.commit();

    // when
    await usecases.reassignAuthenticationMethodToAnotherUser({
      originUserId: originUserId,
      targetUserId: targetUserId,
      authenticationMethodId: authenticationMethodFromOriginUser.id,
    });

    // then
    const foundAuthenticationMethodWithProviderToReassign = await knex('authentication-methods')
      .where({ identityProvider: authenticationProviderToReassign })
      .first();
    expect(foundAuthenticationMethodWithProviderToReassign).to.include({
      id: authenticationMethodFromOriginUser.id,
      userId: targetUserId,
      identityProvider: authenticationProviderToReassign,
    });
    expect(foundAuthenticationMethodWithProviderToReassign.lastLoggedAt).to.equal(null);

    const foundAuthenticationMethodWithOtherProvider = await knex('authentication-methods')
      .where({ identityProvider: otherAuthenticationProvider })
      .first();
    expect(foundAuthenticationMethodWithOtherProvider).to.include({
      id: authenticationMethodFromTargetUser.id,
      userId: targetUserId,
      identityProvider: otherAuthenticationProvider,
    });
    expect(foundAuthenticationMethodWithOtherProvider.lastLoggedAt.getTime()).to.equal(
      lastLoggedAtFromTargetUser.getTime(),
    );
  });
  context('When target user already has an authentication method with same identity provider', function () {
    it('throws an error', async function () {
      // given
      const authenticationProviderToReassign = 'aGenericOidcProviderCode';

      const lastLoggedAtFromOriginUser = new Date(2024, 4, 14);
      const lastLoggedAtFromTargetUser = new Date(2025, 11, 1);

      const originUserId = databaseBuilder.factory.buildUser({ id: 1 }).id;
      const targetUserId = databaseBuilder.factory.buildUser({ id: 2 }).id;

      const authenticationMethodFromOriginUser = databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider(
        {
          identityProvider: authenticationProviderToReassign,
          userId: originUserId,
          lastLoggedAt: lastLoggedAtFromOriginUser,
        },
      );
      databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
        identityProvider: authenticationProviderToReassign,
        userId: targetUserId,
        lastLoggedAt: lastLoggedAtFromTargetUser,
      });

      await databaseBuilder.commit();

      // when & then
      await expect(
        usecases.reassignAuthenticationMethodToAnotherUser({
          originUserId,
          targetUserId,
          authenticationMethodId: authenticationMethodFromOriginUser.id,
        }),
      ).to.be.rejectedWith(
        AuthenticationMethodAlreadyExistsError,
        "L'utilisateur 2 a déjà une méthode de connexion aGenericOidcProviderCode.",
      );
    });
  });

  context('When target user does not exists', function () {
    it('throws an error', async function () {
      // given
      const authenticationProviderToReassign = 'aGenericOidcProviderCode';

      const lastLoggedAtFromOriginUser = new Date(2024, 4, 14);

      const originUserId = databaseBuilder.factory.buildUser({ id: 1 }).id;

      const authenticationMethodFromOriginUser = databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider(
        {
          identityProvider: authenticationProviderToReassign,
          userId: originUserId,
          lastLoggedAt: lastLoggedAtFromOriginUser,
        },
      );

      await databaseBuilder.commit();

      const nonExistingTargetUserId = originUserId + 1;

      // when & then
      await expect(
        usecases.reassignAuthenticationMethodToAnotherUser({
          originUserId,
          targetUserId: nonExistingTargetUserId,
          authenticationMethodId: authenticationMethodFromOriginUser.id,
        }),
      ).to.be.rejectedWith(UserNotFoundError);
    });
  });
});
