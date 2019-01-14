const updateUserPassword = require('../../../../lib/domain/usecases/update-user-password');

const { sinon, expect } = require('../../../test-helper');

const BookshelfUser = require('../../../../lib/infrastructure/data/user');

const validationErrorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');

const resetPasswordService = require('../../../../lib/domain/services/reset-password-service');
const encryptionService = require('../../../../lib/domain/services/encryption-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

const { PasswordResetDemandNotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | update-user-password', () => {

  const userId = 1;
  const user = new BookshelfUser({
    id: userId,
    email: 'maryz@acme.xh',
  });
  const password = '123ASXCG';

  beforeEach(() => {
    sinon.stub(resetPasswordService, 'hasUserAPasswordResetDemandInProgress');
    sinon.stub(resetPasswordService, 'invalidOldResetPasswordDemand');
    sinon.stub(validationErrorSerializer, 'serialize');
    sinon.stub(userRepository, 'updatePassword');
    sinon.stub(userRepository, 'findUserById').resolves(user);
    sinon.stub(encryptionService, 'hashPassword');
  });

  it('should get user by his id', () => {
    // given

    resetPasswordService.hasUserAPasswordResetDemandInProgress.resolves();

    // when
    const promise = updateUserPassword({
      userId,
      password,
      encryptionService,
      resetPasswordService,
      userRepository
    });

    // then
    return promise.then(() => {
      sinon.assert.calledOnce(userRepository.findUserById);
      sinon.assert.calledWith(userRepository.findUserById, userId);
    });
  });

  it('should check if user has a current password reset demand', () => {
    // given
    resetPasswordService.hasUserAPasswordResetDemandInProgress.resolves();

    // when
    const promise = updateUserPassword({
      userId,
      password,
      encryptionService,
      resetPasswordService,
      userRepository
    });

    // then
    return promise.then(() => {
      sinon.assert.calledOnce(resetPasswordService.hasUserAPasswordResetDemandInProgress);
      sinon.assert.calledWith(resetPasswordService.hasUserAPasswordResetDemandInProgress, user.get('email'));
    });
  });

  it('should update user password with a hashed password', async () => {
    // given
    resetPasswordService.hasUserAPasswordResetDemandInProgress.resolves();
    const encryptedPassword = '$2a$05$jJnoQ/YCvAChJmYW9AoQXe/k17mx2l2MqJBgXVo/R/ju4HblB2iAe';
    encryptionService.hashPassword.resolves(encryptedPassword);

    // when
    const promise = updateUserPassword({
      userId,
      password,
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
    resetPasswordService.hasUserAPasswordResetDemandInProgress.resolves();
    userRepository.updatePassword.resolves();
    resetPasswordService.invalidOldResetPasswordDemand.resolves();

    // when
    const promise = updateUserPassword({
      userId,
      password,
      encryptionService,
      resetPasswordService,
      userRepository
    });

    // then
    return promise.then(() => {
      sinon.assert.calledOnce(resetPasswordService.invalidOldResetPasswordDemand);
      sinon.assert.calledWith(resetPasswordService.invalidOldResetPasswordDemand, user.get('email'));
    });
  });

  describe('When user has not a current password reset demand', () => {
    it('should returns PasswordResetDemandNotFoundError', () => {
      // given
      const error = new PasswordResetDemandNotFoundError();
      const serializedError = {};
      validationErrorSerializer.serialize.returns(serializedError);
      resetPasswordService.hasUserAPasswordResetDemandInProgress.rejects(error);

      // when
      const promise = updateUserPassword({
        userId,
        password,
        encryptionService,
        resetPasswordService,
        userRepository
      });

      // then
      return expect(promise).to.have.been.rejectedWith(PasswordResetDemandNotFoundError);
    });
  });

});
