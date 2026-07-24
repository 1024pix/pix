import sinon from 'sinon';

import {
  PasswordResetDemandNotFoundError,
  RevokedPasswordCannotBeReusedError,
} from '../../../../../src/identity-access-management/domain/errors.js';
import { resetPasswordService } from '../../../../../src/identity-access-management/domain/services/reset-password.service.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { config } from '../../../../../src/shared/config.js';
import {
  InvalidTemporaryKeyError,
  UserNotAuthorizedToUpdatePasswordError,
} from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Identity Access Management | Domain | UseCase | update-user-password', function () {
  context('when user has no email', function () {
    it('throws a UserNotAuthorizedToUpdatePasswordError', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ email: null }).id;

      await databaseBuilder.commit();

      const newPassword = 'example-of-a-new-password';
      const temporaryKey = 'some-temporary-key';

      // when
      const error = await catchErr(usecases.updateUserPassword)({
        password: newPassword,
        userId,
        temporaryKey,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToUpdatePasswordError);
    });
  });

  context('when the temporaryKey is invalid', function () {
    it('throws an InvalidTemporaryKeyError', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const newPassword = 'example-of-a-new-password';
      const temporaryKey = 'some-invalid-temporary-key';

      // when
      const error = await catchErr(usecases.updateUserPassword)({
        password: newPassword,
        userId,
        temporaryKey,
      });

      // then
      expect(error).to.be.an.instanceOf(InvalidTemporaryKeyError);
    });
  });

  context('when the password reset demand is expired (when the temporaryKey is expired)', function () {
    it('throws an InvalidTemporaryKeyError', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const userId = user.id;
      const email = user.email;

      sinon.stub(config.passwordResetDemand, 'lifespan').value(0);
      const temporaryKey = await resetPasswordService.generateTemporaryKey();
      databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });

      await databaseBuilder.commit();

      const newPassword = 'example-of-a-new-password';

      // when
      const error = await catchErr(usecases.updateUserPassword)({
        password: newPassword,
        userId,
        temporaryKey,
      });

      // then
      expect(error).to.be.an.instanceOf(InvalidTemporaryKeyError);
    });
  });

  context('when user has no current password reset demand', function () {
    it('throws a PasswordResetDemandNotFoundError', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();

      const newPassword = 'example-of-a-new-password';

      const temporaryKey = await resetPasswordService.generateTemporaryKey();

      // when
      const error = await catchErr(usecases.updateUserPassword)({
        password: newPassword,
        userId,
        temporaryKey,
      });

      // then
      expect(error).to.be.an.instanceOf(PasswordResetDemandNotFoundError);
    });
  });

  context('when user has a revokedHashedPassword', function () {
    context('when the given password is the same as the previous password', function () {
      it('throws a RevokedPasswordCannotBeReusedError', async function () {
        // given
        const initialPassword = 'example-of-a-valid-password-az-AZ-01234';
        const temporaryKey = await resetPasswordService.generateTemporaryKey();
        const user = databaseBuilder.factory.buildUser.withRawPassword({ rawPassword: initialPassword });
        const userId = user.id;
        const email = user.email;

        await databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });

        await databaseBuilder.commit();

        await usecases.revokeAccessForUsers({ userIds: [userId] });

        const newPassword = initialPassword;

        // when
        const error = await catchErr(usecases.updateUserPassword)({
          password: newPassword,
          userId,
          temporaryKey,
        });

        // then
        expect(error).to.be.an.instanceOf(RevokedPasswordCannotBeReusedError);
      });
    });
  });

  it('changes user password with a hashed password', async function () {
    // given
    const user = databaseBuilder.factory.buildUser();
    const userId = user.id;
    const email = user.email;
    const initialHashedPassword = 'example-of-an-hashed-password';
    const authenticationMethod =
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId,
        hashedPassword: initialHashedPassword,
      });

    const temporaryKey = await resetPasswordService.generateTemporaryKey();
    await databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });

    await databaseBuilder.commit();

    const newPassword = 'example-of-a-new-password';

    // when
    await usecases.updateUserPassword({
      password: newPassword,
      userId,
      temporaryKey,
    });

    // then
    const updatedAuthenticationMethod = await knex('authentication-methods')
      .where({ id: authenticationMethod.id })
      .first();
    expect(updatedAuthenticationMethod.authenticationComplement.password).not.to.equal(initialHashedPassword);
  });

  it('invalidates all the user’s password reset demands', async function () {
    // given
    const user = databaseBuilder.factory.buildUser.withRawPassword();
    const userId = user.id;
    const email = user.email;

    let temporaryKey;
    for (let i = 0; i < 3; i++) {
      temporaryKey = await resetPasswordService.generateTemporaryKey();
      await databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });
    }

    await databaseBuilder.commit();

    const newPassword = 'example-of-a-new-password';

    // when
    await usecases.updateUserPassword({
      password: newPassword,
      userId,
      temporaryKey,
    });

    // then
    const userPasswordResetDemands = knex('reset-password-demands').where({ email });
    const userPasswordResetDemandsAllUsed = (await userPasswordResetDemands).every(
      (passwordResetDemand) => passwordResetDemand.used,
    );
    expect(userPasswordResetDemandsAllUsed).to.be.true;
  });

  context('emailConfirmedAt', function () {
    let clock;
    const now = new Date('2002-02-02');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('is updated', async function () {
      // given
      const user = databaseBuilder.factory.buildUser.withRawPassword();
      const userId = user.id;
      const email = user.email;

      const temporaryKey = await resetPasswordService.generateTemporaryKey();
      await databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });

      await databaseBuilder.commit();

      const newPassword = 'example-of-a-new-password';

      // when
      await usecases.updateUserPassword({
        password: newPassword,
        userId,
        temporaryKey,
      });

      // then
      const account = await knex('users').where({ id: userId }).first();
      expect(account.emailConfirmedAt).to.deep.equal(now);
    });
  });
});
