import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { updateUserForAccountRecovery } from '../../../../../src/identity-access-management/domain/usecases/update-user-for-account-recovery.usecase.js';
import { accountRecoveryDemandRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/account-recovery-demand.repository.js';
import * as authenticationMethodRepository from '../../../../../src/identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import * as userRepository from '../../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import { cryptoService } from '../../../../../src/shared/domain/services/crypto-service.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Domain | UseCase | update-user-for-account-recovery', function () {
  context('when domain transaction throw an error', function () {
    it('rollbacks update user account', async function () {
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
            cryptoService,
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
});
