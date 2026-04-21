import { InvalidOrAlreadyUsedEmailError } from '../../../../../src/identity-access-management/domain/errors.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { userEmailRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/user-email.repository.js';
import {
  EmailModificationDemandNotFoundOrExpiredError,
  InvalidVerificationCodeError,
} from '../../../../../src/shared/domain/errors.js';
import { temporaryStorage } from '../../../../../src/shared/infrastructure/key-value-storages/index.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

const verifyEmailTemporaryStorage = temporaryStorage.withPrefix('verify-email:');

describe('Integration | Identity Access Management | Domain | UseCase | addUserEmailWithValidation', function () {
  beforeEach(async function () {
    await verifyEmailTemporaryStorage.flushAll();
  });

  it('checks verification code and adds email', async function () {
    // given
    const code = '123';
    const newEmail = 'new.email@example.net';
    const user = databaseBuilder.factory.buildUser({ email: null });
    await databaseBuilder.commit();
    await userEmailRepository.saveEmailModificationDemand({
      userId: user.id,
      code,
      newEmail,
      action: 'add-email',
      passwordHash: '1234ABCD',
    });

    // when
    const result = await usecases.addUserEmailWithValidation({ userId: user.id, code });

    // then
    expect(result.email).to.equal(newEmail);

    const updatedUser = await knex('users').where({ id: user.id }).first();
    expect(updatedUser.email).to.equal(newEmail);
    expect(updatedUser.emailConfirmedAt).to.not.be.null;
    const pixAuthenticationMethod = await knex('authentication-methods')
      .where({ userId: user.id, identityProvider: 'PIX' })
      .first();
    expect(pixAuthenticationMethod).to.not.be.null;
    expect(pixAuthenticationMethod.authenticationComplement.password).to.equal('1234ABCD');
  });

  context('when the verification code is invalid', function () {
    it('throws an error', async function () {
      // given
      const code = '123';
      const invalidCode = '456';
      const user = databaseBuilder.factory.buildUser({ email: null });
      await databaseBuilder.commit();
      await userEmailRepository.saveEmailModificationDemand({
        userId: user.id,
        code,
        action: 'add-email',
        passwordHash: '1234ABCD',
      });

      // when
      const error = await catchErr(usecases.addUserEmailWithValidation)({
        userId: user.id,
        code: invalidCode,
      });

      // then
      expect(error).to.be.instanceOf(InvalidVerificationCodeError);
    });
  });

  context('when the email modification demand is not found or expired', function () {
    it('throws an error', async function () {
      // given
      const code = '123';
      const user = databaseBuilder.factory.buildUser({ email: null });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.addUserEmailWithValidation)({
        userId: user.id,
        code,
      });

      // then
      expect(error).to.be.instanceOf(EmailModificationDemandNotFoundOrExpiredError);
    });
  });

  context('when the new email is already registered for an other user', function () {
    it('throws an error', async function () {
      // given
      const code = '123';
      const alreadyExistEmail = 'already.exist.email@example.net';
      const user = databaseBuilder.factory.buildUser({ email: null });
      databaseBuilder.factory.buildUser({ email: alreadyExistEmail });
      await databaseBuilder.commit();
      await userEmailRepository.saveEmailModificationDemand({
        userId: user.id,
        code,
        newEmail: alreadyExistEmail,
        action: 'add-email',
        passwordHash: '12345ABCDE',
      });

      // when
      const error = await catchErr(usecases.addUserEmailWithValidation)({
        userId: user.id,
        code,
      });

      // then
      expect(error).to.be.instanceOf(InvalidOrAlreadyUsedEmailError);
    });
  });
});
