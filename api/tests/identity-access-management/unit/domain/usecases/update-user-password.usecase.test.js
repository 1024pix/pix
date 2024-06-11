import { PasswordResetDemandNotFoundError } from '../../../../../lib/domain/errors.js';
import { updateUserPassword } from '../../../../../src/identity-access-management/domain/usecases/update-user-password.usecase.js';
import { UserNotAuthorizedToUpdatePasswordError } from '../../../../../src/shared/domain/errors.js';
import { User } from '../../../../../src/shared/domain/models/User.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | update-user-password', function () {
  const userId = 1;
  const user = new User({
    id: userId,
    email: 'maryz@acme.xh',
  });
  const password = '123ASXCG';
  const temporaryKey = 'good-temporary-key';

  let cryptoService;
  let resetPasswordService;
  let authenticationMethodRepository;
  let userRepository;

  beforeEach(function () {
    cryptoService = {
      hashPassword: sinon.stub(),
    };
    resetPasswordService = {
      hasUserAPasswordResetDemandInProgress: sinon.stub(),
      invalidateOldResetPasswordDemand: sinon.stub(),
    };
    authenticationMethodRepository = {
      updateChangedPassword: sinon.stub(),
    };
    userRepository = {
      get: sinon.stub(),
    };

    cryptoService.hashPassword.resolves();
    resetPasswordService.hasUserAPasswordResetDemandInProgress.withArgs(user.email, temporaryKey).resolves();
    resetPasswordService.invalidateOldResetPasswordDemand.resolves();

    authenticationMethodRepository.updateChangedPassword.resolves();
    userRepository.get.resolves(user);
  });

  it('should get user by his id', async function () {
    // when
    await updateUserPassword({
      password,
      userId,
      temporaryKey,
      cryptoService,
      resetPasswordService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(userRepository.get).to.have.been.calledWithExactly(userId);
  });

  it('should throw a UserNotAuthorizedToUpdatePasswordError when user does not have an email', async function () {
    // given
    userRepository.get.resolves({ email: undefined });

    // when
    const error = await catchErr(updateUserPassword)({
      password,
      userId,
      temporaryKey,
      cryptoService,
      resetPasswordService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToUpdatePasswordError);
  });

  it('should check if user has a current password reset demand', async function () {
    // when
    await updateUserPassword({
      password,
      userId,
      temporaryKey,
      cryptoService,
      resetPasswordService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(resetPasswordService.hasUserAPasswordResetDemandInProgress).to.have.been.calledWithExactly(
      user.email,
      temporaryKey,
    );
  });

  it('should update user password with a hashed password', async function () {
    const hashedPassword = 'ABCD1234';
    cryptoService.hashPassword.resolves(hashedPassword);

    // when
    await updateUserPassword({
      password,
      userId,
      temporaryKey,
      cryptoService,
      resetPasswordService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(cryptoService.hashPassword).to.have.been.calledWithExactly(password);
    expect(authenticationMethodRepository.updateChangedPassword).to.have.been.calledWithExactly({
      userId,
      hashedPassword,
    });
  });

  it('should invalidate current password reset demand (mark as being used)', async function () {
    // when
    await updateUserPassword({
      password,
      userId,
      temporaryKey,
      cryptoService,
      resetPasswordService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(resetPasswordService.invalidateOldResetPasswordDemand).to.have.been.calledWithExactly(user.email);
  });

  describe('When user has not a current password reset demand', function () {
    it('should return PasswordResetDemandNotFoundError', async function () {
      // given
      resetPasswordService.hasUserAPasswordResetDemandInProgress
        .withArgs(user.email, temporaryKey)
        .rejects(new PasswordResetDemandNotFoundError());

      // when
      const error = await catchErr(updateUserPassword)({
        password,
        userId,
        temporaryKey,
        cryptoService,
        resetPasswordService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(PasswordResetDemandNotFoundError);
    });
  });
});
