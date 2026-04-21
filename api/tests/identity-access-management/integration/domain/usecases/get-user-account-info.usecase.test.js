import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management  | Domain | Usecases | get-user-account-info', function () {
  beforeEach(async function () {
    await featureToggles.set('isSelfAccountDeletionEnabled', false);
  });

  describe('when feature toggle addEmailConnectionMethodEnabled is not enabled', function () {
    it('returns user account info with canAddEmailConnectionMethod set to false', async function () {
      // given
      await featureToggles.set('addEmailConnectionMethodEnabled', false);

      const user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when
      const userAccountInfo = await usecases.getUserAccountInfo({ userId: user.id });

      // then
      expect(userAccountInfo).to.deep.equal({
        id: user.id,
        email: user.email,
        username: user.username,
        canSelfDeleteAccount: false,
      });
      expect(userAccountInfo.canAddEmailConnectionMethod).to.be.false;
    });
  });

  describe('when feature toggle addEmailConnectionMethodEnabled is enabled', function () {
    beforeEach(async function () {
      await featureToggles.set('addEmailConnectionMethodEnabled', true);
    });

    describe('when user has no email', function () {
      describe('when user has at least one authorized identity provider', function () {
        it('returns user account info with canAddEmailConnectionMethod set to true', async function () {
          // given
          const user = databaseBuilder.factory.buildUser({ email: null });
          databaseBuilder.factory.buildAuthenticationMethod.withOidcProviderAsIdentityProvider({
            userId: user.id,
            identityProvider: 'AUTHORIZED_IDENTITY_PROVIDER',
          });
          await databaseBuilder.commit();

          // when
          const userAccountInfo = await usecases.getUserAccountInfo({ userId: user.id });

          // then
          expect(userAccountInfo).to.deep.equal({
            id: user.id,
            email: null,
            username: user.username,
            canSelfDeleteAccount: false,
          });
          expect(userAccountInfo.canAddEmailConnectionMethod).to.be.true;
        });
      });

      describe('when user has no authorized identity provider', function () {
        it('returns user account info with canAddEmailConnectionMethod set to false', async function () {
          // given
          const user = databaseBuilder.factory.buildUser({ email: null });
          databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });
          await databaseBuilder.commit();

          // when
          const userAccountInfo = await usecases.getUserAccountInfo({ userId: user.id });

          // then
          expect(userAccountInfo).to.deep.equal({
            id: user.id,
            email: null,
            username: user.username,
            canSelfDeleteAccount: false,
          });
          expect(userAccountInfo.canAddEmailConnectionMethod).to.be.false;
        });
      });
    });
  });
});
