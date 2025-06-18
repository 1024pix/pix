import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { catchErr, databaseBuilder, expect, knex, sinon } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Domain | UseCase | update-user-for-account-recovery', function () {
  context('when domain transaction throw an error', function () {
    it('rollbacks update user account', async function () {
      // given
      const password = 'pix123';
      const user = databaseBuilder.factory.buildUser();
      const authenticatedMethod =
        databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
          userId: user.id,
        });
      const accountRecovery = databaseBuilder.factory.buildAccountRecoveryDemand({ userId: user.id });
      await databaseBuilder.commit();

      // when
      await catchErr(async () => {
        await DomainTransaction.execute(async () => {
          await usecases.updateUserForAccountRecovery({
            password,
            temporaryKey: accountRecovery.temporaryKey,
          });
          throw new Error('an error occurs within the domain transaction');
        });
      });

      // then
      const userUpdated = await knex('users');
      const accountRecoveryDemand = await knex('account-recovery-demands');
      const authenticationMethod = await knex('authentication-methods');

      expect(userUpdated).to.have.lengthOf(1);
      expect(accountRecoveryDemand).to.have.lengthOf(1);
      expect(authenticationMethod).to.have.lengthOf(1);

      expect(userUpdated[0].email).to.equal(user.email);
      expect(userUpdated[0].emailConfirmedAt).to.be.null;
      expect(userUpdated[0].cgu).to.be.equal(user.cgu);
      expect(accountRecoveryDemand[0].used).to.be.false;
      expect(authenticationMethod[0].password).to.equal(authenticatedMethod.password);
    });
  });

  context('success cases', function () {
    let clock;
    let now;

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now: new Date(), toFake: ['Date'] });
      now = new Date(clock.now);
    });

    afterEach(function () {
      clock.restore();
    });

    context('when user has no Pix authentication method', function () {
      it('adds Pix authentication method', async function () {
        // given
        const password = 'pix123';
        const user = databaseBuilder.factory.buildUser.withoutPixAuthenticationMethod();
        const demand = databaseBuilder.factory.buildAccountRecoveryDemand({ userId: user.id, oldEmail: null });
        await databaseBuilder.commit();
        const temporaryKey = demand.temporaryKey;

        // when
        await usecases.updateUserForAccountRecovery({
          password,
          temporaryKey,
        });

        // then
        const pixAuthenticationMethod = await knex('authentication-methods')
          .where({ identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code })
          .first();
        expect(pixAuthenticationMethod).to.include({
          userId: user.id,
        });
      });
    });

    context('when user has Pix authentication method', function () {
      it('updates only password', async function () {
        // given
        const newPassword = 'pix123';
        const user = databaseBuilder.factory.buildUser();
        const authenticationMethod =
          databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
            userId: user.id,
          });
        const accountRecoveryDemand = databaseBuilder.factory.buildAccountRecoveryDemand({
          userId: user.id,
          oldEmail: null,
        });
        await databaseBuilder.commit();

        // when
        await usecases.updateUserForAccountRecovery({
          password: newPassword,
          temporaryKey: accountRecoveryDemand.temporaryKey,
        });

        // then
        const updatedAuthenticationMethods = await knex('authentication-methods').where({
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
        });
        expect(updatedAuthenticationMethods).to.have.lengthOf(1);

        const updatedAuthenticationMethod = updatedAuthenticationMethods[0];
        expect(updatedAuthenticationMethod).to.include({ userId: user.id });
        expect(updatedAuthenticationMethod.authenticationComplement.password).to.not.equal(
          authenticationMethod.authenticationComplement.password,
        );
      });
    });

    context('when user has GAR authentication method', function () {
      it('sets username to null and removes GAR authentication method', async function () {
        // given

        const password = 'pix123';
        const user = databaseBuilder.factory.buildUser({ email: null });
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });
        const accountRecoveryDemand = databaseBuilder.factory.buildAccountRecoveryDemand({
          userId: user.id,
          oldEmail: null,
        });
        await databaseBuilder.commit();

        // when
        await usecases.updateUserForAccountRecovery({
          password,
          temporaryKey: accountRecoveryDemand.temporaryKey,
        });

        // then
        const foundUser = await knex('users').where({ id: user.id }).first();
        const removedGarAuthenticationMethod = await knex('authentication-methods')
          .where({ userId: user.id, identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR })
          .first();

        expect(foundUser.username).to.be.null;
        expect(removedGarAuthenticationMethod).to.not.exist;
      });
    });

    it('updates user values', async function () {
      // given
      const password = 'pix123';
      const user = databaseBuilder.factory.buildUser({ email: 'oldEmail@example.net' });
      const accountRecoveryDemand = databaseBuilder.factory.buildAccountRecoveryDemand({
        userId: user.id,
        oldEmail: 'oldEmail@example.net',
        newEmail: 'newEmail@example.net',
      });
      await databaseBuilder.commit();

      // when
      await usecases.updateUserForAccountRecovery({
        password,
        temporaryKey: accountRecoveryDemand.temporaryKey,
      });

      // then
      const foundUser = await knex('users').where({ id: user.id }).first();
      expect(foundUser.cgu).to.be.true;
      expect(foundUser).to.include({ email: 'newemail@example.net' });
      expect(foundUser.emailConfirmedAt).to.deep.equal(now);
      expect(foundUser.lastTermsOfServiceValidatedAt).to.deep.equal(now);
    });

    it('marks account recovery demand as being used', async function () {
      // given
      const password = 'pix123';
      const user = databaseBuilder.factory.buildUser();
      const accountRecoveryDemand = databaseBuilder.factory.buildAccountRecoveryDemand({
        userId: user.id,
        oldEmail: null,
      });
      await databaseBuilder.commit();

      // when
      await usecases.updateUserForAccountRecovery({
        password,
        temporaryKey: accountRecoveryDemand.temporaryKey,
      });

      // then
      const updatedRecoveryDemand = await knex('account-recovery-demands').where({ userId: user.id }).first();
      expect(updatedRecoveryDemand.used).to.be.true;
    });
  });
});
