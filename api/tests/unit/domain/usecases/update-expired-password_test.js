const { sinon, expect, domainBuilder, catchErr } = require('../../../test-helper');

const authenticationService = require('../../../../lib/domain/services/authentication-service');
const encryptionService = require('../../../../lib/domain/services/encryption-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

const { UserNotFoundError, PasswordNotMatching, ForbiddenAccess } = require('../../../../lib/domain/errors');

const updateExpiredPassword = require('../../../../lib/domain/usecases/update-expired-password');

describe('Unit | UseCase | update-expired-password', () => {

  const hashedNewPassword = '$2a$05$jJnoQ/YCvAChJmYW9AoQXe/k17mx2l2MqJBgXVo/R/ju4HblB2iAe';
  const expiredPassword = 'Password01';
  const newPassword = 'Password02';

  let username;
  let user;

  beforeEach(() => {
    username = 'firstName.lastName0511';
    user = domainBuilder.buildUser({ username, expiredPassword, shouldChangePassword: true });

    sinon.stub(authenticationService, 'getUserByUsernameAndPassword');
    sinon.stub(encryptionService, 'hashPassword');
    sinon.stub(userRepository, 'updateExpiredPassword');

    authenticationService.getUserByUsernameAndPassword.resolves(user);
    encryptionService.hashPassword.resolves(hashedNewPassword);
  });

  it('should update user password with a hashed password', async () => {
    // when
    await updateExpiredPassword({ username, expiredPassword, newPassword, userRepository });

    // then
    sinon.assert.calledOnce(authenticationService.getUserByUsernameAndPassword);
    sinon.assert.calledOnce(encryptionService.hashPassword);
    sinon.assert.calledWith(userRepository.updateExpiredPassword, { userId: user.id, hashedNewPassword });
  });

  context('When credentials are invalid', () => {

    it('should throw UserNotFoundError when username is unknow', async () => {
      // given
      authenticationService.getUserByUsernameAndPassword.rejects(new UserNotFoundError());

      // when
      const error = await catchErr(updateExpiredPassword)({ username, expiredPassword, newPassword, userRepository });

      // then
      expect(error).to.be.instanceOf(UserNotFoundError);
    });

    it('should throw PasswordNotMatching when expiredPassword is invalid', async () => {
      // given
      authenticationService.getUserByUsernameAndPassword.rejects(new PasswordNotMatching());

      // when
      const error = await catchErr(updateExpiredPassword)({ username, expiredPassword, newPassword, userRepository });

      // then
      expect(error).to.be.instanceOf(PasswordNotMatching);
    });
  });

  context('When changing password is not required', () => {

    it('should throw ForbiddenAccess when shouldChangePassword is false', async () => {
      // given
      username = 'firstName.lastName0510';
      user = domainBuilder.buildUser({ username, expiredPassword, shouldChangePassword: false });
      authenticationService.getUserByUsernameAndPassword.resolves(user);

      // when
      const error = await catchErr(updateExpiredPassword)({ username, expiredPassword, newPassword, userRepository });

      // then
      expect(error).to.be.instanceOf(ForbiddenAccess);
    });
  });

});
