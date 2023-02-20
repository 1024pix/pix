import { catchErr, databaseBuilder, expect, knex } from '../../../../test-helper';
import DomainTransaction from '../../../../../lib/infrastructure/DomainTransaction';
import authenticationMethodRepository from '../../../../../lib/infrastructure/repositories/authentication-method-repository';
import accountRecoveryDemandRepository from '../../../../../lib/infrastructure/repositories/account-recovery-demand-repository';
import userRepository from '../../../../../lib/infrastructure/repositories/user-repository';
import encryptionService from '../../../../../lib/domain/services/encryption-service';
import updateUserForAccountRecovery from '../../../../../lib/domain/usecases/account-recovery/update-user-for-account-recovery';

describe('Integration | UseCases | Account-recovery | updateUserForAccountRecovery', function () {
  it('should rollback update user account when domain transaction throw an error', async function () {
    // given
    const password = 'pix123';
    const user = databaseBuilder.factory.buildUser();
    await databaseBuilder.commit();
    const authenticatedMethod =
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId: user.id,
      });
    await databaseBuilder.commit();
    const accountRecovery = databaseBuilder.factory.buildAccountRecoveryDemand({ userId: user.id });
    await databaseBuilder.commit();

    // when
    await catchErr(async () => {
      await DomainTransaction.execute(async (domainTransaction) => {
        await updateUserForAccountRecovery({
          password,
          temporaryKey: accountRecovery.temporaryKey,
          userRepository,
          authenticationMethodRepository,
          accountRecoveryDemandRepository,
          encryptionService,
          domainTransaction,
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
