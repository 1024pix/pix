import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import {
  EntityValidationError,
  InvalidPasswordForUpdateEmailError,
  UserNotAuthorizedToUpdateEmailError,
} from '../../../../../src/shared/domain/errors.js';
import { cryptoService } from '../../../../../src/shared/domain/services/crypto-service.js';
import { temporaryStorage } from '../../../../../src/shared/infrastructure/key-value-storages/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

const verifyEmailTemporaryStorage = temporaryStorage.withPrefix('verify-email:');

describe('Integration | Identity Access Management | Domain | UseCase | send-verification-code', function () {
  afterEach(async function () {
    await verifyEmailTemporaryStorage.flushAll();
  });

  describe("When it's an email update action", function () {
    it('sends a verification code to the user', async function () {
      // given
      const newEmail = 'user@example.net';
      const password = 'pix123';
      const locale = 'fr';
      const user = databaseBuilder.factory.buildUser.withRawPassword();
      await databaseBuilder.commit();

      // when
      await usecases.sendVerificationCode({ action: 'update-email', userId: user.id, newEmail, password, locale });

      // then
      const temporaryCodeInfo = await verifyEmailTemporaryStorage.get(user.id);
      expect(temporaryCodeInfo.newEmail).to.equal('user@example.net');
      expect(temporaryCodeInfo.action).to.equal('update-email');
      expect(temporaryCodeInfo.passwordHash).to.be.undefined;
      expect(temporaryCodeInfo.code).to.be.a('string');

      await expect('SendEmailJob').to.have.been.performed.withJobsCount(1);
    });

    it('throws UserNotAuthorizedToUpdateEmailError if user does not have an email', async function () {
      // given
      const newEmail = 'new-email@example.net';
      const password = 'invalid-password';
      const locale = 'fr';
      const user = databaseBuilder.factory.buildUser.withRawPassword({ email: null });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.sendVerificationCode)({
        action: 'update-email',
        userId: user.id,
        newEmail,
        password,
        locale,
      });

      // then
      expect(error).to.be.an.instanceOf(UserNotAuthorizedToUpdateEmailError);
      await expect('SendEmailJob').to.have.been.performed.withJobsCount(0);
    });

    it('throws InvalidOrAlreadyUsedEmailError if email already exists', async function () {
      // given
      const alreadyUsedEmail = 'used-email@example.net';
      const password = 'pix123';
      const locale = 'fr';
      databaseBuilder.factory.buildUser({ email: alreadyUsedEmail });
      const user = databaseBuilder.factory.buildUser.withRawPassword();
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.sendVerificationCode)({
        action: 'update-email',
        userId: user.id,
        newEmail: alreadyUsedEmail,
        password,
        locale,
      });

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
      expect(error.invalidAttributes).to.deep.equal([{ attribute: 'email', message: 'INVALID_OR_ALREADY_USED_EMAIL' }]);
      await expect('SendEmailJob').to.have.been.performed.withJobsCount(0);
    });

    it('throws InvalidPasswordForUpdateEmailError if the password is invalid', async function () {
      // given
      const newEmail = 'new-email@example.net';
      const password = 'invalid-password';
      const locale = 'fr';
      const user = databaseBuilder.factory.buildUser.withRawPassword();
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.sendVerificationCode)({
        action: 'update-email',
        userId: user.id,
        newEmail,
        password,
        locale,
      });

      // then
      expect(error).to.be.an.instanceOf(InvalidPasswordForUpdateEmailError);
      await expect('SendEmailJob').to.have.been.performed.withJobsCount(0);
    });
  });

  describe("When it's an email creation action", function () {
    it('sends a verification code to the user', async function () {
      // given
      const newEmail = 'user@example.net';
      const password = 'pix123';
      const locale = 'fr';
      const user = databaseBuilder.factory.buildUser({ email: null });
      await databaseBuilder.commit();

      // when
      await usecases.sendVerificationCode({ action: 'add-email', userId: user.id, newEmail, password, locale });

      // then
      const temporaryCodeInfo = await verifyEmailTemporaryStorage.get(user.id);
      expect(temporaryCodeInfo.newEmail).to.equal('user@example.net');
      expect(temporaryCodeInfo.action).to.equal('add-email');
      expect(temporaryCodeInfo.code).to.be.a('string');

      await cryptoService.assertMatchPassword({ password, passwordHash: temporaryCodeInfo.passwordHash });

      await expect('SendEmailJob').to.have.been.performed.withJobsCount(1);
    });

    it('throws UserNotAuthorizedToUpdateEmailError if already has an email', async function () {
      // given
      const newEmail = 'new-email@example.net';
      const password = 'invalid-password';
      const locale = 'fr';
      const user = databaseBuilder.factory.buildUser.withRawPassword();
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.sendVerificationCode)({
        action: 'add-email',
        userId: user.id,
        newEmail,
        password,
        locale,
      });

      // then
      expect(error).to.be.an.instanceOf(UserNotAuthorizedToUpdateEmailError);
      await expect('SendEmailJob').to.have.been.performed.withJobsCount(0);
    });

    it('throws InvalidOrAlreadyUsedEmailError if email already exists', async function () {
      // given
      const alreadyUsedEmail = 'used-email@example.net';
      const password = 'pix123';
      const locale = 'fr';
      databaseBuilder.factory.buildUser({ email: alreadyUsedEmail });
      const user = databaseBuilder.factory.buildUser({ email: null });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.sendVerificationCode)({
        action: 'add-email',
        userId: user.id,
        newEmail: alreadyUsedEmail,
        password,
        locale,
      });

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
      expect(error.invalidAttributes).to.deep.equal([{ attribute: 'email', message: 'INVALID_OR_ALREADY_USED_EMAIL' }]);
      await expect('SendEmailJob').to.have.been.performed.withJobsCount(0);
    });
  });
});
