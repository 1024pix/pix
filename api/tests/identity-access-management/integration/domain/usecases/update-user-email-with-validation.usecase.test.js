import { expect } from 'chai';

import { EventLoggingJob } from '../../../../../src/identity-access-management/domain/models/jobs/EventLoggingJob.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { userEmailRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/user-email.repository.js';
import {
  AlreadyRegisteredEmailError,
  EmailModificationDemandNotFoundOrExpiredError,
  InvalidVerificationCodeError,
  UserNotAuthorizedToUpdateEmailError,
} from '../../../../../src/shared/domain/errors.js';
import { temporaryStorage } from '../../../../../src/shared/infrastructure/temporary-storage/index.js';
import { catchErr, databaseBuilder, knex, sinon } from '../../../../test-helper.js';

const verifyEmailTemporaryStorage = temporaryStorage.withPrefix('verify-email:');

describe('Integration | Identity Access Management | Domain | UseCase | updateUserEmailWithValidation', function () {
  let clock;
  const now = new Date('2024-12-25');

  beforeEach(function () {
    verifyEmailTemporaryStorage.flushAll();
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(async function () {
    clock.restore();
  });

  it('updates the user email checking the verification code', async function () {
    // given
    const code = 123;
    const newEmail = 'new.email@example.net';
    const user = databaseBuilder.factory.buildUser({ email: 'email@example.net' });
    await databaseBuilder.commit();
    await userEmailRepository.saveEmailModificationDemand({ userId: user.id, code, newEmail });

    // when
    const result = await usecases.updateUserEmailWithValidation({ userId: user.id, code, newEmail });

    // then
    expect(result.email).to.equal(newEmail);

    const updatedUser = await knex('users').where({ id: user.id }).first();
    expect(updatedUser.email).to.equal(newEmail);
    expect(updatedUser.emailConfirmedAt).to.not.be.null;

    await expect(EventLoggingJob.name).to.have.been.performed.withJobPayload({
      client: 'PIX_APP',
      action: 'EMAIL_CHANGED',
      role: 'USER',
      userId: user.id,
      targetUserId: user.id,
      data: { oldEmail: 'email@example.net', newEmail: 'new.email@example.net' },
      occurredAt: '2024-12-25T00:00:00.000Z',
    });
  });

  context('when the verification code is invalid', function () {
    it('throws an error', async function () {
      // given
      const code = 123;
      const invalidCode = 456;
      const newEmail = 'new.email@example.net';
      const user = databaseBuilder.factory.buildUser({ email: 'email@example.net' });
      await databaseBuilder.commit();
      await userEmailRepository.saveEmailModificationDemand({ userId: user.id, code, newEmail });

      // when
      const error = await catchErr(usecases.updateUserEmailWithValidation)({
        userId: user.id,
        code: invalidCode,
        newEmail,
      });

      // then
      expect(error).to.be.instanceOf(InvalidVerificationCodeError);
    });
  });

  context('when the email modification demand is not found or expired', function () {
    it('throws an error', async function () {
      // given
      const code = 123;
      const newEmail = 'new.email@example.net';
      const user = databaseBuilder.factory.buildUser({ email: 'email@example.net' });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.updateUserEmailWithValidation)({
        userId: user.id,
        code,
        newEmail,
      });

      // then
      expect(error).to.be.instanceOf(EmailModificationDemandNotFoundOrExpiredError);
    });
  });

  context('when the user has no email', function () {
    it('throws an error', async function () {
      // given
      const code = 123;
      const newEmail = 'new.email@example.net';
      const user = databaseBuilder.factory.buildUser({ email: null });
      await databaseBuilder.commit();
      await userEmailRepository.saveEmailModificationDemand({ userId: user.id, code, newEmail });

      // when
      const error = await catchErr(usecases.updateUserEmailWithValidation)({
        userId: user.id,
        code,
        newEmail,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToUpdateEmailError);
    });
  });

  context('when the new email is already registered for an other user', function () {
    it('throws an error', async function () {
      // given
      const code = 123;
      const alreadyExistEmail = 'already.exist.email@example.net';
      const user = databaseBuilder.factory.buildUser({ email: 'email@example.net' });
      databaseBuilder.factory.buildUser({ email: alreadyExistEmail });
      await databaseBuilder.commit();
      await userEmailRepository.saveEmailModificationDemand({ userId: user.id, code, newEmail: alreadyExistEmail });

      // when
      const error = await catchErr(usecases.updateUserEmailWithValidation)({
        userId: user.id,
        code,
        newEmail: alreadyExistEmail,
      });

      // then
      expect(error).to.be.instanceOf(AlreadyRegisteredEmailError);
    });
  });
});
