import sinon from 'sinon';

import { PasswordResetDemandNotFoundError } from '../../../../../src/identity-access-management/domain/errors.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { UserNotAuthorizedToUpdatePasswordError } from '../../../../../src/shared/domain/errors.js';
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

  context('when user has no current password reset demand', function () {
    it('throws a PasswordResetDemandNotFoundError', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
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
      expect(error).to.be.an.instanceOf(PasswordResetDemandNotFoundError);
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

    const newPassword = 'example-of-a-new-password';
    const temporaryKey = 'some-temporary-key';
    await databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });

    await databaseBuilder.commit();

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

    const newPassword = 'example-of-a-new-password';
    let temporaryKey;
    for (let i = 0; i < 3; i++) {
      temporaryKey = `some-temporary-key-${i}`;
      await databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });
    }

    await databaseBuilder.commit();

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

      const newPassword = 'example-of-a-new-password';
      const temporaryKey = 'some-temporary-key';
      await databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });

      await databaseBuilder.commit();

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
