const { sinon, expect, domainBuilder, catchErr } = require('../../../test-helper');

const { ForbiddenAccess, PasswordNotMatching, UserNotFoundError } = require('../../../../lib/domain/errors');

const updateExpiredPassword = require('../../../../lib/domain/usecases/update-expired-password');

describe('Unit | UseCase | update-expired-password', function () {
  const username = 'firstName.lastName0511';
  const expiredPassword = 'Password01';
  const newPassword = 'Password02';
  const hashedPassword = 'ABCDEF123';
  const userRepository = {};

  let user;

  let pixAuthenticationService;
  let encryptionService;
  let authenticationMethodRepository;

  beforeEach(function () {
    user = domainBuilder.buildUser({ username });
    const authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndRawPassword({
      userId: user.id,
      rawPassword: expiredPassword,
      shouldChangePassword: true,
    });
    user.authenticationMethods = [authenticationMethod];

    pixAuthenticationService = {
      getUserByUsernameAndPassword: sinon.stub(),
    };
    encryptionService = {
      hashPassword: sinon.stub(),
    };
    authenticationMethodRepository = {
      updateExpiredPassword: sinon.stub(),
    };

    pixAuthenticationService.getUserByUsernameAndPassword.resolves(user);
    encryptionService.hashPassword.resolves(hashedPassword);
  });

  it('should update user password with a hashed password', async function () {
    // when
    await updateExpiredPassword({
      expiredPassword,
      newPassword,
      username,
      pixAuthenticationService,
      encryptionService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    sinon.assert.calledOnce(pixAuthenticationService.getUserByUsernameAndPassword);
    sinon.assert.calledOnce(encryptionService.hashPassword);
    sinon.assert.calledWith(authenticationMethodRepository.updateExpiredPassword, {
      userId: user.id,
      hashedPassword,
    });
  });

  context('When credentials are invalid', function () {
    it('should throw UserNotFoundError when username is unknow', async function () {
      // given
      pixAuthenticationService.getUserByUsernameAndPassword.rejects(new UserNotFoundError());

      // when
      const error = await catchErr(updateExpiredPassword)({
        expiredPassword,
        newPassword,
        username,
        pixAuthenticationService,
        encryptionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserNotFoundError);
    });

    it('should throw PasswordNotMatching when expiredPassword is invalid', async function () {
      // given
      pixAuthenticationService.getUserByUsernameAndPassword.rejects(new PasswordNotMatching());

      // when
      const error = await catchErr(updateExpiredPassword)({
        expiredPassword,
        newPassword,
        username,
        pixAuthenticationService,
        encryptionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(PasswordNotMatching);
    });
  });

  context('When changing password is not required', function () {
    it('should throw ForbiddenAccess when shouldChangePassword is false', async function () {
      // given
      const authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndRawPassword({
        userId: user.id,
        rawPassword: expiredPassword,
        shouldChangePassword: false,
      });
      user.authenticationMethods = [authenticationMethod];

      pixAuthenticationService.getUserByUsernameAndPassword.resolves(user);

      // when
      const error = await catchErr(updateExpiredPassword)({
        expiredPassword,
        newPassword,
        username,
        pixAuthenticationService,
        encryptionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(ForbiddenAccess);
    });
  });
});
