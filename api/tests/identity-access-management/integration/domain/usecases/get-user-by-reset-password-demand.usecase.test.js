import { PasswordResetDemandNotFoundError, UserNotFoundError } from '../../../../../lib/domain/errors.js';
import { User } from '../../../../../src/identity-access-management/domain/models/User.js';
import { resetPasswordService } from '../../../../../src/identity-access-management/domain/services/reset-password.service.js';
import { getUserByResetPasswordDemand } from '../../../../../src/identity-access-management/domain/usecases/get-user-by-reset-password-demand.usecase.js';
import { resetPasswordDemandRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/reset-password-demand.repository.js';
import * as userRepository from '../../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import { InvalidTemporaryKeyError } from '../../../../../src/shared/domain/errors.js';
import { tokenService } from '../../../../../src/shared/domain/services/token-service.js';
import { catchErr, databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Domain | UseCase | getUserByResetPasswordDemand', function () {
  const email = 'user@example.net';

  let temporaryKey;

  beforeEach(async function () {
    databaseBuilder.factory.buildUser({ email });
    await databaseBuilder.commit();
  });

  it('should return an user', async function () {
    // given
    temporaryKey = await resetPasswordService.generateTemporaryKey();
    databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });
    await databaseBuilder.commit();

    // when
    const foundUser = await getUserByResetPasswordDemand({
      temporaryKey,
      resetPasswordService,
      tokenService,
      userRepository,
      resetPasswordDemandRepository,
    });

    // then
    expect(foundUser).to.be.an.instanceOf(User);
    expect(foundUser.email).to.equal(email);
  });

  it('should throws InvalidTemporaryKeyError if temporaryKey is invalid', async function () {
    // when
    const error = await catchErr(getUserByResetPasswordDemand)({
      temporaryKey: 'INVALIDKEY',
      resetPasswordService,
      tokenService,
      userRepository,
      resetPasswordDemandRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(InvalidTemporaryKeyError);
  });

  it('should throws PasswordResetDemandNotFoundError if resetPasswordDemand does not exist', async function () {
    // given
    const unknownTemporaryKey = await resetPasswordService.generateTemporaryKey();

    // when
    const error = await catchErr(getUserByResetPasswordDemand)({
      temporaryKey: unknownTemporaryKey,
      resetPasswordService,
      tokenService,
      userRepository,
      resetPasswordDemandRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(PasswordResetDemandNotFoundError);
  });

  it('should throws UserNotFoundError if user with email does not exist', async function () {
    // given
    temporaryKey = await resetPasswordService.generateTemporaryKey();
    databaseBuilder.factory.buildResetPasswordDemand({ temporaryKey });

    await databaseBuilder.commit();

    // when
    const error = await catchErr(getUserByResetPasswordDemand)({
      temporaryKey,
      resetPasswordService,
      tokenService,
      userRepository,
      resetPasswordDemandRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(UserNotFoundError);
  });
});
