import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';
import { User } from '../../../../lib/domain/models/User.js';

import {
  InvalidTemporaryKeyError,
  PasswordResetDemandNotFoundError,
  UserNotFoundError,
} from '../../../../lib/domain/errors.js';

import { getUserByResetPasswordDemand } from '../../../../lib/domain/usecases/get-user-by-reset-password-demand.js';

describe('Unit | UseCase | get-user-by-reset-password-demand', function () {
  const temporaryKey = 'ABCDEF123';
  const email = 'user@example.net';

  let resetPasswordService;
  let resetPasswordDemandRepository;
  let tokenService;
  let userRepository;

  beforeEach(function () {
    resetPasswordDemandRepository = sinon.stub();
    resetPasswordService = {
      verifyDemand: sinon.stub(),
    };
    tokenService = {
      decodeIfValid: sinon.stub(),
    };
    userRepository = {
      getByEmail: sinon.stub(),
    };

    resetPasswordService.verifyDemand.resolves({ email });
  });

  it('should return a User with email', async function () {
    // given
    const user = domainBuilder.buildUser({ email });
    userRepository.getByEmail.resolves(user);

    // when
    const result = await getUserByResetPasswordDemand({
      temporaryKey,
      resetPasswordService,
      resetPasswordDemandRepository,
      tokenService,
      userRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(User);
    expect(resetPasswordService.verifyDemand).to.have.been.calledWithExactly(
      temporaryKey,
      resetPasswordDemandRepository,
    );
    expect(tokenService.decodeIfValid).to.have.been.calledWithExactly(temporaryKey);
    expect(userRepository.getByEmail).to.have.been.calledWithExactly(email);
  });

  it('should throw InvalidTemporaryKeyError if TemporaryKey is invalid', async function () {
    // given
    tokenService.decodeIfValid.rejects(new InvalidTemporaryKeyError());

    // when
    const error = await catchErr(getUserByResetPasswordDemand)({
      temporaryKey,
      resetPasswordService,
      tokenService,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(InvalidTemporaryKeyError);
  });

  it('should throw PasswordResetDemandNotFoundError if ResetPasswordDemand does not exist', async function () {
    // given
    resetPasswordService.verifyDemand.throws(new PasswordResetDemandNotFoundError());

    // when
    const error = await catchErr(getUserByResetPasswordDemand)({
      temporaryKey,
      resetPasswordService,
      tokenService,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(PasswordResetDemandNotFoundError);
  });

  it('should throw UserNotFoundError if user with the email does not exist', async function () {
    // given
    userRepository.getByEmail.throws(new UserNotFoundError());

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
