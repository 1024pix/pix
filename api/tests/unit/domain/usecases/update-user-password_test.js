import { catchErr, expect, sinon } from '../../../test-helper';
import User from '../../../../lib/domain/models/User';
import {
  PasswordResetDemandNotFoundError,
  UserNotAuthorizedToUpdatePasswordError,
} from '../../../../lib/domain/errors';
import validationErrorSerializer from '../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer';
import updateUserPassword from '../../../../lib/domain/usecases/update-user-password';

describe('Unit | UseCase | update-user-password', function () {
  const userId = 1;
  const user = new User({
    id: userId,
    email: 'maryz@acme.xh',
  });
  const password = '123ASXCG';
  const temporaryKey = 'good-temporary-key';

  let encryptionService;
  let resetPasswordService;
  let authenticationMethodRepository;
  let userRepository;

  beforeEach(function () {
    encryptionService = {
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

    sinon.stub(validationErrorSerializer, 'serialize');

    encryptionService.hashPassword.resolves();
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
      encryptionService,
      resetPasswordService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(userRepository.get).to.have.been.calledWith(userId);
  });

  it('should throw a UserNotAuthorizedToUpdatePasswordError when user does not have an email', async function () {
    // given
    userRepository.get.resolves({ email: undefined });

    // when
    const error = await catchErr(updateUserPassword)({
      password,
      userId,
      temporaryKey,
      encryptionService,
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
      encryptionService,
      resetPasswordService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(resetPasswordService.hasUserAPasswordResetDemandInProgress).to.have.been.calledWith(user.email);
  });

  it('should update user password with a hashed password', async function () {
    const hashedPassword = 'ABCD1234';
    encryptionService.hashPassword.resolves(hashedPassword);

    // when
    await updateUserPassword({
      password,
      userId,
      temporaryKey,
      encryptionService,
      resetPasswordService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(encryptionService.hashPassword).to.have.been.calledWith(password);
    expect(authenticationMethodRepository.updateChangedPassword).to.have.been.calledWith({
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
      encryptionService,
      resetPasswordService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(resetPasswordService.invalidateOldResetPasswordDemand).to.have.been.calledWith(user.email);
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
        encryptionService,
        resetPasswordService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(PasswordResetDemandNotFoundError);
    });
  });
});
