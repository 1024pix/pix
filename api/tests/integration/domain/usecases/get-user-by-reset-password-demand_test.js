import { catchErr, expect, databaseBuilder } from '../../../test-helper.js';

import * as resetPasswordService from '../../../../lib/domain/services/reset-password-service.js';
import { tokenService } from '../../../../src/shared/domain/services/token-service.js';

import * as userRepository from '../../../../src/shared/infrastructure/repositories/user-repository.js';

import { User } from '../../../../lib/domain/models/User.js';

import { PasswordResetDemandNotFoundError, UserNotFoundError } from '../../../../lib/domain/errors.js';

import { getUserByResetPasswordDemand } from '../../../../lib/domain/usecases/get-user-by-reset-password-demand.js';
import { InvalidTemporaryKeyError } from '../../../../src/shared/domain/errors.js';

describe('Integration | UseCases | get-user-by-reset-password-demand', function () {
  const email = 'user@example.net';

  let temporaryKey;

  beforeEach(async function () {
    databaseBuilder.factory.buildUser({ email });
    await databaseBuilder.commit();
  });

  it('should return an user', async function () {
    // given
    temporaryKey = resetPasswordService.generateTemporaryKey();
    databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });
    await databaseBuilder.commit();

    // when
    const foundUser = await getUserByResetPasswordDemand({
      temporaryKey,
      resetPasswordService,
      tokenService,
      userRepository,
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
    });

    // then
    expect(error).to.be.an.instanceOf(InvalidTemporaryKeyError);
  });

  it('should throws PasswordResetDemandNotFoundError if resetPasswordDemand does not exist', async function () {
    // given
    const unknownTemporaryKey = resetPasswordService.generateTemporaryKey();

    // when
    const error = await catchErr(getUserByResetPasswordDemand)({
      temporaryKey: unknownTemporaryKey,
      resetPasswordService,
      tokenService,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(PasswordResetDemandNotFoundError);
  });

  it('should throws UserNotFoundError if user with email does not exist', async function () {
    // given
    temporaryKey = resetPasswordService.generateTemporaryKey();
    databaseBuilder.factory.buildResetPasswordDemand({ temporaryKey });

    await databaseBuilder.commit();

    // when
    const error = await catchErr(getUserByResetPasswordDemand)({
      temporaryKey,
      resetPasswordService,
      tokenService,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(UserNotFoundError);
  });
});
