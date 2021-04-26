const { catchErr, expect, sinon } = require('../../../test-helper');

const User = require('../../../../lib/domain/models/User');
const { PasswordResetDemandNotFoundError, UserNotAuthorizedToUpdatePasswordError } = require('../../../../lib/domain/errors');

const validationErrorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');

const updateUserPassword = require('../../../../lib/domain/usecases/update-user-password');

describe('Unit | UseCase | update-user-password', () => {

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

  beforeEach(() => {
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
    resetPasswordService.hasUserAPasswordResetDemandInProgress
      .withArgs(user.email, temporaryKey)
      .resolves();
    resetPasswordService.invalidateOldResetPasswordDemand.resolves();

    authenticationMethodRepository.updateChangedPassword.resolves();
    userRepository.get.resolves(user);
  });

  it('should get user by his id', async () => {
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

  it('should throw a UserNotAuthorizedToUpdatePasswordError when user does not have an email', async () => {
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

  it('should check if user has a current password reset demand', async () => {
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
    expect(resetPasswordService.hasUserAPasswordResetDemandInProgress)
      .to.have.been.calledWith(user.email);
  });

  it('should update user password with a hashed password', async () => {
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

  it('should invalidate current password reset demand (mark as being used)', async () => {
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
    expect(resetPasswordService.invalidateOldResetPasswordDemand)
      .to.have.been.calledWith(user.email);
  });

  describe('When user has not a current password reset demand', () => {

    it('should return PasswordResetDemandNotFoundError', async () => {
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
