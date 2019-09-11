const updateUserPassword = require('../../../../lib/domain/usecases/update-user-password');

const { sinon, expect } = require('../../../test-helper');

const User = require('../../../../lib/domain/models/User');

const validationErrorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');

const resetPasswordService = require('../../../../lib/domain/services/reset-password-service');
const encryptionService = require('../../../../lib/domain/services/encryption-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

const { PasswordResetDemandNotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | update-user-password', () => {

  const userId = 1;
  const user = new User({
    id: userId,
    email: 'maryz@acme.xh',
  });
  const password = '123ASXCG';
  const temporaryKey = 'good-temporary-key';

  beforeEach(() => {
    sinon.stub(resetPasswordService, 'hasUserAPasswordResetDemandInProgress').throws();
    sinon.stub(resetPasswordService, 'invalidOldResetPasswordDemand');
    sinon.stub(validationErrorSerializer, 'serialize');
    sinon.stub(userRepository, 'updatePassword');
    sinon.stub(userRepository, 'get').resolves(user);
    sinon.stub(encryptionService, 'hashPassword');
  });

  it('should get user by his id', () => {
    // given

    resetPasswordService.hasUserAPasswordResetDemandInProgress
      .withArgs(user.email, temporaryKey)
      .resolves();

    // when
    const promise = updateUserPassword({
      userId,
      password,
      temporaryKey,
      encryptionService,
      resetPasswordService,
      userRepository
    });

    // then
    return promise.then(() => {
      sinon.assert.calledOnce(userRepository.get);
      sinon.assert.calledWith(userRepository.get, userId);
    });
  });

  it('should check if user has a current password reset demand', () => {
    // given
    resetPasswordService.hasUserAPasswordResetDemandInProgress
      .withArgs(user.email, temporaryKey)
      .resolves();

    // when
    const promise = updateUserPassword({
      userId,
      password,
      temporaryKey,
      encryptionService,
      resetPasswordService,
      userRepository
    });

    // then
    return promise.then(() => {
      sinon.assert.calledOnce(resetPasswordService.hasUserAPasswordResetDemandInProgress);
      sinon.assert.calledWith(resetPasswordService.hasUserAPasswordResetDemandInProgress, user.email);
    });
  });

  it('should update user password with a hashed password', async () => {
    // given
    resetPasswordService.hasUserAPasswordResetDemandInProgress
      .withArgs(user.email, temporaryKey)
      .resolves();
    const encryptedPassword = '$2a$05$jJnoQ/YCvAChJmYW9AoQXe/k17mx2l2MqJBgXVo/R/ju4HblB2iAe';
    encryptionService.hashPassword.resolves(encryptedPassword);

    // when
    const promise = updateUserPassword({
      userId,
      password,
      temporaryKey,
      encryptionService,
      resetPasswordService,
      userRepository
    });

    // then
    return promise.then(() => {
      sinon.assert.calledOnce(userRepository.updatePassword);
      sinon.assert.calledOnce(encryptionService.hashPassword);
      sinon.assert.calledWith(encryptionService.hashPassword, password);
      sinon.assert.calledWith(userRepository.updatePassword, userId, encryptedPassword);
    });
  });

  it('should invalidate current password reset demand (mark as being used)', () => {
    // given
    resetPasswordService.hasUserAPasswordResetDemandInProgress
      .withArgs(user.email, temporaryKey)
      .resolves();
    userRepository.updatePassword.resolves();
    resetPasswordService.invalidOldResetPasswordDemand.resolves();

    // when
    const promise = updateUserPassword({
      userId,
      password,
      temporaryKey,
      encryptionService,
      resetPasswordService,
      userRepository
    });

    // then
    return promise.then(() => {
      sinon.assert.calledOnce(resetPasswordService.invalidOldResetPasswordDemand);
      sinon.assert.calledWith(resetPasswordService.invalidOldResetPasswordDemand, user.email);
    });
  });

  describe('When user has not a current password reset demand', () => {
    it('should return PasswordResetDemandNotFoundError', () => {
      // given
      const error = new PasswordResetDemandNotFoundError();
      resetPasswordService.hasUserAPasswordResetDemandInProgress
        .withArgs(user.email, temporaryKey)
        .rejects(error);

      // when
      const promise = updateUserPassword({
        userId,
        password,
        temporaryKey,
        encryptionService,
        resetPasswordService,
        userRepository
      });

      // then
      return expect(promise).to.have.been.rejectedWith(PasswordResetDemandNotFoundError);
    });
  });

  describe('When user has not a matching password reset demand', () => {
    it('should return PasswordResetDemandNotFoundError', () => {
      // given
      const error = new PasswordResetDemandNotFoundError();
      resetPasswordService.hasUserAPasswordResetDemandInProgress
        .withArgs(user.email, temporaryKey)
        .rejects(error);

      // when
      const promise = updateUserPassword({
        userId,
        password,
        temporaryKey,
        encryptionService,
        resetPasswordService,
        userRepository
      });

      // then
      return expect(promise).to.have.been.rejectedWith(PasswordResetDemandNotFoundError);
    });
  });

});
