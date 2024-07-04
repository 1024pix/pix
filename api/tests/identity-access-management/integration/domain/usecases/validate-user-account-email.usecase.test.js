import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { emailValidationDemandRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/email-validation-demand.repository.js';
import * as userRepository from '../../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Domain | UseCase | validate-user-account-email', function () {
  context('when the email validation demand exists', function () {
    it('validates user email, removes the demand and does not return', async function () {
      // given
      const user = databaseBuilder.factory.buildUser({ email: 'email@example.net' });
      await databaseBuilder.commit();
      const token = await emailValidationDemandRepository.save(user.id);

      // when
      const redirectionUrl = await usecases.validateUserAccountEmail({
        token,
        redirectUrl: 'https://test.com',
      });

      // then
      const updatedUser = await userRepository.get(user.id);
      const emailValidationDemand = await emailValidationDemandRepository.get(token);

      expect(redirectionUrl).to.equal('https://test.com');
      expect(updatedUser.emailConfirmedAt).to.be.a('Date');
      expect(emailValidationDemand).to.be.null;
    });
  });
});
